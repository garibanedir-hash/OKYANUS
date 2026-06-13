import "server-only";

export type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
};

export type RateLimitResult = {
  limited: boolean;
  count: number;
  maxAttempts: number;
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

const defaultRateLimit = {
  maxAttempts: 8,
  windowMs: 10 * 60 * 1000
};

class InMemoryRateLimitProvider implements RateLimitProvider {
  readonly name = "memory";
  readonly persistent = false;
  private readonly buckets = new Map<string, RateLimitBucket>();

  check(input: RateLimitInput): RateLimitResult {
    const now = Date.now();
    const maxAttempts = input.options?.maxAttempts ?? defaultRateLimit.maxAttempts;
    const windowMs = input.options?.windowMs ?? defaultRateLimit.windowMs;
    const key = `${input.form}:${input.fingerprint}`;
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
      resetAt: new Date(bucket.resetAt).toISOString(),
      windowSeconds: Math.round(windowMs / 1000),
      provider: this.name,
      persistent: this.persistent
    };
  }
}

const memoryProvider = new InMemoryRateLimitProvider();

export function getRateLimitProvider(): RateLimitProvider {
  // Future providers can be selected here by env, for example Vercel KV,
  // Upstash Redis, or a Supabase RPC-backed limiter.
  return memoryProvider;
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  return getRateLimitProvider().check(input);
}
