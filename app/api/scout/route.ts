/** Lane: api. POST /api/scout -> SSE text/event-stream */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, CoursePack, ScoutEvent } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { cachePack, findPack } from "@/app/api/_cache";
import { replayScout } from "@/lib/data/scoutReplay";
import { makeGenericPack } from "@/lib/data/genericPack";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ScoutRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  fresh: z.boolean().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ScoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid ScoutRequest body" }, { status: 400 });
  }

  const { courseCode, fresh } = parsed.data;
  const normalized = normalizeCourseCode(courseCode);

  let packToReplay: CoursePack | null = null;
  if (!fresh) {
    const found = findPack(normalized);
    packToReplay = found.pack;
  }
  if (!packToReplay) {
    try {
      packToReplay = makeGenericPack(normalized);
    } catch {
      const found = findPack("CS 1332");
      packToReplay = found.pack;
    }
  }

  if (!packToReplay) {
    return NextResponse.json<ApiError>({ error: `Could not build scout replay for ${courseCode}` }, { status: 500 });
  }

  const scoutStream = replayScout(packToReplay);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of scoutStream) {
          if (req.signal.aborted) break;

          if (event.type === "pack" && event.pack) {
            cachePack(event.pack);
          }

          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
      } catch (err) {
        console.error("[api/scout] stream error:", err);
        try {
          const errEvent: ScoutEvent = {
            type: "error",
            message: err instanceof Error ? err.message : "Scout streaming error",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errEvent)}\n\n`));
        } catch {}
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
