import { client, MODEL } from "../client";

export async function runRiskAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `당신은 IT 프리랜서 프로젝트의 리스크 분석 전문가입니다.
프로젝트의 잠재적 리스크를 파악하고 대응 방안을 제시하세요.
- 기술적 리스크
- 일정 리스크
- 요구사항 불명확 리스크
- 각 리스크별 대응 방안
마크다운으로 작성하세요.`,
    messages: [{ role: "user", content: input }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
