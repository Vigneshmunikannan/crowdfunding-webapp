/**
 * Simple in-memory rate limiter (per server instance).
 * For multi-instance / serverless production, replace with Redis (Upstash, etc.).
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

/** Clears all buckets (use in tests or dev only). */
export function clearRateLimitStore(): void {
  store.clear();
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  let b = store.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 1, resetAt: now + windowMs };
    store.set(key, b);
    return { ok: true };
  }
  if (b.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    };
  }
  b.count += 1;
  return { ok: true };
}

/** Bound Map size to avoid unbounded memory in long-running dev servers */
const MAX_KEYS = 10_000;
export function rateLimitWithEviction(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  if (store.size > MAX_KEYS) {
    const cutoff = Date.now();
    for (const [k, v] of store) {
      if (v.resetAt < cutoff) store.delete(k);
    }
  }
  return rateLimit(key, max, windowMs);
}
