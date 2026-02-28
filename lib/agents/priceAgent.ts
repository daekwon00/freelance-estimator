import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function runPriceAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `당신은 한국 IT 프리랜서 시장의 단가 및 견적 전문가입니다.
현재 시장 단가를 기준으로 견적을 산정하세요.
- 시니어 개발자 기준 일당(70~100만원) 적용
- 기능별 금액 breakdown
- 최소/표준/최대 견적 3단계 제시
마크다운 표로 작성하세요.`,
    messages: [{ role: "user", content: input }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
