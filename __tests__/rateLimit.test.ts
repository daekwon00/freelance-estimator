import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("첫 요청 → 허용", () => {
    const result = checkRateLimit("test-first", 3, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("제한 이내 → 허용", () => {
    const key = "test-under";
    checkRateLimit(key, 3, 60_000);
    checkRateLimit(key, 3, 60_000);
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("제한 초과 → 거부 + retryAfter 포함", () => {
    const key = "test-over";
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("다른 키 → 독립적 제한", () => {
    checkRateLimit("key-a", 1, 60_000);
    const result = checkRateLimit("key-b", 1, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("시간 경과 후 → 다시 허용", () => {
    const key = "test-expire";
    const now = Date.now();

    vi.spyOn(Date, "now").mockReturnValue(now);
    checkRateLimit(key, 1, 1000);

    vi.spyOn(Date, "now").mockReturnValue(now + 1001);
    const result = checkRateLimit(key, 1, 1000);
    expect(result.allowed).toBe(true);
  });
});
