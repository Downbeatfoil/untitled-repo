/**
 * Lane: data
 * Seed pack for CS 2050: Intro to Discrete Mathematics for CS at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs2050Sources: Source[] = [
  { id: "s2050-1", url: "https://cs2050.gatech.edu/syllabus", title: "CS 2050 Syllabus: Discrete Math for Computing", kind: "syllabus", snippet: "Propositional and predicate logic, mathematical induction, set theory, combinatorics, and graph theory.", foundBy: "syllabus-scout" },
  { id: "s2050-2", url: "https://github.com/gt-archives/cs2050-exam-archive", title: "CS 2050 Past Exams 1, 2, 3 Archive", kind: "exam", snippet: "Inductive proof structure templates, counting combinations with repetition, and Pigeonhole Principle problems.", foundBy: "exam-hunter" },
  { id: "s2050-3", url: "https://reddit.com/r/gatech/comments/cs2050_induction_proofs", title: "r/gatech: 'Strong Induction vs Weak Induction in 2050'", kind: "reddit", snippet: "Student advice on clearly stating the inductive hypothesis and verifying base cases.", foundBy: "student-pulse" },
];

export const cs2050Pack: CoursePack = {
  course: { code: "CS 2050", title: "Intro to Discrete Math for CS", school: "Georgia Tech" },
  summary: "Foundational mathematical reasoning and discrete structures for computer scientists. Rigorous practice with propositional/predicate logic, mathematical proofs (direct, contradiction, contrapositive, weak/strong induction), combinatorics, and introductory graph theory.",
  fearScore: 72,
  concepts: [
    { id: "propositional-predicate-logic", label: "Propositional & Predicate Logic", description: "Truth tables, logical equivalences, quantifiers (for all, there exists), and negation of nested quantifiers.", unit: "Unit 1: Logic" },
    { id: "proof-techniques", label: "Direct, Contrapositive & Contradiction Proofs", description: "Formal argument structures, parity proofs, rational number proofs, and proofs by contradiction.", unit: "Unit 1: Logic" },
    { id: "mathematical-induction", label: "Mathematical Induction (Weak & Strong)", description: "Well-ordering principle, base case verification, inductive hypothesis, and inductive step for sums and inequalities.", unit: "Unit 2: Induction" },
    { id: "sets-functions-relations", label: "Sets, Functions & Equivalence Relations", description: "Cartesian products, power sets, injective/surjective/bijective functions, reflexivity, symmetry, and transitivity.", unit: "Unit 3: Sets & Relations" },
    { id: "combinatorics-pigeonhole", label: "Combinatorics & The Pigeonhole Principle", description: "Permutations, combinations, stars and bars (combinations with repetition), and generalized pigeonhole arguments.", unit: "Unit 4: Counting" },
    { id: "graph-theory-trees", label: "Introductory Graph Theory & Trees", description: "Handshaking lemma, bipartite graphs, Eulerian vs Hamiltonian paths, planar graphs, and tree properties.", unit: "Unit 5: Graphs" },
  ],
  edges: [
    { from: "propositional-predicate-logic", to: "proof-techniques", relation: "prereq" },
    { from: "proof-techniques", to: "mathematical-induction", relation: "prereq" },
    { from: "proof-techniques", to: "sets-functions-relations", relation: "prereq" },
    { from: "sets-functions-relations", to: "combinatorics-pigeonhole", relation: "prereq" },
    { from: "sets-functions-relations", to: "graph-theory-trees", relation: "related" },
  ],
  examTopics: [
    { conceptId: "mathematical-induction", frequency: 0.96, evidenceSourceIds: ["s2050-2", "s2050-3"] },
    { conceptId: "combinatorics-pigeonhole", frequency: 0.92, evidenceSourceIds: ["s2050-2"] },
    { conceptId: "proof-techniques", frequency: 0.88, evidenceSourceIds: ["s2050-2"] },
    { conceptId: "graph-theory-trees", frequency: 0.82, evidenceSourceIds: ["s2050-1"] },
  ],
  difficulty: [
    { conceptId: "mathematical-induction", score: 0.84, quotes: [{ text: "Strong induction problems with recurrence relations require careful multiple base cases.", sourceId: "s2050-3", sentiment: "neutral" }] },
    { conceptId: "combinatorics-pigeonhole", score: 0.8, quotes: [{ text: "Stars and bars word problems always have subtle constraints like 'at least 2 per bin'.", sourceId: "s2050-2", sentiment: "negative" }] },
  ],
  studentQuotes: [
    { text: "Write out the inductive hypothesis explicitly. Graders look for that exact line first.", sourceId: "s2050-3", sentiment: "positive" },
    { text: "Pigeonhole principle problems sound easy in lecture but are very tricky on midterms.", sourceId: "s2050-2", sentiment: "neutral" },
  ],
  sources: cs2050Sources,
  professors: [{ name: "Dr. Gerandy Brito", email: "gbrito@cc.gatech.edu" }],
  tips: [
    "Always identify and prove all necessary base cases before doing the inductive step.",
    "For combinatorics, ask yourself: does order matter? Is repetition allowed?",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
