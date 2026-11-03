/**
 * Lane: ai-tools. Course chat grounded in the CoursePack.
 * courseChat(pack, messages) -> ChatResponse { reply, citedSourceIds, mocked }
 */
import type { ChatMessage, ChatResponse, CoursePack } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";
import { mockChat } from "@/lib/data";
import { GROK_VOICE, packDigest, str, withTimeout } from "./_util";

function lastUser(messages: ChatMessage[]): string {
  for (let i = (messages?.length ?? 0) - 1; i >= 0; i--) if (messages[i]?.role === "user") return str(messages[i].content);
  return "";
}

function safeMock(pack: CoursePack, question: string): ChatResponse {
  try {
    return mockChat(pack, question);
  } catch {
    return {
      reply: `I can only answer from the ${pack?.course?.code ?? "course"} pack right now: ${pack?.summary ?? "ask me about a concept, the exam, or study tips."}`,
      citedSourceIds: [],
      mocked: true,
    };
  }
}

export async function courseChat(pack: CoursePack, messages: ChatMessage[]): Promise<ChatResponse> {
  const question = lastUser(messages);
  try {
    if (!question) {
      return {
        reply: `Ask me anything about ${pack.course.code}: what's on the exam, which topics are brutal, or how to study. I'll cite my sources.`,
        citedSourceIds: [],
        mocked: !grokConfigured(),
      };
    }
    if (!grokConfigured()) return safeMock(pack, question);

    const history = messages
      .slice(-9, -1)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && str(m.content))
      .map((m) => `${m.role === "user" ? "STUDENT" : "GROK"}: ${m.content.slice(0, 600)}`)
      .join("\n");
    const prompt = `${packDigest(pack)}

${history ? `CONVERSATION SO FAR:\n${history}\n\n` : ""}STUDENT QUESTION: ${question.slice(0, 1200)}

Answer as Grok, grounded ONLY in the course pack above (concepts, exam frequencies, difficulty, student quotes, tips, sources).
- Be direct, specific and useful: 2-5 short sentences, a concrete study move when relevant. Light wit, never fluff.
- Cite evidence: put the ids of the sources you actually relied on (e.g. "s3") in citedSourceIds, and mention them naturally ("per the Exam 2 archive"). Only use ids from the SOURCES list. Cite 0 sources if the pack doesn't cover it.
- If the pack doesn't cover the question, say so plainly and suggest what to check (the syllabus, the professor, Piazza). Never invent exam content, URLs, or professor facts.
Return ONLY JSON: {"reply": string, "citedSourceIds": string[]}`;
    const out = await withTimeout(
      askGrokJson<{ reply?: string; citedSourceIds?: unknown }>(prompt, { system: GROK_VOICE, temperature: 0.5 }),
      30_000,
      "courseChat",
    );
    const reply = str(out?.reply);
    if (!reply) throw new Error("empty reply");
    const valid = new Set(pack.sources.map((s) => s.id));
    const cited = Array.isArray(out?.citedSourceIds)
      ? [...new Set(out.citedSourceIds.map((x) => str(x)).filter((x) => valid.has(x)))].slice(0, 5)
      : [];
    return { reply, citedSourceIds: cited, mocked: false };
  } catch {
    return safeMock(pack, question);
  }
}
