interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();
  private operations = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("Rate-limit maximum must be a positive integer.");
    }
    if (!Number.isInteger(windowMs) || windowMs < 1_000) {
      throw new Error("Rate-limit window must be at least 1000ms.");
    }
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    this.operations += 1;
    if (this.operations % 100 === 0) this.prune(now);

    const current = this.entries.get(key);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + this.windowMs }
        : current;

    entry.count += 1;
    this.entries.set(key, entry);

    return {
      allowed: entry.count <= this.limit,
      remaining: Math.max(0, this.limit - entry.count),
      resetAt: entry.resetAt,
    };
  }

  private prune(now: number) {
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(key);
    }
  }
}
