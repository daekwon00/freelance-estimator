import { client, MODEL } from "./client";
import { runScopeAgent } from "./agents/scopeAgent";
import { runTechAgent } from "./agents/techAgent";
import { runTimeAgent } from "./agents/timeAgent";
import { runRiskAgent } from "./agents/riskAgent";
import { runPriceAgent } from "./agents/priceAgent";
import { ProjectInput, EstimateOutput, AgentName, AGENT_LABELS } from "@/types/estimate";

function buildInputText(input: ProjectInput): string {
  return `
프로젝트명: ${input.title}
요구사항: ${input.description}
납기: ${input.deadline ?? "미정"}
예산: ${input.budget ?? "미정"}
  `.trim();
}

const SYNTHESIS_SYSTEM = `당신은 IT 프리랜서 견적서 작성 전문가입니다.
5개 분석 결과를 취합하여 전문적인 견적서를 마크다운으로 작성하세요.
견적서 구성: 프로젝트 개요, 범위, 기술 스택, 공수 산정, 리스크, 최종 견적 금액`;

function buildSynthesisPrompt(results: Record<AgentName, string>): string {
  return `
[범위 분석]\n${results.scope}

[기술 스택]\n${results.tech}

[공수 산정]\n${results.time}

[리스크]\n${results.risk}

[단가/견적]\n${results.price}

위 내용을 바탕으로 최종 견적서를 작성해주세요.
  `;
}

export async function runConductor(input: ProjectInput): Promise<EstimateOutput> {
  const inputText = buildInputText(input);

  const [scope, tech, time, risk, price] = await Promise.all([
    runScopeAgent(inputText),
    runTechAgent(inputText),
    runTimeAgent(inputText),
    runRiskAgent(inputText),
    runPriceAgent(inputText),
  ]);

  const synthesis = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYNTHESIS_SYSTEM,
    messages: [{ role: "user", content: buildSynthesisPrompt({ scope, tech, time, risk, price }) }],
  });

  const markdown =
    synthesis.content[0].type === "text" ? synthesis.content[0].text : "";

  return { markdown, agentResults: { scope, tech, time, risk, price } };
}

// SSE 스트리밍 버전
export async function runConductorStream(
  input: ProjectInput,
  onAgentComplete: (agent: AgentName, index: number) => void,
  onSynthesisStart: () => void,
  onSynthesisDelta: (text: string) => void,
): Promise<string> {
  const inputText = buildInputText(input);

  const agents: { name: AgentName; run: () => Promise<string> }[] = [
    { name: "scope", run: () => runScopeAgent(inputText) },
    { name: "tech", run: () => runTechAgent(inputText) },
    { name: "time", run: () => runTimeAgent(inputText) },
    { name: "risk", run: () => runRiskAgent(inputText) },
    { name: "price", run: () => runPriceAgent(inputText) },
  ];

  const results: Record<string, string> = {};
  let completedCount = 0;

  // 에이전트 병렬 실행, 개별 완료 시 콜백
  await Promise.all(
    agents.map(async ({ name, run }) => {
      results[name] = await run();
      completedCount++;
      onAgentComplete(name, completedCount);
    }),
  );

  // Conductor 합성 — 스트리밍
  onSynthesisStart();

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: SYNTHESIS_SYSTEM,
    messages: [{
      role: "user",
      content: buildSynthesisPrompt(results as Record<AgentName, string>),
    }],
  });

  let fullText = "";

  stream.on("text", (text) => {
    fullText += text;
    onSynthesisDelta(text);
  });

  await stream.finalMessage();

  return fullText;
}

// 섹션별 재생성
const agentRunners: Record<AgentName, (input: string) => Promise<string>> = {
  scope: runScopeAgent,
  tech: runTechAgent,
  time: runTimeAgent,
  risk: runRiskAgent,
  price: runPriceAgent,
};

export async function regenerateSection(
  input: ProjectInput,
  agentName: AgentName,
  currentMarkdown: string,
): Promise<string> {
  const inputText = buildInputText(input);

  const newAgentResult = await agentRunners[agentName](inputText);

  const result = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `당신은 IT 프리랜서 견적서 수정 전문가입니다.
기존 견적서에서 지정된 섹션만 새로운 분석 결과로 업데이트하세요.
나머지 섹션은 그대로 유지하세요. 전체 견적서를 마크다운으로 출력하세요.`,
    messages: [{
      role: "user",
      content: `[기존 견적서]\n${currentMarkdown}\n\n[업데이트할 섹션: ${AGENT_LABELS[agentName]}]\n새로운 분석 결과:\n${newAgentResult}\n\n위 섹션만 업데이트한 전체 견적서를 출력해주세요.`,
    }],
  });

  return result.content[0].type === "text" ? result.content[0].text : currentMarkdown;
}
