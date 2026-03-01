import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCacheKey, getCache, setCache } from "@/lib/cache";

describe("getCacheKey", () => {
  it("동일 입력 → 동일 키", () => {
    const input = { title: "A", description: "B", deadline: "C", budget: "D" };
    expect(getCacheKey(input)).toBe(getCacheKey(input));
  });

  it("다른 입력 → 다른 키", () => {
    const a = { title: "A", description: "B" };
    const b = { title: "A", description: "C" };
    expect(getCacheKey(a)).not.toBe(getCacheKey(b));
  });

  it("선택 필드 미입력 → 빈 문자열로 정규화", () => {
    const withUndefined = { title: "A", description: "B" };
    const withEmpty = { title: "A", description: "B", deadline: "", budget: "" };
    expect(getCacheKey(withUndefined)).toBe(getCacheKey(withEmpty));
  });
});

describe("setCache / getCache", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("저장 후 조회 → 값 반환", () => {
    setCache("test-key-1", "# 견적서");
    expect(getCache("test-key-1")).toBe("# 견적서");
  });

  it("존재하지 않는 키 → null", () => {
    expect(getCache("nonexistent")).toBeNull();
  });

  it("TTL 만료 후 → null", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    setCache("test-ttl", "content");

    vi.spyOn(Date, "now").mockReturnValue(now + 3_600_001); // 1시간 + 1ms
    expect(getCache("test-ttl")).toBeNull();
  });
});
