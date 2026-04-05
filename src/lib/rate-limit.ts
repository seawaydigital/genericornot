export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.requests.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
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
}

// 10 votes per minute per user
export const voteLimiter = new RateLimiter(10, 60 * 1000);

// 5 submissions per hour per user
export const submissionLimiter = new RateLimiter(5, 60 * 60 * 1000);

// 10 evidence submissions per hour per user
export const evidenceLimiter = new RateLimiter(10, 60 * 60 * 1000);
