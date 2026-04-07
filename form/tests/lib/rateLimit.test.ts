import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  rateLimit,
  clearRateLimitStore,
  rateLimitWithEviction,
} from "@/lib/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows requests under the cap", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("user-a", 10, 60_000)).toEqual({ ok: true });
    }
  });

  it("blocks after max in the same window", () => {
    const key = "user-b";
    const max = 3;
    const windowMs = 60_000;
    expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    const blocked = rateLimit(key, max, windowMs);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("resets after window expires", () => {
    vi.useFakeTimers();
    const key = "user-c";
    const max = 1;
    const windowMs = 1000;
    expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    expect(rateLimit(key, max, windowMs).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    vi.useRealTimers();
  });
});

describe("rateLimitWithEviction", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("behaves like rateLimit for normal keys", () => {
    expect(rateLimitWithEviction("k", 5, 10_000)).toEqual({ ok: true });
  });
});
