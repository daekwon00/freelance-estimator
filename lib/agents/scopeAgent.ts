import { client, MODEL } from "../client";

export async function runScopeAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `당신은 IT 프리랜서 프로젝트의 범위 분석 전문가입니다.
주어진 프로젝트 설명을 분석하여 다음을 파악하세요:
- 핵심 기능 목록
- 포함/제외 범위 명확화
- 예상 화면/API 수
JSON 형식 없이 깔끔한 마크다운으로 작성하세요.`,
    messages: [{ role: "user", content: input }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
