import "server-only";

import crypto from "node:crypto";
import { headers } from "next/headers";
import {
  checkRateLimit,
  type RateLimitOptions,
  type RateLimitResult
} from "@/lib/security/rateLimitProvider";

export const FORM_HONEYPOT_FIELDS = ["website", "companyWebsite"] as const;
export const FORM_STARTED_AT_FIELD = "formStartedAt";
export const FORM_SECURITY_GENERIC_ERROR = "Form gönderilirken bir sorun oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.";

type FormProtectionOptions = {
  form: string;
  rateLimit?: RateLimitOptions;
};

type TimingOptions = {
  minSubmitMs?: number;
  maxSubmitMs?: number;
};

const defaultTiming = {
  minSubmitMs: 2000,
  maxSubmitMs: 2 * 60 * 60 * 1000
};

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

export function getClientFingerprint(requestHeaders: Pick<Headers, "get">) {
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
  return checkRateLimit(input);
}

export async function evaluateFormProtection(formData: FormData, options: FormProtectionOptions) {
  const requestHeaders = await headers();
  const honeypot = validateHoneypot(formData);
  const timing = validateSubmissionTiming(formData);
  const fingerprint = getClientFingerprint(requestHeaders);
  const rateLimit = await checkBasicRateLimit({
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
  rateLimit: RateLimitResult;
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
        resetAt: input.rateLimit.resetAt,
        provider: input.rateLimit.provider,
        persistent: input.rateLimit.persistent
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
