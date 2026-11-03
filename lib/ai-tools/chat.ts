/**
 * Lane: ai-tools. Course chat grounded in the CoursePack.
 * courseChat(pack, messages) -> ChatResponse { reply, citedSourceIds, mocked }
 */
import type { ChatMessage, ChatResponse, CoursePack } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";
import { mockChat } from "@/lib/data";
import { GROK_VOICE, diffOf, freqOf, packDigest, str, withTimeout } from "./_util";

function lastUser(messages: ChatMessage[]): string {
  for (let i = (messages?.length ?? 0) - 1; i >= 0; i--) if (messages[i]?.role === "user") return str(messages[i].content);
  return "";
}

const STOP = new Set(["the","and","for","are","what","how","why","about","does","with","this","that","exam","test","hard","difficult","tell","explain","class","course","which","when","will","from","your","can","you","any","have","there","into"]);
const tokens = (t: string) => t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

/** Keyword-grounded answer from the pack itself (no Grok); null if no concept matches. */
function packAnswer(pack: CoursePack, question: string): ChatResponse | null {
  const q = new Set(tokens(question));
  const scored = pack.concepts
    .map((c) => {
      const words = new Set([...tokens(c.label), ...tokens(c.id), ...tokens(c.description)]);
      const labelHits = tokens(c.label + " " + c.id).filter((w) => q.has(w)).length;
      const descHits = [...words].filter((w) => q.has(w)).length;
      return { c, score: labelHits * 3 + descHits };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 3) return null;
  const c = best.c;
  const freq = Math.round(freqOf(pack, c.id) * 100);
  const diff = Math.round(diffOf(pack, c.id) * 100);
  const ev = pack.examTopics.find((t) => t.conceptId === c.id)?.evidenceSourceIds ?? [];
  const quote = pack.difficulty.find((d) => d.conceptId === c.id)?.quotes?.[0];
  const cited = [...new Set([...ev, ...(quote ? [quote.sourceId] : [])])].filter((id) => pack.sources.some((s) => s.id === id)).slice(0, 3);
  const cw = new Set(tokens(c.label + " " + c.id));
  const tip = pack.tips.find((t) => tokens(t).some((w) => cw.has(w)));
  const reply =
    `${c.label} in ${pack.course.code}: ${c.description} ` +
    `It shows up on about ${freq}% of past exams and students rate it ${diff}/100 for difficulty.` +
    (quote ? ` One student put it this way: "${quote.text}"` : "") +
    (tip ? ` My move: ${tip}` : "");
  return { reply, citedSourceIds: cited, mocked: true };
}

function safeMock(pack: CoursePack, question: string): ChatResponse {
  try {
    const own = packAnswer(pack, question);
    if (own) return own;
  } catch {
    /* fall through to data mock */
  }
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
