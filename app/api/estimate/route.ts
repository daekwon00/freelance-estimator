import { NextRequest } from "next/server";
import { runConductorStream } from "@/lib/conductor";
import { AgentName } from "@/types/estimate";

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
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
