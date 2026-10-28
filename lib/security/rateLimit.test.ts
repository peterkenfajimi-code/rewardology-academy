import { afterEach, describe, expect, it } from "vitest";
import {
  consumeRateLimit,
  isAuthLocked,
  registerAuthFailure,
  resetRateLimitStores,
} from "@/lib/security/rateLimit";

afterEach(() => {
  resetRateLimitStores();
});

describe("consumeRateLimit", () => {
  it("allows traffic under the limit and blocks after it", () => {
    const first = consumeRateLimit("tts", "user-1", 2, 60_000, 1_000);
    const second = consumeRateLimit("tts", "user-1", 2, 60_000, 1_000);
    const third = consumeRateLimit("tts", "user-1", 2, 60_000, 1_000);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window", () => {
    consumeRateLimit("tts", "user-2", 1, 1_000, 1_000);
    const blocked = consumeRateLimit("tts", "user-2", 1, 1_000, 1_000);
    const after = consumeRateLimit("tts", "user-2", 1, 1_000, 2_100);
    expect(blocked.ok).toBe(false);
    expect(after.ok).toBe(true);
  });
});

describe("auth lockout", () => {
  it("locks after repeated failures", () => {
    expect(registerAuthFailure("admin-login", "1.1.1.1", 3, 60_000, 15_000, 1_000)).toBe(0);
    expect(registerAuthFailure("admin-login", "1.1.1.1", 3, 60_000, 15_000, 1_000)).toBe(0);
    const lockSec = registerAuthFailure("admin-login", "1.1.1.1", 3, 60_000, 15_000, 1_000);
    expect(lockSec).toBe(15);
    expect(isAuthLocked("admin-login", "1.1.1.1", 2_000)).toBeGreaterThan(0);
  });
});
