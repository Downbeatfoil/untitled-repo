/**
 * Lane: data
 * Generates plausible fallback CoursePacks for any unseeded course code when no API key is available.
 */
import type { CoursePack, Source } from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";

interface DeptTheme {
  title: string;
  concepts: { id: string; label: string; desc: string; unit: string }[];
}

const DEPT_THEMES: Record<string, DeptTheme> = {
  CS: {
    title: "Foundations of Computing",
    concepts: [
      { id: "computational-complexity", label: "Computational Complexity & Big-O", desc: "Analysis of worst, average, and best-case algorithm resource bounds.", unit: "Unit 1: Theory" },
      { id: "data-representation", label: "Data Representation & Memory Layout", desc: "Binary encodings, memory models, cache locality, and pointer semantics.", unit: "Unit 1: Theory" },
      { id: "recursive-problem-solving", label: "Recursive Decomposition & State", desc: "Divide-and-conquer paradigms, recurrence relations, and base case formulation.", unit: "Unit 2: Paradigms" },
      { id: "graph-abstractions", label: "Graph & Tree Abstractions", desc: "Modeling network dependencies with traversal and search algorithms.", unit: "Unit 2: Paradigms" },
      { id: "system-concurrency", label: "Concurrency & Synchronization", desc: "Processes, threads, race conditions, mutual exclusion locks, and deadlocks.", unit: "Unit 3: Systems" },
      { id: "testing-invariants", label: "Program Verification & Invariants", desc: "Loop invariants, assertion checking, and regression test suites.", unit: "Unit 3: Systems" },
    ],
  },
  MATH: {
    title: "Applied Mathematical Foundations",
    concepts: [
      { id: "vector-spaces", label: "Vector Spaces & Subspaces", desc: "Linear combinations, bases, dimension, and linear independence.", unit: "Unit 1: Linear Spaces" },
      { id: "matrix-equations", label: "Matrix Operations & Systems", desc: "Row reduction, matrix inversions, determinants, and solution spaces.", unit: "Unit 1: Linear Spaces" },
      { id: "differential-equations", label: "Differential Models & Rates", desc: "First and second order equations, phase planes, and equilibrium solutions.", unit: "Unit 2: Dynamics" },
      { id: "convergence-series", label: "Convergence Tests & Power Series", desc: "Taylor approximations, error bounds, and series convergence criteria.", unit: "Unit 2: Dynamics" },
      { id: "multivariable-opt", label: "Multivariable Optimization & Gradients", desc: "Partial derivatives, Lagrange multipliers, and critical point classification.", unit: "Unit 3: Optimization" },
      { id: "applied-probability", label: "Probability Distributions & Expectation", desc: "Discrete and continuous random variables, conditional probability, and variance.", unit: "Unit 3: Optimization" },
    ],
  },
  PHYS: {
    title: "Foundations of Physical Principles",
    concepts: [
      { id: "conservation-laws", label: "Conservation of Energy & Momentum", desc: "Isolated systems, mechanical work, kinetic transfer, and impulse theorems.", unit: "Unit 1: Mechanics" },
      { id: "newtonian-dynamics", label: "Newtonian Dynamics & Forces", desc: "Free-body analysis, friction models, and coupled coordinate systems.", unit: "Unit 1: Mechanics" },
      { id: "field-theory", label: "Electric & Magnetic Fields", desc: "Gauss's law, potential differences, Ampere's law, and field line flux.", unit: "Unit 2: Fields" },
      { id: "wave-optics", label: "Wave Mechanics & Interference", desc: "Harmonic waves, superposition, Doppler effect, and diffraction patterns.", unit: "Unit 2: Fields" },
      { id: "thermodynamics", label: "Thermodynamics & Heat Cycles", desc: "Laws of thermodynamics, PV diagrams, entropy, and Carnot efficiency.", unit: "Unit 3: Thermodynamics" },
    ],
  },
  ECE: {
    title: "Electrical & Computer Systems",
    concepts: [
      { id: "circuit-analysis", label: "Node-Voltage & Mesh-Current Analysis", desc: "Kirchhoff's laws, Thevenin equivalents, and operational amplifier models.", unit: "Unit 1: Circuits" },
      { id: "signal-processing", label: "Signals, Systems & Fourier Transforms", desc: "LTI systems, convolution, frequency response, and Bode plots.", unit: "Unit 2: Signals" },
      { id: "digital-logic-arch", label: "Digital Logic & Microarchitectures", desc: "Combinational circuits, flip-flops, pipelining, and hazard detection.", unit: "Unit 3: Digital Design" },
      { id: "semiconductors", label: "Semiconductor Devices (Diodes & MOSFETs)", desc: "PN junctions, transistor IV characteristics, biasing, and small-signal models.", unit: "Unit 4: Solid State" },
    ],
  },
  ISYE: {
    title: "Industrial & Operations Engineering",
    concepts: [
      { id: "linear-programming", label: "Linear Programming & Simplex Algorithm", desc: "Objective functions, constraints, simplex tableau, and shadow prices.", unit: "Unit 1: Optimization" },
      { id: "stochastic-models", label: "Stochastic Processes & Markov Chains", desc: "Transition probability matrices, steady-state distributions, and birth-death queues.", unit: "Unit 2: Stochastic" },
      { id: "statistical-inference", label: "Statistical Quality & Hypothesis Testing", desc: "Confidence intervals, ANOVA, p-values, and regression modeling.", unit: "Unit 3: Statistics" },
      { id: "supply-chain-logistics", label: "Supply Chain & Inventory Models", desc: "Economic Order Quantity (EOQ), safety stock, and network routing heuristics.", unit: "Unit 4: Logistics" },
    ],
  },
};

/** Synthesize a fallback pack for an arbitrary course code. */
export function makeGenericPack(rawCode: string): CoursePack {
  const code = normalizeCourseCode(rawCode);
  const deptMatch = code.match(/^([A-Z]+)/);
  const dept = deptMatch ? deptMatch[1] : "CS";
  const theme = DEPT_THEMES[dept] ?? DEPT_THEMES.CS;

  const sources: Source[] = [
    {
      id: "gen-s1",
      url: `https://catalog.gatech.edu/courses/${encodeURIComponent(code)}`,
      title: `${code}: Georgia Tech Official Catalog Entry`,
      kind: "syllabus",
      snippet: `Official course description and prerequisite structure for ${code}.`,
      foundBy: "syllabus-scout",
    },
    {
      id: "gen-s2",
      url: `https://github.com/gt-archives/${encodeURIComponent(code.toLowerCase().replace(/\s+/g, "-"))}`,
      title: `${code} Public Past Exam & Study Guide Repository`,
      kind: "exam",
      snippet: `Publicly shared problem sets and exam reviews matching the official curriculum for ${code}.`,
      foundBy: "exam-hunter",
    },
    {
      id: "gen-s3",
      url: `https://reddit.com/r/gatech/search?q=${encodeURIComponent(code)}`,
      title: `r/gatech: Student Discussion & Course Reviews for ${code}`,
      kind: "reddit",
      snippet: `Student thread discussing workload, exam difficulty, and recommended study strategies for ${code}.`,
      foundBy: "student-pulse",
    },
    {
      id: "gen-s4",
      url: `https://gatech.instructure.com/courses/${encodeURIComponent(code.toLowerCase())}`,
      title: `${code} Canvas Course Site & Resource Index`,
      kind: "course-page",
      snippet: `Lecture notes and practice worksheets for ${code}.`,
      foundBy: "concept-mapper",
    },
  ];

  const concepts = theme.concepts.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.desc,
    unit: c.unit,
  }));

  const edges = concepts.slice(1).map((c, i) => ({
    from: concepts[i].id,
    to: c.id,
    relation: "prereq" as const,
  }));

  const examTopics = concepts.map((c, i) => ({
    conceptId: c.id,
    frequency: Math.max(0.4, Number((0.95 - i * 0.08).toFixed(2))),
    evidenceSourceIds: ["gen-s2"],
  }));

  const difficulty = concepts.map((c, i) => ({
    conceptId: c.id,
    score: Math.max(0.4, Number((0.85 - i * 0.07).toFixed(2))),
    quotes: i === 0 ? [{ text: `Pay close attention to ${c.label} on midterms.`, sourceId: "gen-s3", sentiment: "neutral" as const }] : [],
  }));

  return {
    course: {
      code,
      title: `${dept} Core: ${theme.title}`,
      school: "Georgia Tech",
    },
    summary: `Curated study pack for ${code} covering core foundational concepts, high-yield exam topics, and student study recommendations at Georgia Tech.`,
    fearScore: 68,
    concepts,
    edges,
    examTopics,
    difficulty,
    studentQuotes: [
      { text: `Stay on top of weekly assignments in ${code}; cramming before the exam is risky.`, sourceId: "gen-s3", sentiment: "neutral" },
      { text: `Doing all the practice exams from previous semesters gave me the biggest score boost.`, sourceId: "gen-s3", sentiment: "positive" },
    ],
    sources,
    professors: [{ name: "Faculty Instructor" }],
    tips: [
      `Review lecture notes weekly and solve end-of-chapter practice problems.`,
      `Practice past exams under timed conditions.`,
      `Form a study group to talk through difficult proof and derivation steps.`,
    ],
    generatedAt: new Date().toISOString(),
    mocked: true,
  };
}
