/** Lane: api. POST /api/chat -> ChatResponse */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError, ChatResponse } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { findPack } from "@/app/api/_cache";
import { courseChat } from "@/lib/ai-tools";
import { mockChat } from "@/lib/data";

export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  courseCode: z.string().min(1, "courseCode is required"),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).min(1, "At least one message is required"),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json<ApiError>({ error: msg || "Invalid ChatRequest" }, { status: 400 });
  }

  const { courseCode, messages } = parsed.data;
  const normalized = normalizeCourseCode(courseCode);
  const { pack, isMocked } = findPack(normalized);

  if (!pack) {
    return NextResponse.json<ApiError>({ error: `Course pack not found for '${courseCode}'` }, { status: 404 });
  }

  try {
    const chatRes = await courseChat(pack, messages);
    const headers: Record<string, string> = {};
    if (chatRes.mocked || isMocked) headers["x-mocked"] = "1";
    return NextResponse.json<ChatResponse>(chatRes, { headers });
  } catch (err) {
    console.error("[api/chat] courseChat error, falling back:", err);
    try {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "Explain this course";
      const fallback = mockChat(pack, lastUserMsg);
      return NextResponse.json<ChatResponse>(fallback, { headers: { "x-mocked": "1" } });
    } catch {
      return NextResponse.json<ApiError>({ error: "Failed to generate chat response" }, { status: 500 });
    }
  }
}
