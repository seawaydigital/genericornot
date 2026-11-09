export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * In-memory sliding-window limiter.
 *
 * On Vercel each serverless instance keeps its own map, so this is a
 * per-instance speed bump rather than a global guarantee. It stops casual
 * abuse; move to a shared store (e.g. Upstash Redis) if the site attracts
 * determined spam.
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private lastPrune = 0;

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.prune(now, windowStart);

    const timestamps = (this.requests.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      this.requests.set(key, timestamps);
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(timestamps[0] + this.windowMs),
      };
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      success: true,
      remaining: this.maxRequests - timestamps.length,
      resetAt: new Date(now + this.windowMs),
    };
  }

  /** Drop keys whose timestamps have all expired so the map can't grow forever. */
  private prune(now: number, windowStart: number) {
    if (now - this.lastPrune < this.windowMs) return;
    this.lastPrune = now;
    for (const [key, timestamps] of this.requests) {
      if (!timestamps.some((t) => t > windowStart)) this.requests.delete(key);
    }
  }
}

// 10 votes per minute per user
export const voteLimiter = new RateLimiter(10, 60 * 1000);

// 5 submissions per hour per user
export const submissionLimiter = new RateLimiter(5, 60 * 60 * 1000);

// 10 evidence submissions per hour per user
export const evidenceLimiter = new RateLimiter(10, 60 * 60 * 1000);

// 20 outdated-flags per hour per user
export const flagLimiter = new RateLimiter(20, 60 * 60 * 1000);
