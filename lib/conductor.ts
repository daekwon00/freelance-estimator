import { client, MODEL } from "./client";
import { runScopeAgent } from "./agents/scopeAgent";
import { runTechAgent } from "./agents/techAgent";
import { runTimeAgent } from "./agents/timeAgent";
import { runRiskAgent } from "./agents/riskAgent";
import { runPriceAgent } from "./agents/priceAgent";
import { ProjectInput, EstimateOutput } from "@/types/estimate";

export async function runConductor(input: ProjectInput): Promise<EstimateOutput> {
  const inputText = `
프로젝트명: ${input.title}
요구사항: ${input.description}
납기: ${input.deadline ?? "미정"}
예산: ${input.budget ?? "미정"}
  `.trim();

  // 5개 Agent 병렬 실행
  const [scope, tech, time, risk, price] = await Promise.all([
    runScopeAgent(inputText),
    runTechAgent(inputText),
    runTimeAgent(inputText),
    runRiskAgent(inputText),
    runPriceAgent(inputText),
  ]);

  // Conductor가 결과 취합 → 최종 견적서 생성
  const synthesis = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `당신은 IT 프리랜서 견적서 작성 전문가입니다.
5개 분석 결과를 취합하여 전문적인 견적서를 마크다운으로 작성하세요.
견적서 구성: 프로젝트 개요, 범위, 기술 스택, 공수 산정, 리스크, 최종 견적 금액`,
    messages: [{
      role: "user",
      content: `
[범위 분석]\n${scope}

[기술 스택]\n${tech}

[공수 산정]\n${time}

[리스크]\n${risk}

[단가/견적]\n${price}

위 내용을 바탕으로 최종 견적서를 작성해주세요.
      `
    }],
  });

  const markdown =
    synthesis.content[0].type === "text" ? synthesis.content[0].text : "";

  return { markdown, agentResults: { scope, tech, time, risk, price } };
}
