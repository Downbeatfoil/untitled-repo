/**
 * SHARED CONTRACT: the single source of truth for types that cross lanes.
 * Owner: orchestrator. Any lane may READ this. To CHANGE it, post an ASK on the
 * board addressed to `orchestrator`. Never edit it from a worker lane.
 *
 * Product: SmartPath Scout. Name any Georgia Tech course; a swarm of Grok agents
 * scours the web + X for public past exams, syllabi and student chatter, then
 * builds a SmartPath-ready course pack: concept graph, exam-topic frequency,
 * difficulty heatmap, practice exam, study plan, professor outreach, course chat.
 */

/* ------------------------------------------------------------------ */
/* Core domain                                                         */
/* ------------------------------------------------------------------ */

/** Course code, normalized uppercase with a single space: "CS 1332". */
export type CourseCode = string;

/** The 4 Grok research agents that make up the scout swarm. */
export type AgentName =
  | "exam-hunter" //      finds publicly posted past exams / practice tests
  | "syllabus-scout" //   finds syllabi, course pages, schedules, professors
  | "student-pulse" //    X + Reddit: what students say, what's hard
  | "concept-mapper"; //  turns everything into the concept graph

export const AGENTS: { name: AgentName; label: string; emoji: string; tool: "web" | "x" | "web+x" | "reasoning" }[] = [
  { name: "exam-hunter", label: "Exam Hunter", emoji: "🎯", tool: "web" },
  { name: "syllabus-scout", label: "Syllabus Scout", emoji: "📚", tool: "web" },
  { name: "student-pulse", label: "Student Pulse", emoji: "📣", tool: "web+x" },
  { name: "concept-mapper", label: "Concept Mapper", emoji: "🧠", tool: "reasoning" },
];

export type SourceKind = "exam" | "practice" | "syllabus" | "course-page" | "notes" | "reddit" | "x" | "other";

export interface Source {
  id: string; // stable, e.g. "s1"
  url: string;
  title: string;
  kind: SourceKind;
  snippet: string; // 1–2 sentences: why it matters
  foundBy: AgentName;
}

export interface Concept {
  id: string; // kebab-case, e.g. "avl-trees"
  label: string; // "AVL Trees"
  description: string; // 1–2 sentences
  unit?: string; // "Unit 3: Balanced Trees"
}

export interface ConceptEdge {
  from: string; // concept id (prerequisite)
  to: string; // concept id
  relation: "prereq" | "related";
}

/** How often a concept appears on past exams. 0..1 */
export interface ExamTopic {
  conceptId: string;
  frequency: number; // 0..1
  evidenceSourceIds: string[];
}

export interface Quote {
  text: string;
  sourceId: string;
  sentiment: "positive" | "neutral" | "negative";
}

/** How hard students find a concept. 0..1 */
export interface Difficulty {
  conceptId: string;
  score: number; // 0..1
  quotes: Quote[];
}

export interface Professor {
  name: string;
  email?: string;
  pageUrl?: string;
}

export interface CoursePack {
  course: { code: CourseCode; title: string; school: "Georgia Tech" };
  summary: string; // 2–3 sentence overview
  fearScore: number; // 0..100, overall "how feared is this class"
  concepts: Concept[]; // 8–20
  edges: ConceptEdge[];
  examTopics: ExamTopic[];
  difficulty: Difficulty[];
  studentQuotes: Quote[]; // top 3–8 quotes overall
  sources: Source[];
  professors: Professor[];
  tips: string[]; // 3–6 actionable study tips
  generatedAt: string; // ISO
  mocked: boolean; // true = seed/demo data, not live Grok
}

/** Lightweight card for the home-page gallery. */
export interface CourseSummary {
  code: CourseCode;
  title: string;
  fearScore: number;
  conceptCount: number;
  sourceCount: number;
  topConcept: string; // label of the hardest concept
}

/* ------------------------------------------------------------------ */
/* Scout stream (SSE)                                                   */
/* ------------------------------------------------------------------ */

export type AgentStatus = "queued" | "searching" | "thinking" | "done" | "error";

export type ScoutEvent =
  | { type: "agent"; agent: AgentName; status: AgentStatus; message: string }
  | { type: "source"; source: Source }
  | { type: "log"; agent: AgentName; message: string } // live "thought" ticker
  | { type: "pack"; pack: CoursePack }
  | { type: "error"; message: string }
  | { type: "done" };

/** POST /api/scout  body: ScoutRequest  ->  text/event-stream of `data: <ScoutEvent JSON>\n\n` */
export interface ScoutRequest {
  courseCode: CourseCode;
  /** Force live Grok even if a cached pack exists. Default false. */
  fresh?: boolean;
}

/* ------------------------------------------------------------------ */
/* Practice exam                                                        */
/* ------------------------------------------------------------------ */

export interface Question {
  id: string;
  conceptId: string;
  type: "mcq" | "short";
  prompt: string;
  choices?: string[]; // mcq only, 4 choices
  answer: string; // mcq: exact choice text; short: model answer
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  styleSourceId?: string; // past exam this question imitates
}

export interface PracticeExam {
  id: string;
  courseCode: CourseCode;
  title: string;
  questions: Question[];
  mocked: boolean;
}

/** POST /api/exam */
export interface ExamRequest {
  courseCode: CourseCode;
  count?: number; // default 6
  conceptIds?: string[]; // focus; default = highest examTopics frequency
}

/** POST /api/exam/grade */
export interface GradeRequest {
  courseCode: CourseCode;
  question: Question;
  userAnswer: string;
}
export interface GradeResponse {
  correct: boolean;
  score: number; // 0..1 (partial credit for short answer)
  feedback: string; // Grok's explanation, 1–3 sentences
  mocked: boolean;
}

/* ------------------------------------------------------------------ */
/* Study plan, outreach, chat, export                                  */
/* ------------------------------------------------------------------ */

/** POST /api/plan */
export interface PlanRequest {
  courseCode: CourseCode;
  examDate: string; // YYYY-MM-DD
  hoursPerDay: number;
}
export interface PlanDay {
  date: string; // YYYY-MM-DD
  conceptIds: string[];
  tasks: string[];
  minutes: number;
}
export interface StudyPlan {
  courseCode: CourseCode;
  days: PlanDay[];
  mocked: boolean;
}

/** POST /api/outreach : Grok drafts, a HUMAN sends. Never auto-send. */
export interface OutreachRequest {
  courseCode: CourseCode;
  professorName: string;
  studentName?: string;
  tone?: "formal" | "friendly";
}
export interface OutreachDraft {
  to?: string;
  subject: string;
  body: string;
  mailto: string; // ready-to-click mailto: link
  mocked: boolean;
}

/** POST /api/chat : ask questions grounded in the course pack. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatRequest {
  courseCode: CourseCode;
  messages: ChatMessage[];
}
export interface ChatResponse {
  reply: string;
  citedSourceIds: string[];
  mocked: boolean;
}

/**
 * GET /api/export/[code]?format=smartpath  -> SmartPathExport (JSON download)
 * GET /api/export/[code]?format=ics        -> text/calendar (needs ?examDate=YYYY-MM-DD&hoursPerDay=2)
 * SmartPath (gt-big-data/smart-path-ai) renders a knowledge graph of nodes + edges.
 */
export interface SmartPathExport {
  version: 1;
  course: string;
  nodes: { id: string; label: string; description: string; weight: number }[]; // weight = exam frequency
  edges: { source: string; target: string; type: "prereq" | "related" }[];
  quizzes: { conceptId: string; question: string; choices?: string[]; answer: string }[];
}

/* ------------------------------------------------------------------ */
/* Misc                                                                 */
/* ------------------------------------------------------------------ */

/** GET /api/courses -> CourseSummary[]   GET /api/packs/[code] -> CoursePack (404 ApiError if unknown) */

/** GET /api/board-stats -> how this project was built (shown on /built-by-agents). */
export interface BoardStats {
  posts: number;
  commits: number;
  lanes: { lane: string; posts: number; commits: number }[];
  recent: { lane: string; type: string; message: string; at: string }[];
}

/** GET /api/health */
export interface HealthResponse {
  ok: true;
  grokConfigured: boolean; // true if ANY live model is configured (xAI or Gemini)
  /** Which live model powers the app right now. "none" = seeded demo data. */
  provider?: "grok" | "gemini" | "none";
}

/** POST /api/ai : generic "ask Grok" (kept from starter). */
export interface AiRequest {
  prompt: string;
  system?: string;
}
export interface AiResponse {
  text: string;
  mocked: boolean;
}

/** Standard error body for every API route. */
export interface ApiError {
  error: string;
}

/** Normalize user input like "cs1332", "Cs-1332 " -> "CS 1332". */
export function normalizeCourseCode(input: string): CourseCode {
  const m = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").match(/^([A-Z]{2,4})(\d{4}[A-Z]?)$/);
  return m ? `${m[1]} ${m[2]}` : input.trim().toUpperCase();
}

/** URL slug for a course: "CS 1332" -> "cs-1332". */
export function courseSlug(code: CourseCode): string {
  return normalizeCourseCode(code).toLowerCase().replace(" ", "-");
}
