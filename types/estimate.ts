export interface ProjectInput {
  title: string;
  description: string;
  deadline?: string;
  budget?: string;
}

export interface AgentResult {
  scope?: string;
  tech?: string;
  time?: string;
  risk?: string;
  price?: string;
}

export interface EstimateOutput {
  markdown: string;
  agentResults: AgentResult;
}

// SSE 관련 타입
export type AgentName = "scope" | "tech" | "time" | "risk" | "price";

export const AGENT_LABELS: Record<AgentName, string> = {
  scope: "범위 분석",
  tech: "기술 스택",
  time: "공수 산정",
  risk: "리스크 분석",
  price: "단가/견적",
};

export type SSEEvent =
  | { event: "agent_complete"; data: { agent: AgentName; index: number; total: number } }
  | { event: "synthesis_start"; data: Record<string, never> }
  | { event: "synthesis_delta"; data: { text: string } }
  | { event: "done"; data: { markdown: string } }
  | { event: "error"; data: { message: string } };

// 섹션 재생성 관련
export const SECTION_KEYWORDS: Record<string, AgentName> = {
  "범위": "scope",
  "스코프": "scope",
  "기술": "tech",
  "스택": "tech",
  "공수": "time",
  "일정": "time",
  "기간": "time",
  "리스크": "risk",
  "위험": "risk",
  "견적": "price",
  "금액": "price",
  "비용": "price",
  "단가": "price",
};

// 히스토리 관련 타입
export interface EstimateHistoryItem {
  id: string;
  title: string;
  description: string;
  markdown: string;
  createdAt: string;
}
