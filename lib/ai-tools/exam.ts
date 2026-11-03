/**
 * Lane: ai-tools. Practice exam generation + grading (Grok), mock fallback everywhere.
 * generateExam(pack, count?, conceptIds?) -> PracticeExam
 * gradeAnswer(question, userAnswer)       -> GradeResponse
 */
import type { CoursePack, GradeResponse, PracticeExam, Question } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "@/lib/ai/grok";
import { mockExam, mockGrade } from "@/lib/data";
import { GROK_VOICE, clamp, diffOf, freqOf, num, packDigest, slug, str, withTimeout } from "./_util";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Last-resort exam if even lib/data throws (contract-shaped, never empty). */
function lastResortExam(pack: CoursePack, count: number): PracticeExam {
  const concepts = (pack?.concepts ?? []).slice(0, Math.max(1, count));
  const code = pack?.course?.code ?? "COURSE";
  return {
    id: `exam-${slug(code)}-${Date.now()}`,
    courseCode: code,
    title: `${code} Practice Exam`,
    questions: concepts.map((c, i) => ({
      id: `q-${slug(code)}-${i + 1}`,
      conceptId: c.id,
      type: "short" as const,
      prompt: `Explain ${c.label} and the most common mistake students make with it.`,
      answer: c.description,
      explanation: c.description,
      difficulty: "medium" as const,
    })),
    mocked: true,
  };
}

function safeMockExam(pack: CoursePack, count: number, conceptIds?: string[]): PracticeExam {
  try {
    const m = mockExam(pack, count, conceptIds);
    if (m?.questions?.length) return m;
  } catch {
    /* fall through */
  }
  return lastResortExam(pack, count);
}

/** Validate and repair one Grok question; null if unusable. */
function cleanQuestion(raw: unknown, pack: CoursePack, i: number, fallbackConcept?: string): Question | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prompt = str(r.prompt);
  const answer = str(r.answer);
  if (!prompt || !answer) return null;
  const ids = new Set(pack.concepts.map((c) => c.id));
  const conceptId = ids.has(str(r.conceptId)) ? str(r.conceptId) : fallbackConcept ?? pack.concepts[0]?.id ?? "general";
  const difficulty = (["easy", "medium", "hard"] as const).find((d) => d === str(r.difficulty).toLowerCase()) ?? "medium";
  const srcIds = new Set(pack.sources.map((s) => s.id));
  const styleSourceId = srcIds.has(str(r.styleSourceId)) ? str(r.styleSourceId) : undefined;
  const base = {
    id: `q-${slug(pack.course.code)}-${i + 1}`,
    conceptId,
    prompt,
    explanation: str(r.explanation, "Check the course notes for the full reasoning."),
    difficulty,
    styleSourceId,
  };
  const wantsMcq = str(r.type).toLowerCase() === "mcq" || Array.isArray(r.choices);
  if (wantsMcq) {
    const choices = Array.isArray(r.choices) ? r.choices.map((c) => str(c)).filter(Boolean) : [];
    const unique = [...new Map(choices.map((c) => [norm(c), c])).values()];
    if (unique.length !== 4) return null;
    // answer must be exactly one of the choices (accept "B"/"b" letter or case differences)
    let match = unique.find((c) => c === answer) ?? unique.find((c) => norm(c) === norm(answer));
    if (!match) {
      const letter = answer.match(/^\(?([A-D])[).:]?$/i)?.[1]?.toUpperCase();
      if (letter) match = unique["ABCD".indexOf(letter)];
    }
    if (!match) return null;
    return { ...base, type: "mcq", choices: unique, answer: match };
  }
  return { ...base, type: "short", answer };
}

export async function generateExam(pack: CoursePack, count = 6, conceptIds?: string[]): Promise<PracticeExam> {
  const n = clamp(Math.round(num(count, 6)), 1, 12);
  try {
    if (!grokConfigured()) return safeMockExam(pack, n, conceptIds);

    const focus = conceptIds?.length ? pack.concepts.filter((c) => conceptIds.includes(c.id)) : pack.concepts;
    const pool = (focus.length ? focus : pack.concepts)
      .map((c) => ({ c, f: freqOf(pack, c.id), d: diffOf(pack, c.id) }))
      .sort((a, b) => b.f - a.f);
    const examSources = pack.sources.filter((s) => s.kind === "exam" || s.kind === "practice");
    const nMcq = Math.max(1, Math.round(n * 0.67));
    const prompt = `${packDigest(pack)}

TASK: Write a practice exam of exactly ${n} questions for ${pack.course.code} (${pack.course.title}).
- Imitate the STYLE of the real past exams / practice worksheets listed as sources (${
      examSources.map((s) => `${s.id}: ${s.title}`).join("; ") || "none listed; use a typical GT midterm style"
    }): hand-traces, rotations, Big-O justifications, "which of the following", short explanations.
- Weight topics by exam frequency: more questions on high-frequency concepts. Eligible concept ids, highest frequency first: ${pool
      .map((p) => `${p.c.id} (freq ${p.f.toFixed(2)})`)
      .join(", ")}.
- Mix: about ${nMcq} "mcq" and ${n - nMcq} "short". Cover at least ${Math.min(n, 4)} different concepts. Vary difficulty (easy/medium/hard), skew harder on higher-difficulty concepts.
- mcq: EXACTLY 4 distinct choices; "answer" must be copied EXACTLY from one choice; exactly one defensible correct answer; plausible distractors based on real student mistakes. Never write "all of the above".
- short: "answer" is a concise model answer (2-3 sentences) with the key points a grader should look for.
- "explanation": 1-2 sentences, Grok's voice (witty but clear), explaining why the answer is right and the classic trap.
- "styleSourceId": the id of the past exam/practice source it imitates (or omit).
Return ONLY JSON: {"title": string, "questions": [{"conceptId": string, "type": "mcq"|"short", "prompt": string, "choices": string[] (mcq only), "answer": string, "explanation": string, "difficulty": "easy"|"medium"|"hard", "styleSourceId": string}]}`;

    const out = await withTimeout(
      askGrokJson<{ title?: string; questions?: unknown[] }>(prompt, { system: GROK_VOICE, temperature: 0.6 }),
      55_000,
      "generateExam",
    );
    const questions: Question[] = [];
    for (const raw of out?.questions ?? []) {
      const q = cleanQuestion(raw, pack, questions.length);
      if (q && !questions.some((x) => norm(x.prompt) === norm(q.prompt))) questions.push(q);
      if (questions.length >= n) break;
    }
    if (questions.length === 0) return safeMockExam(pack, n, conceptIds);

    let mocked = false;
    if (questions.length < Math.min(n, 3)) {
      // Too thin: top up from the mock bank so the exam is never short.
      const have = new Set(questions.map((q) => norm(q.prompt)));
      for (const m of safeMockExam(pack, n, conceptIds).questions) {
        if (questions.length >= n) break;
        if (!have.has(norm(m.prompt))) questions.push({ ...m, id: `q-${slug(pack.course.code)}-${questions.length + 1}` });
      }
      mocked = true;
    }
    return {
      id: `exam-${slug(pack.course.code)}-${Date.now()}`,
      courseCode: pack.course.code,
      title: str(out?.title, `${pack.course.code} Practice Exam`),
      questions,
      mocked,
    };
  } catch {
    return safeMockExam(pack, n, conceptIds);
  }
}

function safeMockGrade(q: Question, userAnswer: string): GradeResponse {
  try {
    return mockGrade(q, userAnswer);
  } catch {
    const ok = norm(userAnswer) === norm(q?.answer ?? "");
    return {
      correct: ok,
      score: ok ? 1 : 0,
      feedback: ok ? "Correct. Nicely done." : `Not quite. The answer is: ${q?.answer ?? "see the explanation"}.`,
      mocked: true,
    };
  }
}

export async function gradeAnswer(question: Question, userAnswer: string): Promise<GradeResponse> {
  try {
    const answer = typeof userAnswer === "string" ? userAnswer : "";
    if (!answer.trim()) {
      return {
        correct: false,
        score: 0,
        feedback: "You left this blank. Even a wrong guess teaches you more than silence, so take a swing next time.",
        mocked: !grokConfigured(),
      };
    }
    // MCQ correctness is objective: never let a model overrule an exact choice match.
    const mcqCorrect = question.type === "mcq" ? norm(answer) === norm(question.answer) : undefined;
    if (!grokConfigured()) {
      const g = safeMockGrade(question, answer);
      return mcqCorrect === undefined ? g : { ...g, correct: mcqCorrect, score: mcqCorrect ? 1 : 0 };
    }
    const prompt = `QUESTION (${question.type}, ${question.difficulty}): ${question.prompt}
${question.choices ? `CHOICES: ${question.choices.join(" | ")}\n` : ""}MODEL ANSWER: ${question.answer}
EXPLANATION: ${question.explanation}
STUDENT ANSWER: ${answer.slice(0, 2000)}

Grade the student answer. ${
      question.type === "mcq"
        ? `This is multiple choice and the student ${mcqCorrect ? "chose the correct choice" : "chose a wrong choice"}: score is ${mcqCorrect ? 1 : 0}.`
        : "Give partial credit: score is 0..1 based on how many key points of the model answer the student hit (0.5 = half the idea, 1 = fully right, never reward bluffing)."
    }
Feedback: 1-3 sentences in Grok's voice (witty, confident, kind). Say what they got right, what is missing or wrong, and the one thing to remember. Don't repeat the whole model answer.
Return ONLY JSON: {"score": number between 0 and 1, "feedback": string}`;
    const out = await withTimeout(
      askGrokJson<{ score?: number; feedback?: string }>(prompt, { system: GROK_VOICE, temperature: 0.4 }),
      30_000,
      "gradeAnswer",
    );
    const feedback = str(out?.feedback);
    if (!feedback) throw new Error("empty feedback");
    const score = mcqCorrect !== undefined ? (mcqCorrect ? 1 : 0) : clamp(num(out?.score, NaN), 0, 1);
    if (Number.isNaN(score)) throw new Error("bad score");
    return { correct: score >= 0.7, score: Math.round(score * 100) / 100, feedback, mocked: false };
  } catch {
    return safeMockGrade(question, userAnswer);
  }
}
