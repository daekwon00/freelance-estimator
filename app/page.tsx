"use client";

import { useState, useCallback } from "react";
import { EstimateResult } from "@/components/EstimateResult";
import { ProgressPanel } from "@/components/ProgressPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { addHistory } from "@/lib/history";
import { PRESETS } from "@/lib/presets";
import { validateForm, hasErrors, ValidationErrors } from "@/lib/validate";
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
  const [regeneratingSection, setRegeneratingSection] = useState<AgentName | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const isLoading = phase === "agents" || phase === "synthesis";

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = useCallback(async () => {
    const errors = validateForm(form);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

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
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `요청 실패 (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop()!;

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

  const handleRegenerate = useCallback(
    async (agentName: AgentName) => {
      if (!result) return;
      setRegeneratingSection(agentName);
      setError(null);
      try {
        const res = await fetch("/api/estimate/section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            section: agentName,
            currentMarkdown: result,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `재생성 실패 (${res.status})`);
        }
        const data = await res.json();
        setResult(data.markdown);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "섹션 재생성 중 오류가 발생했습니다.",
        );
      } finally {
        setRegeneratingSection(null);
      }
    },
    [form, result],
  );

  const handleLoadHistory = useCallback((item: EstimateHistoryItem) => {
    setForm((prev) => ({ ...prev, title: item.title, description: item.description }));
    setResult(item.markdown);
    setStreamingText("");
    setError(null);
    setPhase("done");
    setCompletedAgents([]);
    setFieldErrors({});
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">🧾 프리랜서 견적 자동화</h1>

      {/* 템플릿 프리셋 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setForm({
                title: preset.title,
                description: preset.description,
                deadline: preset.deadline,
                budget: preset.budget,
              });
              setFieldErrors({});
            }}
            disabled={isLoading}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <input
            className={`w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${fieldErrors.title ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="프로젝트명"
            maxLength={100}
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          {fieldErrors.title && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
          )}
        </div>
        <div>
          <textarea
            className={`w-full border rounded p-2 h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${fieldErrors.description ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="요구사항을 자유롭게 설명해주세요"
            maxLength={5000}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          <div className="flex justify-between text-xs mt-1">
            {fieldErrors.description ? (
              <p className="text-red-500">{fieldErrors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-gray-400">{form.description.length}/5,000</span>
          </div>
        </div>
        <div>
          <input
            className={`w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${fieldErrors.deadline ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="납기일 (예: 2026-04-30)"
            value={form.deadline}
            onChange={(e) => updateField("deadline", e.target.value)}
          />
          {fieldErrors.deadline && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.deadline}</p>
          )}
        </div>
        <div>
          <input
            className={`w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${fieldErrors.budget ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            placeholder="예산 (선택, 예: 500만원)"
            maxLength={50}
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
          />
          {fieldErrors.budget && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.budget}</p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "분석 중..." : "견적서 생성"}
        </button>
      </div>

      <ProgressPanel phase={phase} completedAgents={completedAgents} />

      {error && (
        <p className="mt-6 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
          {error}
        </p>
      )}

      {streamingText && !result && (
        <EstimateResult markdown={streamingText} title={form.title} streaming />
      )}

      {result && (
        <EstimateResult
          markdown={result}
          title={form.title}
          onRegenerate={handleRegenerate}
          regeneratingSection={regeneratingSection}
        />
      )}

      <HistoryPanel onLoad={handleLoadHistory} refreshKey={historyKey} />
    </main>
  );
}
