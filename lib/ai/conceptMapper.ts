/**
 * Lane: ai. Concept Mapper agent.
 * Synthesizes research findings from Exam Hunter, Syllabus Scout, and Student Pulse into a CoursePack.
 * Strict Zod validation with automated fallback to seeds ensures zero runtime crashes.
 */
import { z } from "zod";
import type {
  CourseCode,
  CoursePack,
  Source,
} from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { askGrokJson, grokConfigured } from "./grok";
import { PROMPTS } from "./prompts";
import { getSeedPack, makeGenericPack } from "@/lib/data";
import type { AgentResult } from "./agents";

export interface FindingsInput {
  sources?: Source[];
  notes?: string | string[];
  examHunter?: AgentResult;
  syllabusScout?: AgentResult;
  studentPulse?: AgentResult;
}

export const ConceptSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  unit: z.string().optional(),
});

export const ConceptEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relation: z.enum(["prereq", "related"]).default("prereq"),
});

export const ExamTopicSchema = z.object({
  conceptId: z.string(),
  frequency: z.number().min(0).max(1),
  evidenceSourceIds: z.array(z.string()).default([]),
});

export const QuoteSchema = z.object({
  text: z.string(),
  sourceId: z.string().default("s1"),
  sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
});

export const DifficultySchema = z.object({
  conceptId: z.string(),
  score: z.number().min(0).max(1),
  quotes: z.array(QuoteSchema).default([]),
});

export const ProfessorSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  pageUrl: z.string().optional(),
});

export const RawCoursePackSchema = z.object({
  course: z.object({
    code: z.string(),
    title: z.string(),
    school: z.literal("Georgia Tech").default("Georgia Tech"),
  }),
  summary: z.string(),
  fearScore: z.number().min(0).max(100),
  concepts: z.array(ConceptSchema).min(3),
  edges: z.array(ConceptEdgeSchema).default([]),
  examTopics: z.array(ExamTopicSchema).default([]),
  difficulty: z.array(DifficultySchema).default([]),
  studentQuotes: z.array(QuoteSchema).default([]),
  professors: z.array(ProfessorSchema).default([]),
  tips: z.array(z.string()).default([]),
});

/** Aggregate sources and text notes from any findings format */
function extractFindings(findings: FindingsInput): { combinedSources: Source[]; combinedNotes: string } {
  const sourcesMap = new Map<string, Source>();
  const notesList: string[] = [];

  if (findings.sources) {
    for (const s of findings.sources) sourcesMap.set(s.id, s);
  }
  if (findings.notes) {
    if (Array.isArray(findings.notes)) notesList.push(...findings.notes);
    else notesList.push(findings.notes);
  }

  if (findings.examHunter) {
    for (const s of findings.examHunter.sources) sourcesMap.set(s.id, s);
    notesList.push(`[Exam Hunter Notes]:\n${findings.examHunter.notes}`);
  }
  if (findings.syllabusScout) {
    for (const s of findings.syllabusScout.sources) sourcesMap.set(s.id, s);
    notesList.push(`[Syllabus Scout Notes]:\n${findings.syllabusScout.notes}`);
  }
  if (findings.studentPulse) {
    for (const s of findings.studentPulse.sources) sourcesMap.set(s.id, s);
    notesList.push(`[Student Pulse Notes]:\n${findings.studentPulse.notes}`);
  }

  return {
    combinedSources: [...sourcesMap.values()],
    combinedNotes: notesList.join("\n\n"),
  };
}

/** Sanitize and guarantee pack invariants */
function completePack(raw: z.infer<typeof RawCoursePackSchema>, sources: Source[]): CoursePack {
  const fallbackSourceId = sources[0]?.id ?? "s1";
  const validSourceIds = new Set(sources.map((s) => s.id));

  // Ensure all quotes have a valid sourceId
  const studentQuotes = raw.studentQuotes.map((q) => ({
    ...q,
    sourceId: validSourceIds.has(q.sourceId) ? q.sourceId : fallbackSourceId,
  }));

  // Ensure every concept has an examTopic entry
  const examTopics = [...raw.examTopics];
  for (const c of raw.concepts) {
    if (!examTopics.some((t) => t.conceptId === c.id)) {
      examTopics.push({
        conceptId: c.id,
        frequency: 0.6,
        evidenceSourceIds: [fallbackSourceId],
      });
    }
  }

  // Ensure every concept has a difficulty entry
  const difficulty = [...raw.difficulty];
  for (const c of raw.concepts) {
    if (!difficulty.some((d) => d.conceptId === c.id)) {
      difficulty.push({
        conceptId: c.id,
        score: 0.65,
        quotes: studentQuotes.slice(0, 1),
      });
    }
  }

  // Ensure edges reference existing concepts
  const conceptIds = new Set(raw.concepts.map((c) => c.id));
  const edges = raw.edges.filter((e) => conceptIds.has(e.from) && conceptIds.has(e.to));

  return {
    course: {
      code: raw.course.code,
      title: raw.course.title,
      school: "Georgia Tech",
    },
    summary: raw.summary,
    fearScore: Math.round(Math.max(0, Math.min(100, raw.fearScore))),
    concepts: raw.concepts,
    edges,
    examTopics,
    difficulty,
    studentQuotes,
    sources,
    professors: raw.professors,
    tips: raw.tips.length > 0 ? raw.tips : [
      "Review past exams under timed conditions.",
      "Trace pointer structures and tree rotations manually on paper.",
      "Attend recitations for practice problem walkthroughs.",
    ],
    generatedAt: new Date().toISOString(),
    mocked: false,
  };
}

/**
 * Builds a full CoursePack from scout findings using Grok JSON reasoning.
 * Falls back safely to seed or generic packs if Grok is disabled or validation fails.
 */
export async function buildPack(code: CourseCode, findings: FindingsInput = {}): Promise<CoursePack> {
  const normCode = normalizeCourseCode(code);
  const { combinedSources, combinedNotes } = extractFindings(findings);

  if (!grokConfigured()) {
    const seed = getSeedPack(normCode);
    if (seed) return seed;
    const generic = makeGenericPack(normCode);
    if (combinedSources.length > 0) generic.sources = combinedSources;
    return generic;
  }

  const prompt = `Synthesize the research findings below for Georgia Tech course "${normCode}" into a complete CoursePack JSON.

Research Notes:
${combinedNotes || "No specific agent notes provided."}

Discovered Sources (use these IDs in evidenceSourceIds and quotes):
${JSON.stringify(combinedSources.map((s) => ({ id: s.id, title: s.title, kind: s.kind })), null, 2)}

Requirements:
- course: { code: "${normCode}", title: "string", school: "Georgia Tech" }
- summary: 2-3 sentence academic overview of the course.
- fearScore: number 0-100 indicating how feared or demanding students find the course.
- concepts: 8 to 14 core concepts, each with { id: "kebab-case", label: "Title", description: "1-2 sentences", unit: "Unit name" }
- edges: prerequisite arrows between concepts: { from: "prereq-id", to: "target-id", relation: "prereq" | "related" }
- examTopics: for each concept, { conceptId: "id", frequency: number 0.0-1.0, evidenceSourceIds: ["s1"] }
- difficulty: for each concept, { conceptId: "id", score: number 0.0-1.0, quotes: [{ text: "...", sourceId: "...", sentiment: "positive"|"neutral"|"negative" }] }
- studentQuotes: 3 to 6 top representative quotes about exams, workloads, and professors.
- professors: list of { name: "string", email?: "string", pageUrl?: "string" }
- tips: 3 to 6 practical study tips.

Return pure JSON matching this exact structure.`;

  try {
    const rawJson = await askGrokJson<unknown>(prompt, {
      system: PROMPTS.conceptMapper,
      temperature: 0.3,
    });

    const parsed = RawCoursePackSchema.safeParse(rawJson);
    if (parsed.success) {
      return completePack(parsed.data, combinedSources);
    }

    console.warn(`[buildPack] Schema validation failed for ${normCode}, attempting repair:`, parsed.error.issues);
    const repairPrompt = `The following JSON failed validation for CoursePack:
${JSON.stringify(rawJson)}

Validation errors:
${JSON.stringify(parsed.error.issues)}

Please return the corrected pure JSON adhering strictly to the schema.`;

    const repairedJson = await askGrokJson<unknown>(repairPrompt, {
      system: PROMPTS.conceptMapper,
      temperature: 0.1,
    });

    const repairedParsed = RawCoursePackSchema.safeParse(repairedJson);
    if (repairedParsed.success) {
      return completePack(repairedParsed.data, combinedSources);
    }
  } catch (err) {
    console.warn(`[buildPack] Grok JSON generation failed for ${normCode}:`, err);
  }

  // Graceful fallback to seed or generic pack
  const fallbackSeed = getSeedPack(normCode);
  if (fallbackSeed) return fallbackSeed;
  const generic = makeGenericPack(normCode);
  if (combinedSources.length > 0) generic.sources = combinedSources;
  return generic;
}
