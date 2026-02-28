"use client";

import { useState } from "react";
import { EstimateResult } from "@/components/EstimateResult";

export default function Home() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    budget: "",
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `요청 실패 (${res.status})`);
      }
      const data = await res.json();
      setResult(data.markdown);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🧾 프리랜서 견적 자동화</h1>

      <div className="space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="프로젝트명"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full border rounded p-2 h-32"
          placeholder="요구사항을 자유롭게 설명해주세요"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="납기일 (예: 2026-04-30)"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="예산 (선택, 예: 500만원)"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.description}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "⏳ 5개 Agent 분석 중..." : "견적서 생성"}
        </button>
      </div>

      {error && (
        <p className="mt-6 text-red-600 bg-red-50 border border-red-200 rounded p-4">
          {error}
        </p>
      )}

      {result && <EstimateResult markdown={result} />}
    </main>
  );
}
