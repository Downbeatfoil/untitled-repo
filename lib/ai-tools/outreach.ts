/**
 * Lane: ai-tools. Professor outreach: Grok drafts, a HUMAN sends (we only build a mailto: link).
 * draftOutreach(pack, professor, studentName?, tone?) -> OutreachDraft. Never throws; mocked:true fallback.
 */
import type { CoursePack, OutreachDraft, Professor } from "@/shared/contract";
import { buildMailto } from "@/lib/export";
import { mockOutreach } from "@/lib/data";
import { grokJsonOrNull, toStr } from "./jsonCall";

export type OutreachTone = "formal" | "friendly";

const OUTREACH_SYSTEM =
  "You write short, warm, respectful emails from a Georgia Tech student to a professor. " +
  "The ask: would they be willing to share (or point to) past exams or practice problems so the student-built tool SmartPath can turn them into study material for future students? " +
  "Rules: under 150 words in the body; polite, never pushy, no flattery overload; mention SmartPath once; make it easy to say no; " +
  "never claim the professor already agreed, never invent facts, links or credentials about the student or professor. A human will review and send it. " +
  "Respond with a single JSON object only.";

function resolveProfessor(pack: CoursePack, professor: Professor | string | undefined): { name: string; email?: string } {
  if (typeof professor === "string") {
    const known = pack.professors?.find((p) => p.name.toLowerCase() === professor.trim().toLowerCase());
    return { name: professor.trim() || known?.name || "Professor", email: known?.email };
  }
  const p = professor ?? pack.professors?.[0];
  return { name: p?.name || "Professor", email: p?.email };
}

/** Make sure the body starts with a greeting and ends with a sign-off, and strip any "Subject:" line. */
function tidy(body: string, profName: string, student: string): string {
  let b = body.replace(/^\s*subject:.*\n+/i, "").trim();
  if (!/^(dear|hi|hello|good (morning|afternoon))/i.test(b)) b = `Dear ${profName},\n\n${b}`;
  if (!/(thank|sincerely|best|regards|cheers)[^\n]*\n[\s\S]{0,60}$/i.test(b)) b = `${b}\n\nBest,\n${student}`;
  return b;
}

function finish(
  base: { subject: string; body: string; mocked: boolean },
  email: string | undefined,
): OutreachDraft {
  return { to: email || undefined, subject: base.subject, body: base.body, mailto: buildMailto(email, base.subject, base.body), mocked: base.mocked };
}

/** Draft a short, respectful email asking a professor to share past exams with SmartPath. */
export async function draftOutreach(
  pack: CoursePack,
  professor?: Professor | string,
  studentName?: string,
  tone: OutreachTone = "friendly",
): Promise<OutreachDraft> {
  const prof = resolveProfessor(pack, professor);
  const student = toStr(studentName, "A Georgia Tech student");
  try {
    const topics = (pack.concepts ?? []).slice(0, 4).map((c) => c.label).join(", ");
    const prompt = [
      `Draft an email to ${prof.name} about ${pack.course.code} (${pack.course.title}) at Georgia Tech.`,
      `Student's name (sign-off): ${student}.`,
      `Tone: ${tone === "formal" ? "formal and professional (Dear Professor ..., Sincerely)" : "friendly but still respectful (Hi Professor ..., Best)"}.`,
      `Course topics the student is working through: ${topics || "the core course material"}.`,
      "Context: SmartPath turns study materials into knowledge graphs and practice quizzes; SmartPath Scout helps students find public materials. The student wants to learn how to better prepare, and asks if the professor would share past exams or practice problems, or point to what is already public.",
      'Return JSON: {"subject": string (under 70 chars), "body": string (plain text, includes greeting and sign-off, paragraphs separated by blank lines)}.',
    ].join("\n");
    const out = await grokJsonOrNull<{ subject?: string; body?: string }>(prompt, OUTREACH_SYSTEM, 0.6);
    const subject = toStr(out?.subject);
    const body = toStr(out?.body);
    if (subject && body.length > 40) {
      return finish({ subject: subject.slice(0, 120), body: tidy(body, prof.name, student), mocked: false }, prof.email);
    }
  } catch (err) {
    console.warn("[ai-tools] draftOutreach failed:", (err as Error)?.message);
  }
  try {
    const m = mockOutreach(pack, { name: prof.name, email: prof.email }, student);
    const body =
      tone === "formal" ? m.body : m.body.replace(/^Dear /, "Hi ").replace(/\nSincerely,/, "\nBest,");
    return finish({ subject: m.subject, body, mocked: true }, prof.email);
  } catch {
    const subject = `Past exams for ${pack.course.code} and SmartPath`;
    const body = `Dear ${prof.name},\n\nI'm a student in ${pack.course.code}. Would you be open to sharing, or pointing me to, past exams or practice problems so SmartPath can turn them into study material for future students? No worries at all if not.\n\nThank you,\n${student}`;
    return finish({ subject, body, mocked: true }, prof.email);
  }
}
