"use client";

import { useState, useCallback } from "react";
import { EstimateResult } from "@/components/EstimateResult";
import { ProgressPanel } from "@/components/ProgressPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { addHistory } from "@/lib/history";
import { AgentName, EstimateHistoryItem } from "@/types/estimate";

type Phase = "idle" | "agents" | "synthesis" | "done";

export default function Home() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    budget: "",
  });
  const [result, setResult] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [completedAgents, setCompletedAgents] = useState<AgentName[]>([]);
  const [historyKey, setHistoryKey] = useState(0);

  const isLoading = phase === "agents" || phase === "synthesis";

  const handleSubmit = useCallback(async () => {
    setPhase("agents");
    setResult(null);
    setStreamingText("");
    setError(null);
    setCompletedAgents([]);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`요청 실패 (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 파싱: 이벤트는 \n\n 으로 구분
        const parts = buffer.split("\n\n");
        buffer = parts.pop()!; // 마지막 불완전한 부분은 버퍼에 유지

        for (const part of parts) {
          if (!part.trim()) continue;

          const eventMatch = part.match(/^event: (.+)$/m);
          const dataMatch = part.match(/^data: (.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          switch (event) {
            case "agent_complete":
              setCompletedAgents((prev) => [...prev, data.agent as AgentName]);
              break;
            case "synthesis_start":
              setPhase("synthesis");
              break;
            case "synthesis_delta":
              setStreamingText((prev) => prev + data.text);
              break;
            case "done":
              setResult(data.markdown);
              setStreamingText("");
              setPhase("done");
              // 히스토리에 저장
              addHistory({
                title: form.title,
                description: form.description,
                markdown: data.markdown,
              });
              setHistoryKey((k) => k + 1);
              break;
            case "error":
              setError(data.message);
              setPhase("idle");
              break;
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
      setPhase("idle");
    }
  }, [form]);

  const handleLoadHistory = useCallback((item: EstimateHistoryItem) => {
    setForm((prev) => ({ ...prev, title: item.title, description: item.description }));
    setResult(item.markdown);
    setStreamingText("");
    setError(null);
    setPhase("done");
    setCompletedAgents([]);
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">🧾 프리랜서 견적 자동화</h1>

      <div className="space-y-4">
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="프로젝트명"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="요구사항을 자유롭게 설명해주세요"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="납기일 (예: 2026-04-30)"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="예산 (선택, 예: 500만원)"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !form.title || !form.description}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "분석 중..." : "견적서 생성"}
        </button>
      </div>

      {/* 진행률 패널 */}
      <ProgressPanel phase={phase} completedAgents={completedAgents} />

      {error && (
        <p className="mt-6 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
          {error}
        </p>
      )}

      {/* 스트리밍 중 실시간 텍스트 */}
      {streamingText && !result && (
        <EstimateResult markdown={streamingText} title={form.title} streaming />
      )}

      {/* 완료된 결과 */}
      {result && <EstimateResult markdown={result} title={form.title} />}

      {/* 히스토리 */}
      <HistoryPanel onLoad={handleLoadHistory} refreshKey={historyKey} />
    </main>
  );
}
