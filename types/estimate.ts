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
