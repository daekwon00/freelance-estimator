import { NextRequest, NextResponse } from "next/server";
import { runConductor } from "@/lib/conductor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runConductor({
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      budget: body.budget,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "견적 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
