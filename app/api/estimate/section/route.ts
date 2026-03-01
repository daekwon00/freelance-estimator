import { NextRequest, NextResponse } from "next/server";
import { regenerateSection } from "@/lib/conductor";
import { AgentName } from "@/types/estimate";

const VALID_AGENTS: AgentName[] = ["scope", "tech", "time", "risk", "price"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const agentName = body.section as AgentName;
    if (!VALID_AGENTS.includes(agentName)) {
      return NextResponse.json({ error: "유효하지 않은 섹션입니다." }, { status: 400 });
    }

    const markdown = await regenerateSection(
      {
        title: body.title,
        description: body.description,
        deadline: body.deadline,
        budget: body.budget,
      },
      agentName,
      body.currentMarkdown,
    );

    return NextResponse.json({ markdown });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "섹션 재생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
