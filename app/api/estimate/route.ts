import { NextRequest, NextResponse } from "next/server";
import { runConductor } from "@/lib/conductor";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await runConductor({
    title: body.title,
    description: body.description,
    deadline: body.deadline,
    budget: body.budget,
  });

  return NextResponse.json(result);
}
