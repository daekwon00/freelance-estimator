import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function runTimeAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `당신은 IT 프리랜서 프로젝트의 공수 산정 전문가입니다.
기능별 개발 공수를 인/일 단위로 산정하세요.
- 기능별 공수 표 형식
- 총 공수 합계
- 버퍼(리스크) 20% 포함
마크다운 표로 작성하세요.`,
    messages: [{ role: "user", content: input }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
