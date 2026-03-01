import { describe, it, expect, beforeEach, vi } from "vitest";

// localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

vi.stubGlobal("window", { localStorage: localStorageMock, crypto });
vi.stubGlobal("localStorage", localStorageMock);

// 모듈은 mock 설정 후 동적 import
const { getHistory, addHistory, deleteHistory, clearHistory } = await import("@/lib/history");

describe("history", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("빈 히스토리 → 빈 배열", () => {
    expect(getHistory()).toEqual([]);
  });

  it("addHistory → getHistory에 포함", () => {
    addHistory({ title: "프로젝트", description: "설명", markdown: "# 견적" });
    const items = getHistory();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("프로젝트");
    expect(items[0].id).toBeDefined();
    expect(items[0].createdAt).toBeDefined();
  });

  it("최신 항목이 먼저 (unshift)", () => {
    addHistory({ title: "첫번째", description: "", markdown: "" });
    addHistory({ title: "두번째", description: "", markdown: "" });
    const items = getHistory();
    expect(items[0].title).toBe("두번째");
    expect(items[1].title).toBe("첫번째");
  });

  it("deleteHistory → 해당 항목 삭제", () => {
    addHistory({ title: "삭제대상", description: "", markdown: "" });
    const items = getHistory();
    deleteHistory(items[0].id);
    expect(getHistory()).toHaveLength(0);
  });

  it("clearHistory → 전체 삭제", () => {
    addHistory({ title: "A", description: "", markdown: "" });
    addHistory({ title: "B", description: "", markdown: "" });
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("최대 50개 제한", () => {
    for (let i = 0; i < 55; i++) {
      addHistory({ title: `항목${i}`, description: "", markdown: "" });
    }
    expect(getHistory()).toHaveLength(50);
    // 가장 최신(마지막 추가)이 첫 번째
    expect(getHistory()[0].title).toBe("항목54");
  });
});
