import "server-only";

import { safeLogger } from "@/lib/observability/safeLogger";

export type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
};

export type RateLimitResult = {
  limited: boolean;
  count: number;
  maxAttempts: number;
  remaining: number;
  resetAt: string;
  windowSeconds: number;
  provider: string;
  persistent: boolean;
};

export type RateLimitInput = {
  form: string;
  fingerprint: string;
  options?: RateLimitOptions;
};

export interface RateLimitProvider {
  readonly name: string;
  readonly persistent: boolean;
  check(input: RateLimitInput): Promise<RateLimitResult> | RateLimitResult;
}

type RateLimitBucket = {
  count: number;
  resetAt: number;
  lastSeenAt: number;
};

type UpstashTransactionItem = {
  result?: unknown;
  error?: string;
};

type UpstashTransactionResponse = UpstashTransactionItem[] | {
  error?: string;
};

const defaultRateLimit = {
  maxAttempts: 8,
  windowMs: 10 * 60 * 1000
};

let missingUpstashEnvWarningLogged = false;
let upstashRuntimeWarningLogged = false;

function resolveRateLimitOptions(options?: RateLimitOptions) {
  return {
    maxAttempts: options?.maxAttempts ?? defaultRateLimit.maxAttempts,
    windowMs: options?.windowMs ?? defaultRateLimit.windowMs
  };
}

function windowMsToSeconds(windowMs: number) {
  return Math.max(1, Math.ceil(windowMs / 1000));
}

function buildRateLimitKey(form: string, fingerprint: string) {
  return `form:${form}:${fingerprint}`;
}

class InMemoryRateLimitProvider implements RateLimitProvider {
  readonly name = "memory";
  readonly persistent = false;
  private readonly buckets = new Map<string, RateLimitBucket>();

  check(input: RateLimitInput): RateLimitResult {
    const now = Date.now();
    const { maxAttempts, windowMs } = resolveRateLimitOptions(input.options);
    const key = buildRateLimitKey(input.form, input.fingerprint);
    const current = this.buckets.get(key);

    this.cleanExpired(now);

    if (!current || current.resetAt <= now) {
      const next = { count: 1, resetAt: now + windowMs, lastSeenAt: now };
      this.buckets.set(key, next);
      return this.toResult(next, maxAttempts, windowMs, false);
    }

    current.count += 1;
    current.lastSeenAt = now;
    this.buckets.set(key, current);

    return this.toResult(current, maxAttempts, windowMs, current.count > maxAttempts);
  }

  private cleanExpired(now: number) {
    if (this.buckets.size < 500) return;

    for (const [key, bucket] of Array.from(this.buckets.entries())) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  private toResult(bucket: RateLimitBucket, maxAttempts: number, windowMs: number, limited: boolean): RateLimitResult {
    return {
      limited,
      count: bucket.count,
      maxAttempts,
      remaining: Math.max(0, maxAttempts - bucket.count),
      resetAt: new Date(bucket.resetAt).toISOString(),
      windowSeconds: Math.round(windowMs / 1000),
      provider: this.name,
      persistent: this.persistent
    };
  }
}

class UpstashRateLimitProvider implements RateLimitProvider {
  readonly name = "upstash";
  readonly persistent = true;

  constructor(
    private readonly restUrl: string,
    private readonly token: string
  ) {}

  async check(input: RateLimitInput): Promise<RateLimitResult> {
    const now = Date.now();
    const { maxAttempts, windowMs } = resolveRateLimitOptions(input.options);
    const windowSeconds = windowMsToSeconds(windowMs);
    const key = buildRateLimitKey(input.form, input.fingerprint);
    const response = await fetch(`${this.restUrl}/multi-exec`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds, "NX"],
        ["TTL", key]
      ]),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Upstash rate limit request failed with ${response.status}`);
    }

    const result = (await response.json()) as UpstashTransactionResponse;

    if (!Array.isArray(result)) {
      throw new Error(`Upstash rate limit transaction failed: ${result.error ?? "unexpected response"}`);
    }

    const commandError = result.find((item) => item.error)?.error;

    if (commandError) {
      throw new Error(`Upstash rate limit command failed: ${commandError}`);
    }

    const count = Number(result[0]?.result ?? 1);
    const ttl = Number(result[2]?.result ?? windowSeconds);
    const resetSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : windowSeconds;

    return {
      limited: count > maxAttempts,
      count,
      maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
      resetAt: new Date(now + resetSeconds * 1000).toISOString(),
      windowSeconds,
      provider: this.name,
      persistent: this.persistent
    };
  }
}

const memoryProvider = new InMemoryRateLimitProvider();

export function getRateLimitProvider(): RateLimitProvider {
  if (process.env.RATE_LIMIT_PROVIDER === "upstash") {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (restUrl && token) {
      return new UpstashRateLimitProvider(restUrl, token);
    }

    if (!missingUpstashEnvWarningLogged) {
      safeLogger.warn("rate-limit", "missing_upstash_env_memory_fallback", {
        provider: "upstash"
      });
      missingUpstashEnvWarningLogged = true;
    }
  }

  return memoryProvider;
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const provider = getRateLimitProvider();

  try {
    return await provider.check(input);
  } catch (error) {
    if (provider.name !== memoryProvider.name && !upstashRuntimeWarningLogged) {
      safeLogger.warn("rate-limit", "provider_failed_memory_fallback", {
        provider: provider.name,
        error
      });
      upstashRuntimeWarningLogged = true;
    }

    return memoryProvider.check(input);
  }
}
