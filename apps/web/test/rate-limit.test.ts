import assert from "node:assert/strict";
import test from "node:test";
import { FixedWindowRateLimiter } from "../lib/server/rate-limit";

test("limits requests per key and resets after the configured window", () => {
  const limiter = new FixedWindowRateLimiter(2, 1_000);

  assert.deepEqual(limiter.consume("client", 1_000), {
    allowed: true,
    remaining: 1,
    resetAt: 2_000,
  });
  assert.equal(limiter.consume("client", 1_100).allowed, true);
  assert.equal(limiter.consume("client", 1_200).allowed, false);
  assert.deepEqual(limiter.consume("client", 2_000), {
    allowed: true,
    remaining: 1,
    resetAt: 3_000,
  });
});

test("isolates rate-limit counters by client key", () => {
  const limiter = new FixedWindowRateLimiter(1, 1_000);

  assert.equal(limiter.consume("first", 1_000).allowed, true);
  assert.equal(limiter.consume("first", 1_001).allowed, false);
  assert.equal(limiter.consume("second", 1_001).allowed, true);
});
