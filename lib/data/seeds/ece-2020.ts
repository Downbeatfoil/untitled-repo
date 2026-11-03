/**
 * Lane: data
 * Seed pack for ECE 2020: Digital System Design at Georgia Tech.
 */
import type { CoursePack, Source } from "@/shared/contract";

export const ece2020Sources: Source[] = [
  { id: "s2020-1", url: "https://ece.gatech.edu/courses/ece-2020", title: "ECE 2020 Syllabus: Digital System Design", kind: "syllabus", snippet: "Binary representation, Boolean algebra, combinational and sequential circuit design, modular digital components.", foundBy: "syllabus-scout" },
  { id: "s2020-2", url: "https://github.com/gt-archives/ece2020-sample-tests", title: "ECE 2020 Midterm 1 & 2 Practice Archive", kind: "exam", snippet: "Karnaugh map minimization, Don't Care conditions, multiplexer logic synthesis, and flip-flop timing diagrams.", foundBy: "exam-hunter" },
  { id: "s2020-3", url: "https://reddit.com/r/gatech/comments/ece2020_kmap_tips", title: "r/gatech: 'Don't drop easy points on ECE 2020 K-Maps'", kind: "reddit", snippet: "Advice on wrapping groups around corners and including don't-care conditions to maximize group sizes.", foundBy: "student-pulse" },
];

export const ece2020Pack: CoursePack = {
  course: { code: "ECE 2020", title: "Digital System Design", school: "Georgia Tech" },
  summary: "Comprehensive introduction to digital electronics and logic synthesis. Explores Boolean algebra, Karnaugh map minimization, combinational building blocks (decoders, multiplexers, adders), latches, flip-flops, and sequential state machine design.",
  fearScore: 62,
  concepts: [
    { id: "boolean-algebra-kmaps", label: "Boolean Algebra & Karnaugh Map Minimization", description: "De Morgan's laws, sum-of-products (SOP), product-of-sums (POS), 3 and 4-variable K-maps with don't care conditions.", unit: "Unit 1: Combinational Logic" },
    { id: "combinational-modules", label: "Combinational Building Blocks (MUX, Decoders, Encoders)", description: "Multiplexers as universal logic generators, priority encoders, decoders, and full adders/subtractors.", unit: "Unit 1: Combinational Logic" },
    { id: "arithmetic-circuits", label: "Binary Arithmetic & ALU Design", description: "Ripple carry adders, carry-lookahead adders, two's complement overflow detection, and bitwise logic units.", unit: "Unit 2: Arithmetic" },
    { id: "latches-flipflops", label: "Latches, Flip-Flops & Timing Parameters", description: "SR latches, D latches, positive/negative edge-triggered D flip-flops, setup time, hold time, and propagation delay.", unit: "Unit 3: Sequential Logic" },
    { id: "finite-state-machines", label: "Sequential Finite State Machines (FSMs)", description: "Mealy vs Moore state machines, state transition tables, state reduction, and next-state excitation equations.", unit: "Unit 3: Sequential Logic" },
    { id: "registers-counters", label: "Registers, Shift Registers & Synchronous Counters", description: "Parallel load registers, linear feedback shift registers (LFSR), and modulo-N synchronous up/down counters.", unit: "Unit 4: Systems" },
  ],
  edges: [
    { from: "boolean-algebra-kmaps", to: "combinational-modules", relation: "prereq" },
    { from: "combinational-modules", to: "arithmetic-circuits", relation: "prereq" },
    { from: "boolean-algebra-kmaps", to: "latches-flipflops", relation: "prereq" },
    { from: "latches-flipflops", to: "finite-state-machines", relation: "prereq" },
    { from: "finite-state-machines", to: "registers-counters", relation: "prereq" },
  ],
  examTopics: [
    { conceptId: "finite-state-machines", frequency: 0.95, evidenceSourceIds: ["s2020-2"] },
    { conceptId: "boolean-algebra-kmaps", frequency: 0.92, evidenceSourceIds: ["s2020-2", "s2020-3"] },
    { conceptId: "latches-flipflops", frequency: 0.88, evidenceSourceIds: ["s2020-2"] },
    { conceptId: "combinational-modules", frequency: 0.85, evidenceSourceIds: ["s2020-1"] },
  ],
  difficulty: [
    { conceptId: "finite-state-machines", score: 0.78, quotes: [{ text: "Drawing state transition tables for non-standard counters under time pressure is where mistakes happen.", sourceId: "s2020-2", sentiment: "neutral" }] },
  ],
  studentQuotes: [
    { text: "K-Maps and Boolean simplification are free points if you practice grouping rectangles of sizes 1, 2, 4, 8.", sourceId: "s2020-3", sentiment: "positive" },
    { text: "Understand setup and hold time violations. Timing diagram questions appear on every exam.", sourceId: "s2020-1", sentiment: "positive" },
  ],
  sources: ece2020Sources,
  professors: [{ name: "Dr. James Hamblen", email: "hamblen@ece.gatech.edu" }],
  tips: [
    "Always remember to group corners in 4-variable Karnaugh maps (cells 0, 2, 8, 10).",
    "In timing diagrams, check whether clock edges are rising or falling before updating flip-flop outputs.",
  ],
  generatedAt: new Date().toISOString(),
  mocked: true,
};
