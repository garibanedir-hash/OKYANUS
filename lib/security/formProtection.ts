import "server-only";

import crypto from "node:crypto";
import { headers } from "next/headers";

export const FORM_HONEYPOT_FIELDS = ["website", "companyWebsite"] as const;
export const FORM_STARTED_AT_FIELD = "formStartedAt";
export const FORM_SECURITY_GENERIC_ERROR = "Form gönderilirken bir sorun oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.";

type RateLimitBucket = {
  count: number;
  resetAt: number;
  lastSeenAt: number;
};

type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
};

type FormProtectionOptions = {
  form: string;
  rateLimit?: RateLimitOptions;
};

type TimingOptions = {
  minSubmitMs?: number;
  maxSubmitMs?: number;
};

const defaultRateLimit = {
  maxAttempts: 8,
  windowMs: 10 * 60 * 1000
};

const defaultTiming = {
  minSubmitMs: 2000,
  maxSubmitMs: 2 * 60 * 60 * 1000
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export class FormProtectionError extends Error {
  constructor(message: string, public code = "form_protection_failed") {
    super(message);
    this.name = "FormProtectionError";
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function cleanExpiredRateLimits(now: number) {
  if (rateLimitBuckets.size < 500) return;

  for (const [key, bucket] of Array.from(rateLimitBuckets.entries())) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function validateHoneypot(formData: FormData) {
  const filledFields = FORM_HONEYPOT_FIELDS.filter((field) => getString(formData, field).length > 0);

  return {
    trapped: filledFields.length > 0,
    filledFieldNames: filledFields
  };
}

export function validateSubmissionTiming(formData: FormData, options: TimingOptions = {}) {
  const startedAtRaw = getString(formData, FORM_STARTED_AT_FIELD);
  const startedAt = Number.parseInt(startedAtRaw, 10);
  const now = Date.now();
  const minSubmitMs = options.minSubmitMs ?? defaultTiming.minSubmitMs;
  const maxSubmitMs = options.maxSubmitMs ?? defaultTiming.maxSubmitMs;

  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return {
      ageMs: null,
      tooFast: false,
      tooOld: false,
      missing: true
    };
  }

  const ageMs = now - startedAt;

  return {
    ageMs,
    tooFast: ageMs >= 0 && ageMs < minSubmitMs,
    tooOld: ageMs > maxSubmitMs,
    missing: false
  };
}

export function getClientFingerprint(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = requestHeaders.get("x-real-ip")?.trim() ?? "";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? "";
  const language = requestHeaders.get("accept-language")?.slice(0, 120) ?? "";
  const source = [forwardedFor || realIp || "ip-not-available", userAgent || "ua-not-available", language].join("|");

  return hashValue(source).slice(0, 32);
}

export function checkBasicRateLimit(input: {
  form: string;
  fingerprint: string;
  options?: RateLimitOptions;
}) {
  const now = Date.now();
  const maxAttempts = input.options?.maxAttempts ?? defaultRateLimit.maxAttempts;
  const windowMs = input.options?.windowMs ?? defaultRateLimit.windowMs;
  const key = `${input.form}:${input.fingerprint}`;
  const current = rateLimitBuckets.get(key);

  cleanExpiredRateLimits(now);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs, lastSeenAt: now };
    rateLimitBuckets.set(key, next);
    return {
      limited: false,
      count: next.count,
      maxAttempts,
      resetAt: new Date(next.resetAt).toISOString(),
      windowSeconds: Math.round(windowMs / 1000)
    };
  }

  current.count += 1;
  current.lastSeenAt = now;
  rateLimitBuckets.set(key, current);

  return {
    limited: current.count > maxAttempts,
    count: current.count,
    maxAttempts,
    resetAt: new Date(current.resetAt).toISOString(),
    windowSeconds: Math.round(windowMs / 1000)
  };
}

export async function evaluateFormProtection(formData: FormData, options: FormProtectionOptions) {
  const requestHeaders = await headers();
  const honeypot = validateHoneypot(formData);
  const timing = validateSubmissionTiming(formData);
  const fingerprint = getClientFingerprint(requestHeaders);
  const rateLimit = checkBasicRateLimit({
    form: options.form,
    fingerprint,
    options: options.rateLimit
  });

  return {
    honeypotTrapped: honeypot.trapped,
    rateLimited: rateLimit.limited,
    metadata: buildFormSecurityMetadata({
      form: options.form,
      fingerprint,
      honeypot,
      timing,
      rateLimit,
      userAgentPresent: Boolean(requestHeaders.get("user-agent"))
    })
  };
}

export function buildFormSecurityMetadata(input: {
  form: string;
  fingerprint: string;
  honeypot: ReturnType<typeof validateHoneypot>;
  timing: ReturnType<typeof validateSubmissionTiming>;
  rateLimit: ReturnType<typeof checkBasicRateLimit>;
  userAgentPresent: boolean;
}) {
  return {
    formSecurity: {
      form: input.form,
      fingerprintHash: input.fingerprint,
      honeypotTrapped: input.honeypot.trapped,
      timing: {
        ageMs: input.timing.ageMs,
        tooFast: input.timing.tooFast,
        tooOld: input.timing.tooOld,
        missing: input.timing.missing
      },
      rateLimit: {
        limited: input.rateLimit.limited,
        count: input.rateLimit.count,
        maxAttempts: input.rateLimit.maxAttempts,
        windowSeconds: input.rateLimit.windowSeconds,
        resetAt: input.rateLimit.resetAt
      },
      userAgentPresent: input.userAgentPresent,
      checkedAt: new Date().toISOString()
    }
  };
}

export function validateTextLength(
  value: string,
  options: {
    fieldLabel: string;
    min?: number;
    max: number;
    required?: boolean;
  }
) {
  const text = value.trim();

  if (options.required && text.length === 0) {
    throw new FormProtectionError(`${options.fieldLabel} alanı zorunludur.`, "required_field");
  }

  if (text.length > 0 && options.min !== undefined && text.length < options.min) {
    throw new FormProtectionError(`${options.fieldLabel} alanı en az ${options.min} karakter olmalıdır.`, "min_length");
  }

  if (text.length > options.max) {
    throw new FormProtectionError(`${options.fieldLabel} alanı en fazla ${options.max} karakter olabilir.`, "max_length");
  }

  return text;
}

export function validateEmailFormat(value: string, options: { fieldLabel?: string; max?: number } = {}) {
  const email = validateTextLength(value.toLowerCase(), {
    fieldLabel: options.fieldLabel ?? "E-posta",
    max: options.max ?? 160,
    required: true
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new FormProtectionError("Geçerli bir e-posta adresi girilmelidir.", "invalid_email");
  }

  return email;
}

export function validatePhoneFormat(
  value: string,
  options: {
    fieldLabel?: string;
    required?: boolean;
    min?: number;
    max?: number;
  } = {}
) {
  const phone = validateTextLength(value, {
    fieldLabel: options.fieldLabel ?? "Telefon",
    min: options.required ? (options.min ?? 7) : undefined,
    max: options.max ?? 30,
    required: options.required
  });

  if (phone && !/^[+\d\s().-]+$/.test(phone)) {
    throw new FormProtectionError(`${options.fieldLabel ?? "Telefon"} alanı geçerli görünmüyor.`, "invalid_phone");
  }

  return phone;
}
