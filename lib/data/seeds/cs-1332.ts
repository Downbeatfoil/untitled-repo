/**
 * Lane: data
 * Seed pack for CS 1332: Data Structures & Algorithms at Georgia Tech.
 * P0 critical path seed.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs1332Sources: Source[] = [
  {
    id: "s1",
    url: "https://gatech.instructure.com/courses/cs1332-syllabus-public",
    title: "CS 1332 Official Syllabus & Course Policy",
    kind: "syllabus",
    snippet: "Covers course structure, recitation policies, 3 midterms, final exam breakdown, and strict autograder JUnit deadlines.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s2",
    url: "https://cs1332.gitlab.io/course-schedule",
    title: "CS 1332 Weekly Schedule & Lecture Calendar",
    kind: "course-page",
    snippet: "Detailed 16-week progression from Big-O through Balanced Trees, Sorting, Pattern Matching, and Graph Algorithms.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s3",
    url: "https://github.com/gt-cs1332-archive/past-exam-1-fall",
    title: "CS 1332 Past Exam 1: Linear ADTs, ArrayLists, and Tree Traversals",
    kind: "exam",
    snippet: "Public sample exam testing pointer manipulation, Big-O worst vs amortized bounds, and BST recursive removals.",
    foundBy: "exam-hunter",
  },
  {
    id: "s4",
    url: "https://github.com/gt-cs1332-archive/past-exam-2-spring",
    title: "CS 1332 Past Exam 2: AVL Rotations, (2,4) Trees, and Hash Collisions",
    kind: "exam",
    snippet: "The notorious 'Exam 2': tests double rotations (RL/LR), height recalculation, and quadratic probing vs double hashing.",
    foundBy: "exam-hunter",
  },
  {
    id: "s5",
    url: "https://github.com/gt-cs1332-archive/past-exam-3-fall",
    title: "CS 1332 Past Exam 3: Pattern Matching, Sorting & Graph Algorithms",
    kind: "exam",
    snippet: "Hand-tracing Boyer-Moore last-occurrence tables, KMP failure tables, and Dijkstra step-by-step priority queue states.",
    foundBy: "exam-hunter",
  },
  {
    id: "s6",
    url: "https://cs1332.org/practice-worksheets/trees-and-heaps",
    title: "Official Practice Worksheet: Up-Heap, Down-Heap & AVL Edge Cases",
    kind: "practice",
    snippet: "Drill problems on heap buildArray in O(n) vs successive add in O(n log n), plus tricky AVL rotation cases.",
    foundBy: "exam-hunter",
  },
  {
    id: "s7",
    url: "https://cs1332.org/practice-worksheets/graphs-dp",
    title: "Official Practice Worksheet: MSTs, Dijkstra & Dynamic Programming",
    kind: "practice",
    snippet: "Comprehensive practice on Prim vs Kruskal edge selection, negative weight cycles in Dijkstra, and recurrence formulations.",
    foundBy: "exam-hunter",
  },
  {
    id: "s8",
    url: "https://reddit.com/r/gatech/comments/1332_exam2_survival_guide",
    title: "r/gatech: 'How to survive CS 1332 Exam 2 without losing your sanity'",
    kind: "reddit",
    snippet: "Top-voted survival advice emphasizing handwritten AVL rotations, pointer diagrams, and practicing on a whiteboard under time pressure.",
    foundBy: "student-pulse",
  },
  {
    id: "s9",
    url: "https://reddit.com/r/gatech/comments/cs1332_tips_for_freshmen",
    title: "r/gatech: 'CS 1332 is manageable if you write your own tests'",
    kind: "reddit",
    snippet: "Student consensus: the provided JUnit tests only cover ~40% of cases. You must test null inputs, resizing, and duplicate keys yourself.",
    foundBy: "student-pulse",
  },
  {
    id: "s10",
    url: "https://x.com/gt_cs_memes/status/1715000000000000000",
    title: "GT Student Post on X: Exam 2 Cliff Reaction",
    kind: "x",
    snippet: "'I walked into 1332 Exam 2 thinking I understood AVL rotations, and walked out questioning my entire major.'",
    foundBy: "student-pulse",
  },
  {
    id: "s11",
    url: "https://x.com/gatech_student/status/1722000000000000000",
    title: "GT Student Post on X: Dijkstra vs Prim Clarification",
    kind: "x",
    snippet: "'Reminder that Dijkstra finds shortest path from single source, Prim builds min spanning tree. Stop mixing them up on Exam 3!'",
    foundBy: "student-pulse",
  },
  {
    id: "s12",
    url: "https://notes.gt-cs.net/cs1332/comprehensive-study-guide",
    title: "GT Student Honor Society: CS 1332 Comprehensive Notes & Runtime Sheet",
    kind: "notes",
    snippet: "Tabulated cheat sheet of best, average, and worst-case runtimes plus space complexity for all 18 data structures and algorithms.",
    foundBy: "concept-mapper",
  },
  {
    id: "s13",
    url: "https://cs1332.gitlab.io/java-visualizations",
    title: "Interactive Data Structure Visualizer for CS 1332",
    kind: "course-page",
    snippet: "Canvas-based visual animations of 2-4 tree splits, AVL balancing, and KMP prefix alignments used in recitation.",
    foundBy: "concept-mapper",
  },
  {
    id: "s14",
    url: "https://gatech.instructure.com/courses/cs1332-recitation-guides",
    title: "CS 1332 Recitation Handouts: Step-by-Step Tree Balancing & Heaps",
    kind: "practice",
    snippet: "Official recitation walkthroughs on AVL rotation mechanics, 2-4 tree overflow splits, and BuildHeap pointer operations.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s15",
    url: "https://x.com/gt_whispers/status/1728000000000000000",
    title: "GT Student Post on X: Hash Table Probing Pitfalls",
    kind: "x",
    snippet: "'Never forget the DEL marker when removing from a probing hash map, or your lookups will terminate prematurely.'",
    foundBy: "student-pulse",
  },
  {
    id: "s16",
    url: "https://github.com/gt-cs1332-archive/final-exam-review",
    title: "CS 1332 Comprehensive Final Exam Review Sheet & Graph Guide",
    kind: "exam",
    snippet: "Curated GT student review consolidating all 14 data structures, worst-case runtime bounds, and MST edge cases.",
    foundBy: "exam-hunter",
  },
];

export const cs1332Pack: CoursePack = {
  course: {
    code: "CS 1332",
    title: "Data Structures & Algorithms",
    school: "Georgia Tech",
  },
  summary:
    "Georgia Tech's quintessential gateway CS course. Demands rigorous Java implementation of core ADTs, precise Big-O asymptotic analysis, and manual tracing of complex tree and graph operations under strict time constraints.",
  fearScore: 78,
  concepts: [
    {
      id: "big-o",
      label: "Big-O Asymptotic Analysis",
      description: "Mathematical notation classifying algorithms by time and space complexity in best, average, and worst cases.",
      unit: "Unit 1: Foundations",
    },
    {
      id: "arrays-arraylists",
      label: "Arrays & ArrayLists",
      description: "Contiguous memory structures, amortized O(1) resizing, capacity vs size, and shifting overhead.",
      unit: "Unit 1: Foundations",
    },
    {
      id: "linked-lists",
      label: "Linked Lists (Singly, Doubly, Circular)",
      description: "Node-based pointer structures, head/tail reference maintenance, sentinel nodes, and O(1) edge removals.",
      unit: "Unit 1: Foundations",
    },
    {
      id: "stacks-queues",
      label: "Stacks, Queues & Deques",
      description: "LIFO and FIFO linear abstract data types backed by array buffers with modulo indexing or singly/doubly linked nodes.",
      unit: "Unit 2: Linear ADTs",
    },
    {
      id: "bsts",
      label: "Binary Search Trees (BSTs)",
      description: "Hierarchical tree structure with BST invariant (left < root < right), pre/in/post/level-order traversals, and predecessor/successor removal.",
      unit: "Unit 3: Trees",
    },
    {
      id: "avl-trees",
      label: "AVL Trees & Self-Balancing",
      description: "Height-balanced BST maintaining balance factor in {-1, 0, 1}; executes single (LL, RR) and double (LR, RL) rotations in O(1).",
      unit: "Unit 3: Trees",
    },
    {
      id: "2-4-trees",
      label: "(2,4) Multi-Way Search Trees",
      description: "Self-balancing B-tree order 4 where nodes store 1-3 keys and 2-4 children; overflow splits and underflow transfer/fusion operations.",
      unit: "Unit 3: Trees",
    },
    {
      id: "heaps-priority-queues",
      label: "Heaps & Priority Queues",
      description: "Complete binary trees stored in 1-indexed or 0-indexed arrays satisfying the min/max heap property; O(n) bottom-up BuildHeap.",
      unit: "Unit 4: Priority Queues",
    },
    {
      id: "hashing",
      label: "Hash Maps & Collision Resolution",
      description: "Direct-addressing tables using hash functions; open addressing (linear probing, quadratic probing, double hashing) vs separate chaining.",
      unit: "Unit 5: Maps & Sets",
    },
    {
      id: "sorting-algorithms",
      label: "Sorting (Quick, Merge, Radix)",
      description: "Comparison-based sorts (MergeSort, in-place QuickSort w/ pivot strategies) and distribution-based non-comparison sorts (LSD/MSD Radix).",
      unit: "Unit 6: Sorting",
    },
    {
      id: "pattern-matching",
      label: "Pattern Matching (KMP, Boyer-Moore, Rabin-Karp)",
      description: "Sub-string matching algorithms: Knuth-Morris-Pratt failure tables, Boyer-Moore last-occurrence heuristics, and Rabin-Karp rolling hashes.",
      unit: "Unit 7: Pattern Matching",
    },
    {
      id: "graph-traversals",
      label: "Graph Representations & Traversals (BFS, DFS)",
      description: "Adjacency lists and matrices, queue-based Breadth-First Search, and recursive/stack-based Depth-First Search for cycle detection.",
      unit: "Unit 8: Graphs",
    },
    {
      id: "shortest-path-mst",
      label: "Shortest Path & MST (Dijkstra, Prim, Kruskal)",
      description: "Dijkstra's algorithm with priority queues, Prim's greedy MST algorithm, and Kruskal's algorithm with Disjoint Sets (Union-Find).",
      unit: "Unit 8: Graphs",
    },
    {
      id: "dynamic-programming",
      label: "Dynamic Programming & Memoization",
      description: "Breaking problems into overlapping subproblems with optimal substructure; top-down memoization and bottom-up tabulation.",
      unit: "Unit 9: Advanced Topics",
    },
  ],
  edges: [
    { from: "big-o", to: "arrays-arraylists", relation: "prereq" },
    { from: "arrays-arraylists", to: "stacks-queues", relation: "prereq" },
    { from: "linked-lists", to: "stacks-queues", relation: "prereq" },
    { from: "linked-lists", to: "bsts", relation: "prereq" },
    { from: "bsts", to: "avl-trees", relation: "prereq" },
    { from: "avl-trees", to: "2-4-trees", relation: "prereq" },
    { from: "arrays-arraylists", to: "heaps-priority-queues", relation: "prereq" },
    { from: "arrays-arraylists", to: "hashing", relation: "prereq" },
    { from: "big-o", to: "sorting-algorithms", relation: "prereq" },
    { from: "arrays-arraylists", to: "pattern-matching", relation: "prereq" },
    { from: "stacks-queues", to: "graph-traversals", relation: "prereq" },
    { from: "graph-traversals", to: "shortest-path-mst", relation: "prereq" },
    { from: "heaps-priority-queues", to: "shortest-path-mst", relation: "prereq" },
    { from: "sorting-algorithms", to: "shortest-path-mst", relation: "related" },
    { from: "graph-traversals", to: "dynamic-programming", relation: "related" },
  ],
  examTopics: [
    { conceptId: "avl-trees", frequency: 0.98, evidenceSourceIds: ["s4", "s8", "s10"] },
    { conceptId: "bsts", frequency: 0.92, evidenceSourceIds: ["s3", "s4", "s6"] },
    { conceptId: "sorting-algorithms", frequency: 0.9, evidenceSourceIds: ["s5", "s12"] },
    { conceptId: "shortest-path-mst", frequency: 0.88, evidenceSourceIds: ["s5", "s7", "s11"] },
    { conceptId: "hashing", frequency: 0.85, evidenceSourceIds: ["s4", "s12"] },
    { conceptId: "pattern-matching", frequency: 0.82, evidenceSourceIds: ["s5", "s12"] },
    { conceptId: "big-o", frequency: 0.8, evidenceSourceIds: ["s1", "s3", "s12"] },
    { conceptId: "heaps-priority-queues", frequency: 0.78, evidenceSourceIds: ["s4", "s6"] },
    { conceptId: "graph-traversals", frequency: 0.75, evidenceSourceIds: ["s5", "s7"] },
    { conceptId: "linked-lists", frequency: 0.72, evidenceSourceIds: ["s3", "s9"] },
    { conceptId: "2-4-trees", frequency: 0.65, evidenceSourceIds: ["s4", "s13"] },
    { conceptId: "stacks-queues", frequency: 0.6, evidenceSourceIds: ["s3"] },
    { conceptId: "arrays-arraylists", frequency: 0.55, evidenceSourceIds: ["s3"] },
    { conceptId: "dynamic-programming", frequency: 0.45, evidenceSourceIds: ["s7"] },
  ],
  difficulty: [
    {
      conceptId: "avl-trees",
      score: 0.92,
      quotes: [
        { text: "Drawing double rotations on paper under time pressure is where 80% of points evaporate.", sourceId: "s8", sentiment: "negative" },
        { text: "I walked into Exam 2 confident and got crushed by RL balance factor updates.", sourceId: "s10", sentiment: "negative" },
      ],
    },
    {
      conceptId: "2-4-trees",
      score: 0.86,
      quotes: [
        { text: "Underflow transfers and fusions have so many edge cases it's easy to second-guess yourself.", sourceId: "s8", sentiment: "negative" },
      ],
    },
    {
      conceptId: "pattern-matching",
      score: 0.82,
      quotes: [
        { text: "Building the KMP failure table by hand requires extreme precision with indices.", sourceId: "s5", sentiment: "neutral" },
      ],
    },
    {
      conceptId: "shortest-path-mst",
      score: 0.79,
      quotes: [
        { text: "Dijkstra vs Prim on a dense graph with cycles tripped up half our recitation.", sourceId: "s11", sentiment: "negative" },
      ],
    },
    {
      conceptId: "dynamic-programming",
      score: 0.76,
      quotes: [
        { text: "DP formulation is either instant or impossible; practicing standard patterns is non-negotiable.", sourceId: "s7", sentiment: "neutral" },
      ],
    },
    {
      conceptId: "hashing",
      score: 0.68,
      quotes: [
        { text: "Quadratic probing index wraparound is tested on every single midterm.", sourceId: "s4", sentiment: "neutral" },
      ],
    },
    {
      conceptId: "bsts",
      score: 0.65,
      quotes: [
        { text: "Two-child removal with successor replacement is guaranteed to be on Exam 1.", sourceId: "s3", sentiment: "positive" },
      ],
    },
    {
      conceptId: "sorting-algorithms",
      score: 0.62,
      quotes: [
        { text: "Know stability and adaptive behavior cold. Radix sort LSD vs MSD always appears.", sourceId: "s12", sentiment: "positive" },
      ],
    },
    {
      conceptId: "heaps-priority-queues",
      score: 0.58,
      quotes: [
        { text: "BuildHeap is O(n) math proof comes up on free response often.", sourceId: "s6", sentiment: "positive" },
      ],
    },
    {
      conceptId: "graph-traversals",
      score: 0.55,
      quotes: [
        { text: "BFS level-by-level queue tracing is free points if you keep track of visited sets.", sourceId: "s7", sentiment: "positive" },
      ],
    },
    {
      conceptId: "linked-lists",
      score: 0.48,
      quotes: [
        { text: "Sentinel nodes make linked list code 10x cleaner. Watch out for head/tail edge cases.", sourceId: "s9", sentiment: "positive" },
      ],
    },
    {
      conceptId: "big-o",
      score: 0.45,
      quotes: [
        { text: "Once you understand limits and summation series, Big-O is straightforward.", sourceId: "s12", sentiment: "positive" },
      ],
    },
    {
      conceptId: "stacks-queues",
      score: 0.35,
      quotes: [
        { text: "Circular array queue modulo arithmetic (front + size) % capacity is the main trick.", sourceId: "s3", sentiment: "positive" },
      ],
    },
    {
      conceptId: "arrays-arraylists",
      score: 0.28,
      quotes: [
        { text: "ArrayList homework 1 is the gentlest assignment of the semester.", sourceId: "s9", sentiment: "positive" },
      ],
    },
  ],
  studentQuotes: [
    { text: "Draw every AVL rotation on paper until it's muscle memory. Exam 2 does not give you time to think.", sourceId: "s8", sentiment: "neutral" },
    { text: "The autograder test cases provided in homework will NOT catch edge cases. Write custom JUnit tests for nulls and empty structures.", sourceId: "s9", sentiment: "negative" },
    { text: "Past exams from the library archives are the single most accurate predictor of your grade.", sourceId: "s3", sentiment: "positive" },
    { text: "Dijkstra is single-source shortest path, Prim is minimum spanning tree. Know the difference before Exam 3.", sourceId: "s11", sentiment: "neutral" },
    { text: "Dr. Brito's recitation walk-throughs on KMP and Boyer-Moore saved my final exam score.", sourceId: "s1", sentiment: "positive" },
    { text: "Exam 2 is the cliff. If you score above an 80 on Exam 2, you are safely on track for an A in the course.", sourceId: "s8", sentiment: "positive" },
  ],
  sources: cs1332Sources,
  professors: [
    {
      name: "Dr. Rodrigo Brito",
      email: "rbrito@cc.gatech.edu",
      pageUrl: "https://www.cc.gatech.edu/people/rodrigo-brito",
    },
    {
      name: "Dr. Monica Sweat",
      email: "sweat@cc.gatech.edu",
      pageUrl: "https://www.cc.gatech.edu/people/monica-sweat",
    },
  ],
  tips: [
    "Draw every AVL rotation (LL, RR, LR, RL) by hand on paper until you can execute balance factor updates automatically.",
    "Do not trust the starter homework JUnit suite alone—write edge-case tests for null items, single-element structures, and empty collections.",
    "Take past exams under strictly timed 50-minute conditions. Exam 2 has historically had the lowest median score.",
    "Master the runtime chart: know the best, average, and worst case Big-O complexities for every data structure operation cold.",
    "For graph algorithms, always draw the priority queue state table alongside the adjacency list to prevent off-by-one vertex updates.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
