/**
 * Lane: ai. Specialized research scout agents using Grok Responses API with live tools.
 * Each returns { sources: Source[], notes: string }.
 * Safe fallbacks ensure zero crash guarantee when no API key is set or on network failure.
 */
import type { AgentName, CourseCode, Source, SourceKind } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { grokConfigured, researchWithGrok } from "./grok";
import { PROMPTS } from "./prompts";
import { getSeedPack, makeGenericPack } from "@/lib/data";

export interface AgentResult {
  sources: Source[];
  notes: string;
}

export interface AgentOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** Helper to infer title from URL */
function titleFromUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts.pop() || "";
    const cleanLast = decodeURIComponent(last).replace(/[-_.]+/g, " ").trim();
    if (cleanLast.length > 3) {
      return `${host}: ${cleanLast.charAt(0).toUpperCase() + cleanLast.slice(1)}`;
    }
    return `${host} ${fallback}`;
  } catch {
    return fallback;
  }
}

/** Helper to infer kind from url and agent */
function inferKind(url: string, agent: AgentName): SourceKind {
  const lower = url.toLowerCase();
  if (lower.includes("reddit.com")) return "reddit";
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "x";
  if (agent === "exam-hunter") {
    if (lower.includes("exam") || lower.includes("test") || lower.includes("midterm") || lower.includes("final")) {
      return "exam";
    }
    return "practice";
  }
  if (agent === "syllabus-scout") {
    if (lower.includes("syllabus")) return "syllabus";
    return "course-page";
  }
  return "other";
}

/** Extract snippet from research notes related to url or topic */
function extractSnippet(notes: string, index: number, defaultSnippet: string): string {
  const paragraphs = notes.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
  if (paragraphs[index]) {
    return paragraphs[index].slice(0, 180).replace(/\s+/g, " ") + "...";
  }
  return defaultSnippet;
}

/**
 * Fallback to seed or generic pack when Grok is unconfigured or errors.
 */
function getFallback(code: CourseCode, agent: AgentName): AgentResult {
  const pack = getSeedPack(code) ?? makeGenericPack(code);
  const matchedSources = pack.sources.filter((s) => s.foundBy === agent);
  const sources = matchedSources.length > 0 ? matchedSources : pack.sources.slice(0, 2);

  let notes = "";
  if (agent === "exam-hunter") {
    const examTopics = pack.examTopics.map((t) => t.conceptId).join(", ");
    notes = `Exam archives found for ${code}. Core topics tested frequently: ${examTopics || "Algorithms & structures"}. Review materials include practice exams and past midterms.`;
  } else if (agent === "syllabus-scout") {
    const profs = pack.professors.map((p) => p.name).join(", ");
    notes = `${code} (${pack.course.title}): Syllabus outlines ${pack.concepts.length} key concepts. Instructors: ${profs || "Faculty"}. Includes lecture schedule, recitations, and grading policy.`;
  } else {
    const quoteSample = pack.studentQuotes.map((q) => `"${q.text}"`).slice(0, 2).join(" ");
    notes = `Student sentiment indicates a Fear Score of ${pack.fearScore}/100 for ${code}. Student feedback highlights: ${quoteSample || "Challenging exams and heavy workload."}`;
  }

  return { sources, notes };
}

/** Run an async action with optional timeout and abort signal */
async function withTimeout<T>(
  action: () => Promise<T>,
  opts: AgentOptions = {}
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? 25000;
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([action(), timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Exam Hunter: Scours public web for past exams, sample tests, and quiz archives.
 */
export async function examHunter(code: CourseCode, opts: AgentOptions = {}): Promise<AgentResult> {
  const normCode = normalizeCourseCode(code);
  if (!grokConfigured()) {
    return getFallback(normCode, "exam-hunter");
  }

  const prompt = `Search for public past exams, practice tests, midterms, sample quizzes, and exam study guides for Georgia Tech course "${normCode}".
Find actual public exam PDFs, course website exam archives, or public GitHub repositories hosting past tests for "${normCode}".
Return:
1. List of past exams found with their exact URLs.
2. Topics covered on each exam and historical exam format (MCQ, free response, code tracing).
3. Any known exam pitfalls or heavily tested units.`;

  try {
    const res = await withTimeout(
      () =>
        researchWithGrok(prompt, {
          system: PROMPTS.examHunter,
          tools: ["web_search"],
        }),
      opts
    );

    const sources: Source[] = res.citations.map((url, idx) => ({
      id: `eh-${idx + 1}`,
      url,
      title: titleFromUrl(url, `${normCode} Exam Resource`),
      kind: inferKind(url, "exam-hunter"),
      snippet: extractSnippet(res.text, idx, `Past exam and practice material for ${normCode}.`),
      foundBy: "exam-hunter" as const,
    }));

    return {
      sources: sources.length > 0 ? sources : getFallback(normCode, "exam-hunter").sources,
      notes: res.text || getFallback(normCode, "exam-hunter").notes,
    };
  } catch (err) {
    console.warn(`[examHunter] Live research failed, using fallback for ${normCode}:`, err);
    return getFallback(normCode, "exam-hunter");
  }
}

/**
 * Syllabus Scout: Discovers official syllabus, professor staff, and lecture schedules.
 */
export async function syllabusScout(code: CourseCode, opts: AgentOptions = {}): Promise<AgentResult> {
  const normCode = normalizeCourseCode(code);
  if (!grokConfigured()) {
    return getFallback(normCode, "syllabus-scout");
  }

  const prompt = `Search for the official syllabus, course home page, schedule of lectures, and teaching faculty for Georgia Tech course "${normCode}".
Search gatech.edu domains, Canvas syllabi, or public course websites.
Return:
1. Course full title, credits, and catalog description.
2. Official syllabus URL and course website link.
3. Instructor names, department, and emails if public.
4. Weekly lecture breakdown and major topic units.`;

  try {
    const res = await withTimeout(
      () =>
        researchWithGrok(prompt, {
          system: PROMPTS.syllabusScout,
          tools: ["web_search"],
        }),
      opts
    );

    const sources: Source[] = res.citations.map((url, idx) => ({
      id: `ss-${idx + 1}`,
      url,
      title: titleFromUrl(url, `${normCode} Syllabus / Schedule`),
      kind: inferKind(url, "syllabus-scout"),
      snippet: extractSnippet(res.text, idx, `Official syllabus and course schedule for ${normCode}.`),
      foundBy: "syllabus-scout" as const,
    }));

    return {
      sources: sources.length > 0 ? sources : getFallback(normCode, "syllabus-scout").sources,
      notes: res.text || getFallback(normCode, "syllabus-scout").notes,
    };
  } catch (err) {
    console.warn(`[syllabusScout] Live research failed, using fallback for ${normCode}:`, err);
    return getFallback(normCode, "syllabus-scout");
  }
}

/**
 * Student Pulse: Analyzes Reddit (r/gatech) and X chatter to gauge difficulty and sentiment.
 */
export async function studentPulse(code: CourseCode, opts: AgentOptions = {}): Promise<AgentResult> {
  const normCode = normalizeCourseCode(code);
  if (!grokConfigured()) {
    return getFallback(normCode, "student-pulse");
  }

  const prompt = `Search Reddit (specifically r/gatech) and X (Twitter) for student sentiment, reviews, and difficulty chatter regarding Georgia Tech course "${normCode}".
Identify:
1. What students consider the hardest exam or most brutal concepts.
2. Direct candid student quotes regarding the class difficulty, exams, and workload.
3. Suggested survival tips and battle advice from students who took the course.
4. Estimated Fear Score (0-100) based on student dread and exam averages.`;

  try {
    const res = await withTimeout(
      () =>
        researchWithGrok(prompt, {
          system: PROMPTS.studentPulse,
          tools: ["web_search", "x_search"],
        }),
      opts
    );

    const sources: Source[] = res.citations.map((url, idx) => ({
      id: `sp-${idx + 1}`,
      url,
      title: titleFromUrl(url, `${normCode} Student Discussion`),
      kind: inferKind(url, "student-pulse"),
      snippet: extractSnippet(res.text, idx, `Student discussion and exam sentiment for ${normCode}.`),
      foundBy: "student-pulse" as const,
    }));

    return {
      sources: sources.length > 0 ? sources : getFallback(normCode, "student-pulse").sources,
      notes: res.text || getFallback(normCode, "student-pulse").notes,
    };
  } catch (err) {
    console.warn(`[studentPulse] Live research failed, using fallback for ${normCode}:`, err);
    return getFallback(normCode, "student-pulse");
  }
}
