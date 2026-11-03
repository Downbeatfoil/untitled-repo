/** Lane: ai-tools. Practice exam generation + grading. Falls back to lib/data mocks, never throws. */
import type { CoursePack, GradeResponse, PracticeExam, Question } from "@/shared/contract";
import { mockExam, mockGrade } from "@/lib/data";
import { TOOL_PROMPTS } from "./prompts";
import { clamp01, conceptStats, slugCode, str, tryGrokJson } from "./shared";

const DIFFS = ["easy", "medium", "hard"] as const;

interface RawQuestion {
  conceptId?: string;
  type?: string;
  prompt?: string;
  choices?: unknown;
  answer?: string;
  explanation?: string;
  difficulty?: string;
  styleSourceId?: string;
}

/** Pick target concepts: caller's focus list, else highest exam-frequency (weighted). */
function targetConcepts(pack: CoursePack, count: number, conceptIds?: string[]) {
  const stats = conceptStats(pack);
  const focus = conceptIds?.length ? stats.filter((c) => conceptIds.includes(c.id)) : [];
  const pool = focus.length ? focus : stats;
  return [...pool].sort((a, b) => b.frequency - a.frequency).slice(0, Math.max(count + 3, 8));
}

function sanitize(raw: RawQuestion, i: number, pack: CoursePack, valid: Set<string>): Question | null {
  const prompt = str(raw.prompt);
  const answer = str(raw.answer);
  if (!prompt || !answer) return null;
  const type = raw.type === "mcq" ? "mcq" : "short";
  let choices: string[] | undefined;
  let finalAnswer = answer;
  if (type === "mcq") {
    choices = Array.isArray(raw.choices)
      ? raw.choices.filter((c): c is string => typeof c === "string" && c.trim().length > 0).map((c) => c.trim())
      : [];
    choices = [...new Set(choices)];
    if (choices.length !== 4) return null;
    // Answer must be exactly one of the choices; tolerate letter answers like "B" or "B) text".
    const exact = choices.find((c) => c.toLowerCase() === answer.toLowerCase());
    const letter = answer.match(/^\(?([A-D])[\).:]?(\s|$)/i);
    const byLetter = letter ? choices["ABCD".indexOf(letter[1].toUpperCase())] : undefined;
    const contained = choices.find((c) => answer.toLowerCase().includes(c.toLowerCase()));
    const match = exact ?? byLetter ?? contained;
    if (!match) return null;
    finalAnswer = match;
  }
  const conceptId = raw.conceptId && valid.has(raw.conceptId) ? raw.conceptId : pack.concepts[i % pack.concepts.length]?.id ?? "general";
  const sourceIds = new Set(pack.sources.map((s) => s.id));
  return {
    id: `q-${slugCode(pack.course.code)}-${i + 1}`,
    conceptId,
    type,
    prompt,
    choices,
    answer: finalAnswer,
    explanation: str(raw.explanation, "Review this concept in the course materials."),
    difficulty: (DIFFS as readonly string[]).includes(raw.difficulty ?? "") ? (raw.difficulty as Question["difficulty"]) : "medium",
    styleSourceId: raw.styleSourceId && sourceIds.has(raw.styleSourceId) ? raw.styleSourceId : undefined,
  };
}

/**
 * Generate a practice exam in the style of the pack's exam sources, weighted by examTopics frequency,
 * mixing mcq (4 choices) and short answer. Falls back to mockExam (mocked: true) on any failure.
 */
export async function generateExam(pack: CoursePack, count = 6, conceptIds?: string[]): Promise<PracticeExam> {
  const n = Math.min(12, Math.max(1, Math.round(Number.isFinite(count) ? count : 6)));
  try {
    const targets = targetConcepts(pack, n, conceptIds);
    const examSources = pack.sources.filter((s) => s.kind === "exam" || s.kind === "practice");
    const styleSources = (examSources.length ? examSources : pack.sources).slice(0, 6);
    const prompt = [
      `Write a ${n}-question practice exam for ${pack.course.code} (${pack.course.title}) at Georgia Tech.`,
      "Imitate the style of these real past-exam / course sources (use their ids for styleSourceId when a question imitates one):",
      ...styleSources.map((s) => `- ${s.id} | ${s.kind} | ${s.title} | ${s.snippet}`),
      "",
      "Candidate concepts with how often each appears on past exams (frequency 0-1) and how hard students find it (0-1):",
      ...targets.map((c) => `- ${c.id} | ${c.label} | freq ${c.frequency.toFixed(2)} | difficulty ${c.difficulty.toFixed(2)} | ${c.description}`),
      "",
      "Rules:",
      "- Weight the questions toward higher-frequency concepts (the more often a concept is tested, the more questions on it). Each conceptId MUST be one of the ids above.",
      `- Roughly 2/3 type "mcq" (exactly 4 plausible choices, "answer" = the exact text of the correct choice) and 1/3 type "short" ("answer" = concise model answer).`,
      '- Mix difficulties ("easy" | "medium" | "hard"), ending with the hardest.',
      '- "explanation": 1-2 sentences on why the answer is right and the common trap.',
      "",
      `Return JSON: {"title": string, "questions": [{"conceptId": string, "type": "mcq"|"short", "prompt": string, "choices": string[] (mcq only), "answer": string, "explanation": string, "difficulty": "easy"|"medium"|"hard", "styleSourceId": string?}]} with exactly ${n} questions.`,
    ].join("\n");

    const out = await tryGrokJson<{ title?: string; questions?: RawQuestion[] }>(prompt, TOOL_PROMPTS.exam, 0.7);
    if (out && Array.isArray(out.questions)) {
      const valid = new Set(pack.concepts.map((c) => c.id));
      const questions = out.questions
        .map((q, i) => sanitize(q, i, pack, valid))
        .filter((q): q is Question => q !== null)
        .slice(0, n)
        .map((q, i) => ({ ...q, id: `q-${slugCode(pack.course.code)}-${i + 1}` }));
      if (questions.length >= Math.min(n, 3)) {
        return {
          id: `exam-${slugCode(pack.course.code)}-${Date.now()}`,
          courseCode: pack.course.code,
          title: str(out.title, `${pack.course.code} Practice Exam`),
          questions,
          mocked: false,
        };
      }
    }
  } catch (err) {
    console.warn("[ai-tools] generateExam failed:", (err as Error)?.message);
  }
  return safeMockExam(pack, n, conceptIds);
}

function safeMockExam(pack: CoursePack, n: number, conceptIds?: string[]): PracticeExam {
  try {
    return { ...mockExam(pack, n, conceptIds), mocked: true };
  } catch {
    return {
      id: `exam-${slugCode(pack.course.code)}-${Date.now()}`,
      courseCode: pack.course.code,
      title: `${pack.course.code} Practice Exam`,
      questions: [],
      mocked: true,
    };
  }
}

/** Grade one answer. Partial credit for short answers + 1-3 sentence feedback. Falls back to mockGrade. */
export async function gradeAnswer(question: Question, userAnswer: string): Promise<GradeResponse> {
  const answerText = typeof userAnswer === "string" ? userAnswer : "";
  try {
    const prompt = [
      `Question (${question.type}, ${question.difficulty}): ${question.prompt}`,
      question.choices?.length ? `Choices:\n${question.choices.map((c, i) => `${"ABCD"[i]}) ${c}`).join("\n")}` : "",
      `Reference answer: ${question.answer}`,
      `Reference explanation: ${question.explanation}`,
      `Student's answer: ${answerText || "(blank)"}`,
      "",
      question.type === "mcq"
        ? "This is multiple choice: score is 1 if the student picked the correct choice (by text or letter), else 0."
        : "This is short answer: score 0..1 with partial credit for the parts the student got right; correct = score >= 0.7.",
      'Return JSON: {"correct": boolean, "score": number 0..1, "feedback": string (1-3 sentences in Grok\'s witty, encouraging voice: say what was right/wrong and the key idea to remember)}.',
    ]
      .filter(Boolean)
      .join("\n");
    const out = await tryGrokJson<{ correct?: boolean; score?: number; feedback?: string }>(prompt, TOOL_PROMPTS.grade, 0.4);
    if (out && typeof out.score === "number" && str(out.feedback)) {
      let score = clamp01(out.score);
      if (question.type === "mcq") score = score >= 0.5 ? 1 : 0;
      return { correct: score >= 0.7, score, feedback: str(out.feedback), mocked: false };
    }
  } catch (err) {
    console.warn("[ai-tools] gradeAnswer failed:", (err as Error)?.message);
  }
  try {
    return { ...mockGrade(question, answerText), mocked: true };
  } catch {
    return { correct: false, score: 0, feedback: `Reference answer: ${question.answer}. ${question.explanation}`, mocked: true };
  }
}
