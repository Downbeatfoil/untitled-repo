/** Lane: viz. Local visual-test fixture (CS 1332-like). Used until lib/data seed packs exist; safe to import anywhere. */
import type { CoursePack, StudyPlan } from "@/shared/contract";

const q = (text: string, sourceId: string, sentiment: "positive" | "neutral" | "negative" = "negative") => ({ text, sourceId, sentiment });

export const fixturePack: CoursePack = {
  course: { code: "CS 1332", title: "Data Structures & Algorithms", school: "Georgia Tech" },
  summary: "CS 1332 is GT's gateway to serious CS: you implement every major data structure by hand and get tested on tricky pointer logic and Big-O reasoning.",
  fearScore: 78,
  concepts: [
    { id: "big-o", label: "Big-O Analysis", description: "Asymptotic time and space complexity.", unit: "Unit 1" },
    { id: "arrays-lists", label: "Arrays & Linked Lists", description: "Backing arrays, singly/doubly linked lists, deques.", unit: "Unit 1" },
    { id: "stacks-queues", label: "Stacks & Queues", description: "LIFO/FIFO ADTs and their implementations.", unit: "Unit 1" },
    { id: "recursion", label: "Recursion", description: "Recursive thinking and recurrences.", unit: "Unit 1" },
    { id: "bst", label: "Binary Search Trees", description: "BST add/remove/traversals.", unit: "Unit 2" },
    { id: "avl", label: "AVL Trees", description: "Self-balancing BSTs with rotations.", unit: "Unit 2" },
    { id: "heaps", label: "Heaps & Priority Queues", description: "Binary heaps and build-heap in O(n).", unit: "Unit 2" },
    { id: "hashing", label: "Hash Maps", description: "Hash functions, collisions, probing, chaining.", unit: "Unit 3" },
    { id: "sorting", label: "Sorting", description: "Comparison and non-comparison sorts, stability.", unit: "Unit 3" },
    { id: "graphs", label: "Graph Traversals", description: "BFS, DFS, connected components.", unit: "Unit 4" },
    { id: "dijkstra", label: "Dijkstra's Algorithm", description: "Single-source shortest path with a PQ.", unit: "Unit 4" },
    { id: "mst", label: "Minimum Spanning Trees", description: "Prim's and Kruskal's with union-find.", unit: "Unit 4" },
    { id: "dp", label: "Dynamic Programming", description: "Memoization and tabulation (LCS, knapsack).", unit: "Unit 5" },
    { id: "pattern", label: "Pattern Matching", description: "KMP, Boyer-Moore, Rabin-Karp.", unit: "Unit 5" },
  ],
  edges: [
    { from: "big-o", to: "sorting", relation: "prereq" },
    { from: "arrays-lists", to: "stacks-queues", relation: "prereq" },
    { from: "arrays-lists", to: "hashing", relation: "prereq" },
    { from: "recursion", to: "bst", relation: "prereq" },
    { from: "bst", to: "avl", relation: "prereq" },
    { from: "arrays-lists", to: "heaps", relation: "prereq" },
    { from: "heaps", to: "dijkstra", relation: "prereq" },
    { from: "stacks-queues", to: "graphs", relation: "prereq" },
    { from: "graphs", to: "dijkstra", relation: "prereq" },
    { from: "graphs", to: "mst", relation: "prereq" },
    { from: "recursion", to: "dp", relation: "prereq" },
    { from: "sorting", to: "pattern", relation: "related" },
    { from: "hashing", to: "pattern", relation: "related" },
    { from: "heaps", to: "sorting", relation: "related" },
    { from: "big-o", to: "arrays-lists", relation: "prereq" },
    { from: "big-o", to: "recursion", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "avl", frequency: 0.92, evidenceSourceIds: ["s1", "s2", "s3"] },
    { conceptId: "bst", frequency: 0.88, evidenceSourceIds: ["s1", "s2"] },
    { conceptId: "big-o", frequency: 0.85, evidenceSourceIds: ["s1", "s4"] },
    { conceptId: "hashing", frequency: 0.74, evidenceSourceIds: ["s2"] },
    { conceptId: "sorting", frequency: 0.7, evidenceSourceIds: ["s1", "s3"] },
    { conceptId: "heaps", frequency: 0.62, evidenceSourceIds: ["s3"] },
    { conceptId: "graphs", frequency: 0.55, evidenceSourceIds: ["s2", "s3"] },
    { conceptId: "dijkstra", frequency: 0.48, evidenceSourceIds: ["s2"] },
    { conceptId: "dp", frequency: 0.4, evidenceSourceIds: ["s4"] },
    { conceptId: "arrays-lists", frequency: 0.36, evidenceSourceIds: ["s1"] },
    { conceptId: "recursion", frequency: 0.3, evidenceSourceIds: ["s1"] },
    { conceptId: "mst", frequency: 0.22, evidenceSourceIds: ["s3"] },
    { conceptId: "pattern", frequency: 0.12, evidenceSourceIds: ["s4"] },
    { conceptId: "stacks-queues", frequency: 0.18, evidenceSourceIds: ["s1"] },
  ],
  difficulty: [
    { conceptId: "avl", score: 0.93, quotes: [q("AVL rotations broke me. Draw them out every time.", "s5"), q("Double rotations are the #1 exam trap.", "s6")] },
    { conceptId: "dp", score: 0.88, quotes: [q("DP is where the curve is made.", "s5")] },
    { conceptId: "dijkstra", score: 0.74, quotes: [q("Know why negative edges break it.", "s6", "neutral")] },
    { conceptId: "hashing", score: 0.66, quotes: [q("Probing sequences by hand are tedious but easy points.", "s5", "neutral")] },
    { conceptId: "bst", score: 0.58, quotes: [q("Remove with two children trips everyone once.", "s6")] },
    { conceptId: "heaps", score: 0.55, quotes: [] },
    { conceptId: "graphs", score: 0.5, quotes: [q("BFS vs DFS is free points if you drill it.", "s5", "positive")] },
    { conceptId: "sorting", score: 0.45, quotes: [] },
    { conceptId: "mst", score: 0.6, quotes: [] },
    { conceptId: "pattern", score: 0.8, quotes: [q("KMP failure table. Nope.", "s6")] },
    { conceptId: "big-o", score: 0.4, quotes: [q("Big-O is easy until they ask about amortized.", "s5", "neutral")] },
    { conceptId: "arrays-lists", score: 0.2, quotes: [] },
    { conceptId: "recursion", score: 0.35, quotes: [] },
    { conceptId: "stacks-queues", score: 0.15, quotes: [] },
  ],
  studentQuotes: [q("AVL rotations broke me.", "s5"), q("DP is where the curve is made.", "s5")],
  sources: [
    { id: "s1", url: "https://example.com/exam1", title: "Spring Exam 1 (public)", kind: "exam", snippet: "Past midterm.", foundBy: "exam-hunter" },
    { id: "s2", url: "https://example.com/exam2", title: "Fall Exam 2", kind: "exam", snippet: "Past midterm.", foundBy: "exam-hunter" },
    { id: "s3", url: "https://example.com/final", title: "Final practice", kind: "practice", snippet: "Practice final.", foundBy: "exam-hunter" },
    { id: "s4", url: "https://example.com/syllabus", title: "Course syllabus", kind: "syllabus", snippet: "Schedule.", foundBy: "syllabus-scout" },
    { id: "s5", url: "https://reddit.com/r/gatech/x", title: "r/gatech thread", kind: "reddit", snippet: "Students vent.", foundBy: "student-pulse" },
    { id: "s6", url: "https://x.com/i/status/1", title: "X post", kind: "x", snippet: "A tweet.", foundBy: "student-pulse" },
    { id: "s7", url: "https://example.com/notes", title: "Study notes", kind: "notes", snippet: "Notes.", foundBy: "concept-mapper" },
    { id: "s8", url: "https://example.com/page", title: "Course page", kind: "course-page", snippet: "Page.", foundBy: "syllabus-scout" },
  ],
  professors: [{ name: "Prof. Example" }],
  tips: ["Draw rotations", "Drill BFS/DFS", "Memorize Big-O table"],
  generatedAt: "2026-01-01T00:00:00.000Z",
  mocked: true,
};

function plan(): StudyPlan {
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 11, 1 + i));
    const minutes = i % 7 === 6 ? 0 : [60, 90, 120, 45, 150, 100][i % 6];
    return {
      date: d.toISOString().slice(0, 10),
      conceptIds: minutes ? ["avl", "bst"].slice(0, 1 + (i % 2)) : [],
      tasks: minutes ? ["Review notes", "Do 5 practice problems"] : [],
      minutes,
    };
  });
  return { courseCode: "CS 1332", days, mocked: true };
}
export const fixturePlan: StudyPlan = plan();
