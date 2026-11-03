/**
 * Lane: pages. LOCAL FALLBACK data so pages never blank if /api is down.
 * Real data comes from lib/api-client.ts; this only kicks in on error.
 */
import type { CoursePack, CourseSummary, Source, SourceKind } from "@/shared/contract";
import { courseSlug, normalizeCourseCode } from "@/shared/contract";

interface Spec {
  code: string;
  title: string;
  fear: number;
  summary: string;
  concepts: [string, string, number, number][]; // label, unit, examFreq, difficulty
  prof: string;
  tips: string[];
}

const SPECS: Spec[] = [
  {
    code: "CS 1332", title: "Data Structures & Algorithms", fear: 78,
    summary: "GT's gateway to 'real' CS. Weekly Java homework, three exams that reward careful runtime analysis, and a notoriously unforgiving autograder.",
    prof: "Dr. Brito",
    concepts: [
      ["Big-O Analysis", "Unit 1: Foundations", 0.9, 0.55], ["Arrays & ArrayLists", "Unit 1: Foundations", 0.6, 0.25],
      ["Linked Lists", "Unit 1: Foundations", 0.75, 0.4], ["Stacks & Queues", "Unit 2: Linear ADTs", 0.55, 0.3],
      ["Binary Search Trees", "Unit 3: Trees", 0.85, 0.6], ["AVL Trees", "Unit 3: Trees", 0.95, 0.88],
      ["2-4 Trees", "Unit 3: Trees", 0.5, 0.82], ["Heaps & Priority Queues", "Unit 4: Heaps", 0.7, 0.5],
      ["Hashing", "Unit 5: Maps", 0.8, 0.62], ["Sorting Algorithms", "Unit 6: Sorting", 0.9, 0.58],
      ["Graph Traversals", "Unit 7: Graphs", 0.65, 0.66], ["Dijkstra & MSTs", "Unit 7: Graphs", 0.6, 0.78],
    ],
    tips: ["Draw every AVL rotation on paper until it's automatic.", "Write your own runtime proofs, don't just memorize Big-O tables.", "Do the past exams under timed conditions: Exam 2 is the cliff.", "Start homework on day one; the autograder punishes edge cases."],
  },
  {
    code: "CS 2110", title: "Computer Organization & Programming", fear: 84,
    summary: "LC-3 assembly, C, and a hardware-flavored mindset. Pointer bugs and stack-frame diagrams decide your grade.",
    prof: "Dr. Leahy",
    concepts: [
      ["Binary & Number Systems", "Unit 1: Data", 0.6, 0.3], ["Digital Logic", "Unit 1: Data", 0.55, 0.45],
      ["LC-3 Assembly", "Unit 2: Assembly", 0.95, 0.8], ["Subroutines & the Stack", "Unit 2: Assembly", 0.9, 0.86],
      ["Pointers in C", "Unit 3: C", 0.85, 0.75], ["Memory & malloc", "Unit 3: C", 0.7, 0.7],
      ["Caches", "Unit 4: Systems", 0.5, 0.72], ["Interrupts & I/O", "Unit 4: Systems", 0.45, 0.65],
    ],
    tips: ["Trace the stack frame by hand for every subroutine.", "Use gdb and valgrind early.", "Redo past LC-3 exam problems until you can write them blind."],
  },
  {
    code: "CS 1331", title: "Intro to Object-Oriented Programming", fear: 52,
    summary: "Java and OOP fundamentals with a heavy style/checkstyle grading flavor. Approachable but time-consuming.",
    prof: "Dr. Simpkins",
    concepts: [
      ["Classes & Objects", "Unit 1", 0.9, 0.3], ["Inheritance", "Unit 2", 0.85, 0.45], ["Interfaces & Polymorphism", "Unit 2", 0.8, 0.55],
      ["Exceptions", "Unit 3", 0.6, 0.35], ["Generics & Collections", "Unit 3", 0.7, 0.6], ["JavaFX & Events", "Unit 4", 0.4, 0.5],
    ],
    tips: ["Run checkstyle before every submit.", "Know interface vs abstract class cold.", "Practice reading code and predicting output."],
  },
  {
    code: "MATH 1554", title: "Linear Algebra", fear: 71,
    summary: "Computation-heavy linear algebra with a conceptual twist on exams: true/false and justify-your-answer questions trip students up.",
    prof: "Dr. Margalit",
    concepts: [
      ["Row Reduction", "Unit 1", 0.9, 0.25], ["Linear Independence & Span", "Unit 1", 0.85, 0.55], ["Matrix Transformations", "Unit 2", 0.7, 0.5],
      ["Determinants", "Unit 3", 0.65, 0.45], ["Eigenvalues & Eigenvectors", "Unit 4", 0.95, 0.82], ["Orthogonality & Least Squares", "Unit 5", 0.75, 0.78],
      ["Diagonalization", "Unit 4", 0.6, 0.8],
    ],
    tips: ["Memorize the invertible matrix theorem equivalences.", "Practice true/false justifications, not just computations.", "Do all the old exams, the style repeats."],
  },
  {
    code: "CS 3510", title: "Design & Analysis of Algorithms", fear: 88,
    summary: "Proof-based algorithms: divide and conquer, DP, graph algorithms, NP-completeness. Reductions are the wall.",
    prof: "Dr. Vigoda",
    concepts: [
      ["Divide & Conquer", "Unit 1", 0.8, 0.6], ["Dynamic Programming", "Unit 2", 0.95, 0.85], ["Greedy Algorithms", "Unit 2", 0.6, 0.55],
      ["Graph Algorithms", "Unit 3", 0.7, 0.65], ["Max-Flow / Min-Cut", "Unit 3", 0.55, 0.8], ["NP-Completeness & Reductions", "Unit 4", 0.9, 0.92],
    ],
    tips: ["Treat DP as a recipe: subproblem, recurrence, base case, order.", "Practice 3-SAT reductions weekly.", "Write clean proofs, graders punish hand-waving."],
  },
  {
    code: "PHYS 2211", title: "Intro Physics I", fear: 66,
    summary: "Calculus-based mechanics. Exams are multi-step and unit-sensitive; lecture clickers and WebAssign pile up.",
    prof: "Dr. Kennedy",
    concepts: [
      ["Kinematics", "Unit 1", 0.7, 0.35], ["Newton's Laws", "Unit 2", 0.95, 0.55], ["Work & Energy", "Unit 3", 0.85, 0.6],
      ["Momentum & Collisions", "Unit 4", 0.75, 0.62], ["Rotational Motion", "Unit 5", 0.8, 0.85], ["Oscillations", "Unit 6", 0.45, 0.6],
    ],
    tips: ["Start every problem with a free-body diagram.", "Track units through every step.", "Rotational motion is the exam killer, drill it."],
  },
];

const KINDS: SourceKind[] = ["exam", "syllabus", "reddit", "x", "practice", "course-page"];
const AGENT_OF: Record<string, "exam-hunter" | "syllabus-scout" | "student-pulse"> = {
  exam: "exam-hunter", practice: "exam-hunter", syllabus: "syllabus-scout", "course-page": "syllabus-scout", reddit: "student-pulse", x: "student-pulse",
};

function buildSources(code: string): Source[] {
  const s = courseSlug(code);
  const rows: [SourceKind, string, string, string][] = [
    ["exam", `${code} Past Exam 2 (Fall) — public archive`, `https://example.edu/archive/${s}/exam2.pdf`, "Most recent public midterm; heavy on tree and runtime questions."],
    ["practice", `${code} Practice Problems`, `https://example.edu/${s}/practice`, "Instructor-posted practice set that mirrors exam style."],
    ["syllabus", `${code} Syllabus`, `https://example.edu/${s}/syllabus`, "Weekly schedule, grading breakdown and exam dates."],
    ["course-page", `${code} Course Page`, `https://example.edu/${s}`, "Official course site with office hours and staff."],
    ["reddit", `r/gatech: "Surviving ${code}"`, `https://reddit.com/r/gatech/${s}`, "Students compare notes on what the exams actually cover."],
    ["x", `Student thread on ${code}`, `https://x.com/search?q=${encodeURIComponent(code)}`, "Recent posts about how hard the latest exam felt."],
  ];
  return rows.map(([kind, title, url, snippet], i) => ({
    id: `s${i + 1}`, url, title, kind, snippet, foundBy: AGENT_OF[kind],
  }));
}

const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function buildSeedPack(codeInput: string): CoursePack | null {
  const code = normalizeCourseCode(codeInput);
  const spec = SPECS.find((s) => s.code === code);
  if (!spec) return null;
  const sources = buildSources(code);
  const concepts = spec.concepts.map(([label, unit]) => ({
    id: kebab(label), label, unit,
    description: `${label}: a core topic in ${spec.title}. Appears throughout the ${unit.split(":")[0].toLowerCase()} material.`,
  }));
  const edges = concepts.slice(1).map((c, i) => ({ from: concepts[Math.max(0, i - (i % 3 === 2 ? 1 : 0))].id, to: c.id, relation: "prereq" as const }));
  const quotes = [
    { text: `"${spec.concepts[0][0]} shows up on every exam, don't skip it."`, sourceId: "s5", sentiment: "neutral" as const },
    { text: `"${spec.concepts.reduce((a, b) => (b[3] > a[3] ? b : a))[0]} absolutely destroyed me."`, sourceId: "s6", sentiment: "negative" as const },
    { text: `"Past exams were the single best prep. Do them timed."`, sourceId: "s5", sentiment: "positive" as const },
  ];
  return {
    course: { code, title: spec.title, school: "Georgia Tech" },
    summary: spec.summary,
    fearScore: spec.fear,
    concepts, edges,
    examTopics: spec.concepts.map(([label, , f], i) => ({ conceptId: kebab(label), frequency: f, evidenceSourceIds: [sources[i % 2].id] })),
    difficulty: spec.concepts.map(([label, , , d]) => ({ conceptId: kebab(label), score: d, quotes: d > 0.7 ? [quotes[1]] : [] })),
    studentQuotes: quotes,
    sources,
    professors: [{ name: spec.prof }],
    tips: spec.tips,
    generatedAt: new Date().toISOString(),
    mocked: true,
  };
}

export function seedSummaries(): CourseSummary[] {
  return SPECS.map((s) => {
    const hardest = s.concepts.reduce((a, b) => (b[3] > a[3] ? b : a));
    return { code: s.code, title: s.title, fearScore: s.fear, conceptCount: s.concepts.length, sourceCount: 6, topConcept: hardest[0] };
  });
}

export const EXAMPLE_CODES = ["CS 1332", "MATH 1554", "CS 2110", "CS 3510", "PHYS 2211"];
export { KINDS };
