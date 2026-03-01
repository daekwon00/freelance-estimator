import { describe, it, expect } from "vitest";
import { validateForm, hasErrors } from "@/lib/validate";

describe("validateForm", () => {
  const valid = { title: "프로젝트", description: "요구사항 설명" };

  it("유효한 입력 → 에러 없음", () => {
    expect(hasErrors(validateForm(valid))).toBe(false);
  });

  it("빈 제목 → 에러", () => {
    const errors = validateForm({ ...valid, title: "" });
    expect(errors.title).toBeDefined();
  });

  it("공백만 있는 제목 → 에러", () => {
    const errors = validateForm({ ...valid, title: "   " });
    expect(errors.title).toBeDefined();
  });

  it("제목 100자 초과 → 에러", () => {
    const errors = validateForm({ ...valid, title: "A".repeat(101) });
    expect(errors.title).toContain("100자");
  });

  it("빈 요구사항 → 에러", () => {
    const errors = validateForm({ ...valid, description: "" });
    expect(errors.description).toBeDefined();
  });

  it("요구사항 5000자 초과 → 에러", () => {
    const errors = validateForm({ ...valid, description: "A".repeat(5001) });
    expect(errors.description).toContain("5,000자");
  });

  it("잘못된 날짜 형식 → 에러", () => {
    const errors = validateForm({ ...valid, deadline: "2026/04/30" });
    expect(errors.deadline).toBeDefined();
  });

  it("올바른 날짜 형식 → 에러 없음", () => {
    const errors = validateForm({ ...valid, deadline: "2026-04-30" });
    expect(errors.deadline).toBeUndefined();
  });

  it("날짜 미입력 → 에러 없음", () => {
    const errors = validateForm({ ...valid, deadline: "" });
    expect(errors.deadline).toBeUndefined();
  });

  it("예산 50자 초과 → 에러", () => {
    const errors = validateForm({ ...valid, budget: "A".repeat(51) });
    expect(errors.budget).toBeDefined();
  });

  it("예산 미입력 → 에러 없음", () => {
    const errors = validateForm({ ...valid, budget: "" });
    expect(errors.budget).toBeUndefined();
  });
});

describe("hasErrors", () => {
  it("에러 없는 객체 → false", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("에러 있는 객체 → true", () => {
    expect(hasErrors({ title: "에러 메시지" })).toBe(true);
  });

  it("undefined 값만 있는 객체 → false", () => {
    expect(hasErrors({ title: undefined })).toBe(false);
  });
});
