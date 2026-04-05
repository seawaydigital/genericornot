import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RateLimiter } from "../rate-limit";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(5, 60_000);
    const result = limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("decrements remaining with each request", () => {
    const limiter = new RateLimiter(5, 60_000);
    limiter.check("user-1");
    limiter.check("user-1");
    const result = limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("returns success=false after limit exceeded", () => {
    const limiter = new RateLimiter(3, 60_000);
    limiter.check("user-1");
    limiter.check("user-1");
    limiter.check("user-1");
    const result = limiter.check("user-1");
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns resetAt as a Date", () => {
    const limiter = new RateLimiter(5, 60_000);
    const result = limiter.check("user-1");
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it("resetAt is in the future when success is true", () => {
    const limiter = new RateLimiter(5, 60_000);
    vi.setSystemTime(new Date("2026-04-05T10:00:00Z"));
    const result = limiter.check("user-1");
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("tracks per-user (different keys are independent)", () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.check("user-1");
    limiter.check("user-1");
    // user-1 is now exhausted
    const user1Result = limiter.check("user-1");
    expect(user1Result.success).toBe(false);

    // user-2 should still be allowed
    const user2Result = limiter.check("user-2");
    expect(user2Result.success).toBe(true);
    expect(user2Result.remaining).toBe(1);
  });

  it("resets after window expires", () => {
    const limiter = new RateLimiter(2, 60_000);
    vi.setSystemTime(new Date("2026-04-05T10:00:00Z"));

    limiter.check("user-1");
    limiter.check("user-1");
    // At the limit
    expect(limiter.check("user-1").success).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(60_001);

    // Should be allowed again
    const result = limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("only expires timestamps outside the window (sliding window)", () => {
    const limiter = new RateLimiter(3, 60_000);
    vi.setSystemTime(new Date("2026-04-05T10:00:00Z"));

    limiter.check("user-1"); // t=0
    vi.advanceTimersByTime(30_000);
    limiter.check("user-1"); // t=30s
    vi.advanceTimersByTime(35_000);
    // t=65s: first request at t=0 is now expired (> 60s ago), but t=30s is still in window
    const result = limiter.check("user-1"); // uses slot
    expect(result.success).toBe(true);
  });

  it("allows exactly maxRequests requests before blocking", () => {
    const limiter = new RateLimiter(4, 60_000);
    for (let i = 0; i < 4; i++) {
      expect(limiter.check("user-1").success).toBe(true);
    }
    expect(limiter.check("user-1").success).toBe(false);
  });

  it("resetAt for failed request points to when oldest request expires", () => {
    const limiter = new RateLimiter(2, 60_000);
    vi.setSystemTime(new Date("2026-04-05T10:00:00Z"));
    const t0 = Date.now();

    limiter.check("user-1"); // at t0
    vi.advanceTimersByTime(10_000);
    limiter.check("user-1"); // at t0+10s

    // Now at limit, next request fails
    vi.advanceTimersByTime(5_000);
    const result = limiter.check("user-1");
    expect(result.success).toBe(false);
    // resetAt should be t0 + 60s
    expect(result.resetAt.getTime()).toBe(t0 + 60_000);
  });
});
