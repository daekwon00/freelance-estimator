import { NextRequest, NextResponse } from "next/server";
import { regenerateSection } from "@/lib/conductor";
import { AgentName } from "@/types/estimate";
import { validateForm, hasErrors } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rateLimit";

const VALID_AGENTS: AgentName[] = ["scope", "tech", "time", "risk", "price"];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 유효성 검사
    const errors = validateForm(body);
    if (hasErrors(errors)) {
      const firstError = Object.values(errors).find(Boolean);
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // 레이트 리밋 (10회/분)
    const ip = getClientIp(req);
    const { allowed, retryAfter } = checkRateLimit(`section:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.` },
        { status: 429 },
      );
    }

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
