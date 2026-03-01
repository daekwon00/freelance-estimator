"use client";

import { AgentName, AGENT_LABELS } from "@/types/estimate";

type Phase = "idle" | "agents" | "synthesis" | "done";

interface ProgressPanelProps {
  phase: Phase;
  completedAgents: AgentName[];
}

const ALL_AGENTS: AgentName[] = ["scope", "tech", "time", "risk", "price"];

export function ProgressPanel({ phase, completedAgents }: ProgressPanelProps) {
  if (phase === "idle" || phase === "done") return null;

  const progress = phase === "synthesis" ? 100 : (completedAgents.length / 5) * 100;

  return (
    <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      {/* 프로그레스 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">
            {phase === "agents"
              ? `에이전트 분석 중 (${completedAgents.length}/5)`
              : "견적서 작성 중..."}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 에이전트 체크리스트 */}
      <ul className="space-y-1.5">
        {ALL_AGENTS.map((agent) => {
          const done = completedAgents.includes(agent);
          return (
            <li key={agent} className="flex items-center gap-2 text-sm">
              {done ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">○</span>
              )}
              <span className={done ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
                {AGENT_LABELS[agent]}
              </span>
            </li>
          );
        })}
      </ul>

      {/* 합성 단계 */}
      {phase === "synthesis" && (
        <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
          견적서 작성 중...
        </p>
      )}
    </div>
  );
}
