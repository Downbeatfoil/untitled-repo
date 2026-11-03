/**
 * Lane: data
 * Mock responses for Schedule Roast and Course Cage Match (lab lane).
 */
import type { CoursePack } from "@/shared/contract";

export interface RoastResult {
  survivalOdds: number;
  verdict: string;
  perCourse: { code: string; line: string }[];
  mocked: boolean;
}

export interface VersusRound {
  title: string;
  winner: string;
  commentary: string;
}

export interface VersusResult {
  rounds: VersusRound[];
  champion: string;
  mocked: boolean;
}

const ROAST_LINES: Record<string, string[]> = {
  "CS 1332": [
    "You thought you were a programmer until Exam 2 asked you to draw an RL rotation by hand in 90 seconds.",
    "Weekly Java homework where the provided test suite gives you false confidence before the autograder executes you.",
    "Hope you enjoy drawing trees on scrap paper while questioning your life choices.",
  ],
  "CS 2110": [
    "Nothing says 'college experience' like tracing an LC-3 stack frame pointer at 3 AM because your R6 was off by one.",
    "Malloc homework is designed to teach you humility via segmentation fault (core dumped).",
    "Where binary arithmetic meets genuine human despair.",
  ],
  "MATH 1554": [
    "18 equivalent statements of the Invertible Matrix Theorem, and you will pick the one false statement on the midterm.",
    "Row reduction is easy until you realize Question 4 is a 6-part conceptual True/False essay.",
    "Where you learn that span and linear independence are just creative ways to make you doubt high school math.",
  ],
  "CS 1331": [
    "Losing 15% of your grade because checkstyle noticed an extra space after an opening brace.",
    "JavaFX: because who doesn't want to write 400 lines of XML-adjacent code to make a button click?",
  ],
  "CS 3510": [
    "Your algorithm is O(n^2), the professor's solution is O(n log log n), and your proof has 'it is obvious that' written twice.",
    "NP-complete reductions: where you prove 3-SAT reduces to your impending GPA collapse.",
  ],
  "PHYS 2211": [
    "Rolling without slipping: the question where friction exists only to confuse your coordinate axes.",
    "WebAssign tolerances so narrow that gravity depends on which floor of the CULC you calculated it on.",
  ],
  "CS 2200": [
    "Virtual memory page tables inside a pipelined datapath: prepare to dream in multi-level TLB misses.",
    "C code operating on simulated hardware interrupts—welcome to true systems suffering.",
  ],
  "CS 2340": [
    "A team project where Git merge conflicts are the real final boss and one teammate vanishes after sprint 2.",
    "Agile standups with four college sophomores pretending to know what an architectural diagram is.",
  ],
  "CS 4641": [
    "Importing scikit-learn is 5 lines; deriving backpropagation gradients by hand on the exam is why tears exist.",
    "Where overfitting your test set is a metaphor for your study schedule.",
  ],
  "MATH 2551": [
    "Parametric surfaces where Green's theorem and Stokes' theorem compete to see which right-hand rule breaks your wrist first.",
    "3D calculus: because struggling in two dimensions was simply not enough.",
  ],
  "ECE 2020": [
    "Karnaugh maps where one misplaced circle in a 4-variable grid invalidates your entire multiplexer.",
    "Flip-flops and clock skews: the bridge where computer science turns into electrical reality.",
  ],
  "CHEM 1310": [
    "ICE tables and equilibrium constants for engineers who just wanted to code in Python.",
    "Thermodynamics enthalpy calculations that ensure nobody leaves freshman year unhumbled.",
  ],
};

export function mockRoast(packs: CoursePack[]): RoastResult {
  const count = packs.length;
  const avgFear = count > 0 ? packs.reduce((acc, p) => acc + p.fearScore, 0) / count : 50;

  let survivalOdds = Math.max(8, Math.min(94, Math.round(100 - avgFear * 0.9 - (count > 4 ? 20 : 0))));
  let verdict = "A balanced semester. You might even maintain a social life.";

  if (avgFear > 75 || count >= 5) {
    verdict = "Academic hostage situation. Your caffeine budget will exceed your tuition this semester.";
    survivalOdds = Math.min(22, survivalOdds);
  } else if (avgFear > 65) {
    verdict = "Severe emotional turbulence ahead. Say goodbye to weekends between weeks 6 and 12.";
  } else if (avgFear < 55) {
    verdict = "Suspiciously manageable. Are you sure you are enrolled at Georgia Tech?";
  }

  const perCourse = packs.map((p) => {
    const lines = ROAST_LINES[p.course.code] ?? [
      `${p.course.code}: A high-stakes trial of mental fortitude and endless problem sets.`,
      `Expect the midterms in ${p.course.code} to test the exact edge case mentioned once in week 3.`,
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)] ?? lines[0];
    return { code: p.course.code, line: picked };
  });

  return {
    survivalOdds,
    verdict,
    perCourse,
    mocked: true,
  };
}

export function mockVersus(a: CoursePack, b: CoursePack): VersusResult {
  const fearDiff = a.fearScore - b.fearScore;
  const champion = fearDiff >= 0 ? a.course.code : b.course.code;

  const rounds: VersusRound[] = [
    {
      title: "Round 1: Exam Trauma",
      winner: a.fearScore >= b.fearScore ? a.course.code : b.course.code,
      commentary: `${a.fearScore >= b.fearScore ? a.course.code : b.course.code} takes Round 1 with an oppressive ${Math.max(a.fearScore, b.fearScore)}/100 fear index on midterms!`,
    },
    {
      title: "Round 2: Homework Grind",
      winner: (a.concepts.length >= b.concepts.length) ? a.course.code : b.course.code,
      commentary: `${(a.concepts.length >= b.concepts.length) ? a.course.code : b.course.code} edges ahead with ${Math.max(a.concepts.length, b.concepts.length)} distinct concept modules to master.`,
    },
    {
      title: "Round 3: Final Decider",
      winner: champion,
      commentary: `${champion} delivers the knockout blow! Student consensus crowns it as the supreme GPA predator between these two contenders.`,
    },
  ];

  return {
    rounds,
    champion,
    mocked: true,
  };
}
