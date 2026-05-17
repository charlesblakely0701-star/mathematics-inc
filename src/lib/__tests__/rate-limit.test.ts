import { beforeEach, describe, expect, it, vi } from "vitest";

// Import after mocking so we get a fresh module state.
let checkRateLimit: (key: string, limit: number) => boolean;
let evictExpired: () => void;

beforeEach(async () => {
  vi.resetModules();
  ({ checkRateLimit, evictExpired } = await import("@/lib/rate-limit"));
});

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    expect(checkRateLimit("test:1.2.3.4", 5)).toBe(true);
  });

  it("allows requests up to the limit", () => {
    const key = "test:unique-key-1";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5)).toBe(true);
    }
  });

  it("blocks requests that exceed the limit", () => {
    const key = "test:unique-key-2";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5);
    }
    expect(checkRateLimit(key, 5)).toBe(false);
  });

  it("resets after the window expires", () => {
    const key = "test:unique-key-3";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5);
    }
    // Advance time past the 1-minute window.
    vi.setSystemTime(Date.now() + 61_000);
    expect(checkRateLimit(key, 5)).toBe(true);
    vi.useRealTimers();
  });

  it("evictExpired removes old entries without throwing", () => {
    checkRateLimit("evict-key", 5);
    vi.setSystemTime(Date.now() + 61_000);
    expect(() => evictExpired()).not.toThrow();
    vi.useRealTimers();
  });
});
