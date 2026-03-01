import { client, MODEL } from "../client";

export async function runTechAgent(input: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `당신은 IT 프리랜서 프로젝트의 기술 스택 추천 전문가입니다.
프로젝트 요구사항에 맞는 최적의 기술 스택을 추천하고 이유를 설명하세요.
- 프론트엔드/백엔드/DB/인프라 구분
- 각 기술 선택 이유
- 대안 기술 간단 언급
마크다운으로 작성하세요.`,
    messages: [{ role: "user", content: input }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
