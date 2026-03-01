import { NextRequest, NextResponse } from "next/server";
import { runConductorStream } from "@/lib/conductor";
import { AgentName } from "@/types/estimate";
import { validateForm, hasErrors } from "@/lib/validate";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCacheKey, getCache, setCache } from "@/lib/cache";

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 입력 유효성 검사
  const errors = validateForm(body);
  if (hasErrors(errors)) {
    const firstError = Object.values(errors).find(Boolean);
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // 레이트 리밋 (3회/분)
  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(`estimate:${ip}`, 3, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 캐시 확인
        const cacheKey = getCacheKey(body);
        const cached = getCache(cacheKey);

        if (cached) {
          const agents: AgentName[] = ["scope", "tech", "time", "risk", "price"];
          agents.forEach((agent, i) => {
            controller.enqueue(
              encoder.encode(sseMessage("agent_complete", { agent, index: i + 1, total: 5 })),
            );
          });
          controller.enqueue(encoder.encode(sseMessage("synthesis_start", {})));
          controller.enqueue(encoder.encode(sseMessage("done", { markdown: cached })));
          controller.close();
          return;
        }

        const markdown = await runConductorStream(
          {
            title: body.title,
            description: body.description,
            deadline: body.deadline,
            budget: body.budget,
          },
          (agent: AgentName, index: number) => {
            controller.enqueue(
              encoder.encode(sseMessage("agent_complete", { agent, index, total: 5 })),
            );
          },
          () => {
            controller.enqueue(encoder.encode(sseMessage("synthesis_start", {})));
          },
          (text: string) => {
            controller.enqueue(encoder.encode(sseMessage("synthesis_delta", { text })));
          },
        );

        setCache(cacheKey, markdown);
        controller.enqueue(encoder.encode(sseMessage("done", { markdown })));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "견적 생성 중 오류가 발생했습니다.";
        controller.enqueue(encoder.encode(sseMessage("error", { message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
