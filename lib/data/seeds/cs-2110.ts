/**
 * Lane: data
 * Seed pack for CS 2110: Computer Organization & Programming at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const cs2110Sources: Source[] = [
  {
    id: "s2110-1",
    url: "https://cs2110.gatech.edu/syllabus",
    title: "CS 2110 Syllabus: Digital Logic to C Systems Programming",
    kind: "syllabus",
    snippet: "Overview of LC-3 architecture, assembly programming, C memory management, and timed lab practicals.",
    foundBy: "syllabus-scout",
  },
  {
    id: "s2110-2",
    url: "https://cs2110.gatech.edu/schedule",
    title: "CS 2110 Course Calendar & Timed Lab Dates",
    kind: "course-page",
    snippet: "Weekly schedule highlighting Timed Lab 3 (recursion in LC-3) and Homework 9 (malloc implementation in C).",
    foundBy: "syllabus-scout",
  },
  {
    id: "s2110-3",
    url: "https://github.com/gt-archives/cs2110-exam2-assembly",
    title: "CS 2110 Past Exam 2: LC-3 Assembly, Calling Conventions & Stack Frames",
    kind: "exam",
    snippet: "Hand-tracing LC-3 subroutines, stack frame setup/teardown, return values in R0, and local variable offsets.",
    foundBy: "exam-hunter",
  },
  {
    id: "s2110-4",
    url: "https://github.com/gt-archives/cs2110-exam3-c-pointers",
    title: "CS 2110 Past Exam 3: Pointers, Structs, Dynamic Memory & DMA",
    kind: "exam",
    snippet: "Pointer arithmetic in C, multidimensional arrays, struct padding/alignment, and linked list traversal in assembly.",
    foundBy: "exam-hunter",
  },
  {
    id: "s2110-5",
    url: "https://reddit.com/r/gatech/comments/cs2110_timed_lab_survival",
    title: "r/gatech: 'CS 2110 Timed Labs are 90 minutes of pure adrenaline'",
    kind: "reddit",
    snippet: "Advice on practicing LC-3 assembly on Complx with visual stack inspections before the timed labs.",
    foundBy: "student-pulse",
  },
  {
    id: "s2110-6",
    url: "https://x.com/gt_cs_memes/status/1725000000000000000",
    title: "X Student Post: Segfaults in CS 2110",
    kind: "x",
    snippet: "'Segfault (core dumped) in HW8 after 6 hours of staring at pointer asterisks.'",
    foundBy: "student-pulse",
  },
  {
    id: "s2110-7",
    url: "https://cs2110.gatech.edu/practice-problems/lc3-stack",
    title: "LC-3 Stack Frame Practice Worksheet",
    kind: "practice",
    snippet: "Tracing R5 (frame pointer) and R6 (stack pointer) during nested recursive function execution.",
    foundBy: "exam-hunter",
  },
  {
    id: "s2110-8",
    url: "https://notes.gt-cs.net/cs2110/summary-notes",
    title: "GT CS 2110 Student Summary Notes: Assembly to C",
    kind: "notes",
    snippet: "Quick reference for LC-3 opcode encodings, condition codes (N, Z, P), and C bitwise operations.",
    foundBy: "concept-mapper",
  },
];

export const cs2110Pack: CoursePack = {
  course: {
    code: "CS 2110",
    title: "Computer Organization & Programming",
    school: "Georgia Tech",
  },
  summary:
    "A foundational hardware-software interface journey from Boolean logic gates and finite state machines up through LC-3 assembly language, subroutines, stack conventions, and systems programming in C.",
  fearScore: 84,
  concepts: [
    { id: "binary-logic", label: "Binary Arithmetic & Digital Logic", description: "Two's complement representations, IEEE 754 floating point, gates, decoders, multiplexers, and ALU design.", unit: "Unit 1: Digital Logic" },
    { id: "sequential-circuits", label: "Sequential Circuits & FSMs", description: "Latches, flip-flops, registers, clock cycles, and Finite State Machine transition diagrams.", unit: "Unit 1: Digital Logic" },
    { id: "lc3-isa", label: "LC-3 Instruction Set Architecture", description: "Registers R0-R7, memory addressing modes, opcode execution cycles (Fetch, Decode, Evaluate, Fetch Operands, Execute, Store).", unit: "Unit 2: Assembly" },
    { id: "assembly-stack", label: "Subroutines & The LC-3 Stack", description: "Calling conventions, activation records, Frame Pointer (R5), Stack Pointer (R6), caller-saved vs callee-saved registers.", unit: "Unit 2: Assembly" },
    { id: "traps-interrupts", label: "Traps, Interrupts & I/O", description: "Keyboard/display status and data registers, memory-mapped I/O, interrupt service routines, and priority levels.", unit: "Unit 2: Assembly" },
    { id: "c-pointers", label: "Pointers & Arrays in C", description: "Direct memory access, address-of and dereference operators, pointer arithmetic, void pointers, and arrays as pointers.", unit: "Unit 3: C Programming" },
    { id: "c-memory-malloc", label: "Memory Layout & Dynamic Allocation (malloc/free)", description: "Text, data, BSS, heap, and stack segments; implementing explicit free lists, headers, footers, and coalesce.", unit: "Unit 3: C Programming" },
    { id: "c-structs-unions", label: "Structs, Unions & Memory Alignment", description: "Composite types, byte padding, alignment requirements, and linked data structures in C.", unit: "Unit 3: C Programming" },
    { id: "caches-memory-hierarchy", label: "Caches & Memory Hierarchy", description: "Direct-mapped, set-associative, and fully-associative caches; hit/miss calculations, write policies, and spatial/temporal locality.", unit: "Unit 4: Systems" },
  ],
  edges: [
    { from: "binary-logic", to: "sequential-circuits", relation: "prereq" },
    { from: "sequential-circuits", to: "lc3-isa", relation: "prereq" },
    { from: "lc3-isa", to: "assembly-stack", relation: "prereq" },
    { from: "lc3-isa", to: "traps-interrupts", relation: "prereq" },
    { from: "assembly-stack", to: "c-pointers", relation: "prereq" },
    { from: "c-pointers", to: "c-memory-malloc", relation: "prereq" },
    { from: "c-pointers", to: "c-structs-unions", relation: "prereq" },
    { from: "c-memory-malloc", to: "caches-memory-hierarchy", relation: "related" },
  ],
  examTopics: [
    { conceptId: "assembly-stack", frequency: 0.95, evidenceSourceIds: ["s2110-3", "s2110-7"] },
    { conceptId: "c-pointers", frequency: 0.92, evidenceSourceIds: ["s2110-4", "s2110-6"] },
    { conceptId: "lc3-isa", frequency: 0.88, evidenceSourceIds: ["s2110-3"] },
    { conceptId: "c-memory-malloc", frequency: 0.85, evidenceSourceIds: ["s2110-4"] },
    { conceptId: "caches-memory-hierarchy", frequency: 0.72, evidenceSourceIds: ["s2110-4"] },
    { conceptId: "binary-logic", frequency: 0.65, evidenceSourceIds: ["s2110-1"] },
  ],
  difficulty: [
    {
      conceptId: "assembly-stack",
      score: 0.88,
      quotes: [{ text: "Drawing out the stack frame with exact offsets for local vars and params saved me on Exam 2.", sourceId: "s2110-5", sentiment: "positive" }],
    },
    {
      conceptId: "c-pointers",
      score: 0.84,
      quotes: [{ text: "Double pointers (void**) in malloc homework made my brain melt.", sourceId: "s2110-6", sentiment: "negative" }],
    },
    {
      conceptId: "c-memory-malloc",
      score: 0.8,
      quotes: [{ text: "Implementing malloc and free with first-fit allocation is the ultimate rite of passage.", sourceId: "s2110-5", sentiment: "neutral" }],
    },
  ],
  studentQuotes: [
    { text: "Timed labs will expose any gap in your LC-3 understanding. Practice writing recursive subroutines with a timer.", sourceId: "s2110-5", sentiment: "negative" },
    { text: "Valgrind and gdb are your best friends in the second half of the course. Don't submit without checking memory leaks.", sourceId: "s2110-5", sentiment: "positive" },
    { text: "LC-3 assembly stack frames look intimidating at first, but it is purely mechanical once you memorize caller vs callee duties.", sourceId: "s2110-3", sentiment: "positive" },
  ],
  sources: cs2110Sources,
  professors: [
    { name: "Dr. Thomas Leahy", email: "tleahy@cc.gatech.edu" },
    { name: "Dr. Southern", email: "southern@cc.gatech.edu" },
  ],
  tips: [
    "Trace stack activation records on paper during every assembly practice problem.",
    "Use Complx simulator step-by-step to visualize register changes and condition code flags.",
    "Start Homework 9 (malloc) at least 5 days in advance—segfaults take hours to isolate.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
