/**
 * Lane: data
 * Seed pack for CS 3510: Design & Analysis of Algorithms at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs3510Sources: Source[] = [
  {
    id: "s3510-1",
    url: "https://sites.google.com/site/gtcs3510",
    title: "CS 3510 Syllabus & Lecture Outline",
    kind: "syllabus",
    snippet: "Upper-level theoretical computer science focusing on algorithm design techniques, rigorous proofs of correctness, and NP-completeness.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s3510-2",
    url: "https://github.com/gt-archives/cs3510-exam-archive",
    title: "CS 3510 Past Midterm & Final Exam Collection",
    kind: "exam",
    snippet: "Comprehensive archive of proof-based problems: writing dynamic programming recurrences and polynomial-time reduction proofs.",
    foundBy: "exam-hunter",
  },
  {
    id: "s3510-3",
    url: "https://reddit.com/r/gatech/comments/cs3510_reduction_survival",
    title: "r/gatech: 'NP-Completeness reductions in 3510 made me question reality'",
    kind: "reddit",
    snippet: "Advice on proving reductions in both directions: if instance A has solution <=> transformed instance B has solution.",
    foundBy: "student-pulse",
  },
];

export const cs3510Pack: CoursePack = {
  course: { code: "CS 3510", title: "Design & Analysis of Algorithms", school: "Georgia Tech" },
  summary: "Georgia Tech's advanced theoretical algorithms course. Focuses on rigorous mathematical proofs of correctness and asymptotic running times for Divide and Conquer, Dynamic Programming, Greedy Algorithms, Network Flows, and NP-Complete Reductions.",
  fearScore: 88,
  concepts: [
    { id: "divide-and-conquer", label: "Divide & Conquer (Master Theorem & FFT)", description: "Recursive decomposition, recurrence relations, Master Theorem cases, and Fast Fourier Transform.", unit: "Unit 1: Paradigms" },
    { id: "dynamic-programming-advanced", label: "Dynamic Programming (Knapsack, Matrix Chain, Treewidth)", description: "Optimal substructure, overlapping subproblems, memoization vs bottom-up tables, and state reconstruction.", unit: "Unit 2: Dynamic Programming" },
    { id: "greedy-algorithms", label: "Greedy Algorithms & Exchange Arguments", description: "Matroids, greedy choice property, fractional knapsack, interval scheduling, and inductive exchange proofs.", unit: "Unit 2: Dynamic Programming" },
    { id: "network-flow", label: "Network Flow & Max-Flow Min-Cut Theorem", description: "Ford-Fulkerson, Edmonds-Karp, residual graphs, augmenting paths, and bipartite matching reductions.", unit: "Unit 3: Flow & Cuts" },
    { id: "linear-programming-duality", label: "Linear Programming & Duality", description: "Primal vs dual formulations, standard form, weak and strong duality theorems, and complementary slackness.", unit: "Unit 3: Flow & Cuts" },
    { id: "np-completeness-reductions", label: "NP-Completeness & Polynomial Reductions", description: "P, NP, NP-Hard, NP-Complete definitions; Cook-Levin theorem; reductions from 3-SAT, Vertex Cover, Clique, and Subset Sum.", unit: "Unit 4: Complexity" },
  ],
  edges: [
    { from: "divide-and-conquer", to: "dynamic-programming-advanced", relation: "related" },
    { from: "greedy-algorithms", to: "dynamic-programming-advanced", relation: "related" },
    { from: "network-flow", to: "linear-programming-duality", relation: "prereq" },
    { from: "dynamic-programming-advanced", to: "np-completeness-reductions", relation: "related" },
    { from: "network-flow", to: "np-completeness-reductions", relation: "related" },
  ],
  examTopics: [
    { conceptId: "np-completeness-reductions", frequency: 0.98, evidenceSourceIds: ["s3510-2", "s3510-3"] },
    { conceptId: "dynamic-programming-advanced", frequency: 0.95, evidenceSourceIds: ["s3510-2"] },
    { conceptId: "network-flow", frequency: 0.82, evidenceSourceIds: ["s3510-2"] },
    { conceptId: "divide-and-conquer", frequency: 0.78, evidenceSourceIds: ["s3510-1"] },
  ],
  difficulty: [
    { conceptId: "np-completeness-reductions", score: 0.95, quotes: [{ text: "Proving both directions of a reduction (yes-instance to yes-instance and no-instance to no-instance) is where people lose 15 points instantly.", sourceId: "s3510-3", sentiment: "negative" }] },
    { conceptId: "dynamic-programming-advanced", score: 0.88, quotes: [{ text: "Coming up with the right state definition in 20 minutes on an exam is stressful.", sourceId: "s3510-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "Treat every DP problem like a 4-step template: definition, recurrence, base cases, and evaluation order.", sourceId: "s3510-2", sentiment: "positive" },
    { text: "Reductions are the hardest part of the course. Practice reducing from 3-SAT to Independent Set until you can do it in your sleep.", sourceId: "s3510-3", sentiment: "negative" },
  ],
  sources: cs3510Sources,
  professors: [{ name: "Dr. Eric Vigoda", email: "vigoda@gatech.edu" }],
  tips: [
    "Always state your reduction in both directions: show x is in A implies f(x) is in B, AND f(x) in B implies x in A.",
    "For DP, clearly describe in plain English what your DP[i][j] table entry represents before writing the formula.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
