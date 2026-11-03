/**
 * Lane: data
 * Mock generators for all contract types so routes and UI never fail.
 */
import type {
  AiResponse,
  ChatResponse,
  CoursePack,
  GradeResponse,
  OutreachDraft,
  PracticeExam,
  Professor,
  Question,
  StudyPlan,
} from "@/shared/contract";

export function mockAiResponse(prompt: string): AiResponse {
  return {
    text: `(mock) You asked: "${prompt.slice(0, 80)}". Set XAI_API_KEY in .env.local for real Grok answers.`,
    mocked: true,
  };
}

/** Pre-crafted high-quality questions for seeded courses, falling back to dynamic generation. */
const CURATED_QUESTIONS: Record<string, Question[]> = {
  "CS 1332": [
    {
      id: "q-1332-1",
      conceptId: "avl-trees",
      type: "mcq",
      prompt: "After inserting keys [10, 20, 15] into an initially empty AVL Tree, which rotation is executed?",
      choices: ["Single Left Rotation (RR)", "Single Right Rotation (LL)", "Left-Right Rotation (LR)", "Right-Left Rotation (RL)"],
      answer: "Right-Left Rotation (RL)",
      explanation: "Inserting 10, then 20 creates a right-heavy node. Inserting 15 creates a zigzag (right then left) child, violating the balance factor (-2) and requiring a double RL rotation.",
      difficulty: "medium",
      styleSourceId: "s4",
    },
    {
      id: "q-1332-2",
      conceptId: "bsts",
      type: "mcq",
      prompt: "When removing a node with two children from a BST, which node can validly replace it while preserving the BST invariant?",
      choices: [
        "The minimum node of the left subtree",
        "The successor (minimum of right subtree) or predecessor (maximum of left subtree)",
        "The parent node",
        "The root of the tree",
      ],
      answer: "The successor (minimum of right subtree) or predecessor (maximum of left subtree)",
      explanation: "Replacing the removed node with its in-order successor or predecessor ensures all left-subtree keys remain strictly smaller and all right-subtree keys remain strictly greater.",
      difficulty: "easy",
      styleSourceId: "s3",
    },
    {
      id: "q-1332-3",
      conceptId: "heaps-priority-queues",
      type: "mcq",
      prompt: "What is the tightest worst-case time complexity of the bottom-up BuildHeap algorithm on an array of n arbitrary elements?",
      choices: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
      answer: "O(n)",
      explanation: "Bottom-up BuildHeap calls down-heap starting from index n/2 down to 0. The summation of node count at height h times height h converges to 2n, yielding linear O(n) runtime.",
      difficulty: "medium",
      styleSourceId: "s6",
    },
    {
      id: "q-1332-4",
      conceptId: "pattern-matching",
      type: "mcq",
      prompt: "In the KMP algorithm, what does the failure table (pi table) value at index i represent?",
      choices: [
        "The frequency of pattern[i] in the target text",
        "The length of the longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i]",
        "The index of the last mismatch",
        "The hash value of the pattern prefix",
      ],
      answer: "The length of the longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i]",
      explanation: "KMP uses the length of the longest proper prefix that matches a suffix to avoid re-comparing text characters on a mismatch.",
      difficulty: "hard",
      styleSourceId: "s5",
    },
    {
      id: "q-1332-5",
      conceptId: "shortest-path-mst",
      type: "short",
      prompt: "Explain why Dijkstra's algorithm fails to find shortest paths on graphs with negative-weight edges.",
      answer: "Dijkstra's algorithm greedily assumes that once a vertex is marked visited (popped from the priority queue), its shortest distance is finalized. A negative edge explored later could offer a shorter path, violating this greedy invariant.",
      explanation: "Because Dijkstra assumes non-decreasing path costs, visiting a node finalizes its optimal distance. Negative weights can decrease distance retrospectively.",
      difficulty: "hard",
      styleSourceId: "s7",
    },
    {
      id: "q-1332-6",
      conceptId: "hashing",
      type: "mcq",
      prompt: "In a hash table with capacity 11 using quadratic probing with index formula (hash + i^2) % 11, what is the probe index for i = 3 if hash = 5?",
      choices: ["1", "3", "5", "8"],
      answer: "3",
      explanation: "(5 + 3^2) % 11 = (5 + 9) % 11 = 14 % 11 = 3.",
      difficulty: "medium",
      styleSourceId: "s4",
    },
  ],
};

/** Generate a mock PracticeExam for a given CoursePack. */
export function mockExam(pack: CoursePack, count = 6, conceptIds?: string[]): PracticeExam {
  const curated = CURATED_QUESTIONS[pack.course.code];
  let questions: Question[] = [];

  if (curated) {
    questions = conceptIds && conceptIds.length > 0
      ? curated.filter((q) => conceptIds.includes(q.conceptId))
      : [...curated];
  }

  // If we need more questions or the course isn't in CURATED_QUESTIONS, synthesize from concepts
  const targetConcepts = conceptIds && conceptIds.length > 0
    ? pack.concepts.filter((c) => conceptIds.includes(c.id))
    : pack.concepts;

  let idx = questions.length + 1;
  for (const c of targetConcepts) {
    if (questions.length >= count) break;
    if (questions.some((q) => q.conceptId === c.id)) continue;

    questions.push({
      id: `q-${pack.course.code.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
      conceptId: c.id,
      type: idx % 2 === 0 ? "short" : "mcq",
      prompt: idx % 2 === 0
        ? `Explain the core invariant and algorithmic trade-offs of ${c.label}.`
        : `Which of the following best characterizes the primary operation runtime of ${c.label}?`,
      choices: idx % 2 !== 0
        ? ["O(1) amortized", "O(log n) worst case", "O(n) worst case", "O(n log n) average"]
        : undefined,
      answer: idx % 2 !== 0 ? "O(log n) worst case" : `${c.label} balances time complexity against space overhead.`,
      explanation: `${c.label} is a central topic in ${pack.course.title}. ${c.description}`,
      difficulty: idx > 3 ? "hard" : "medium",
      styleSourceId: pack.sources[0]?.id ?? "s1",
    });
    idx++;
  }

  return {
    id: `exam-${pack.course.code.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    courseCode: pack.course.code,
    title: `${pack.course.code} Practice Midterm Exam`,
    questions: questions.slice(0, count),
    mocked: true,
  };
}

/** Mock grading for a student answer. */
export function mockGrade(q: Question, userAnswer: string): GradeResponse {
  const cleanUser = userAnswer.trim().toLowerCase();
  const cleanTarget = q.answer.trim().toLowerCase();

  if (q.type === "mcq") {
    const isCorrect = cleanUser === cleanTarget || cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser);
    return {
      correct: isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? `Correct! ${q.explanation}`
        : `Incorrect. The correct choice is "${q.answer}". ${q.explanation}`,
      mocked: true,
    };
  }

  // Short answer grading
  const keywords = cleanTarget.split(/\s+/).filter((w) => w.length > 4);
  const matchCount = keywords.filter((kw) => cleanUser.includes(kw)).length;
  const ratio = keywords.length > 0 ? matchCount / keywords.length : 0.8;
  const score = cleanUser.length < 10 ? 0.2 : Math.min(1.0, Math.max(0.4, Number(ratio.toFixed(2))));

  return {
    correct: score >= 0.7,
    score,
    feedback: score >= 0.7
      ? `Strong answer! Your explanation accurately captures the key insight: ${q.explanation}`
      : `Partial credit. A complete explanation should emphasize: ${q.answer}`,
    mocked: true,
  };
}

/** Generate a realistic day-by-day study plan leading up to examDate. */
export function mockPlan(pack: CoursePack, examDate: string, hoursPerDay: number): StudyPlan {
  const targetDate = new Date(examDate);
  const now = new Date();
  const diffDays = Math.max(2, Math.min(14, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))));

  // Sort concepts by examTopics frequency
  const sortedConcepts = [...pack.concepts].sort((a, b) => {
    const freqA = pack.examTopics.find((t) => t.conceptId === a.id)?.frequency ?? 0.5;
    const freqB = pack.examTopics.find((t) => t.conceptId === b.id)?.frequency ?? 0.5;
    return freqB - freqA;
  });

  const minutesPerDay = Math.round(hoursPerDay * 60);
  const days = [];

  for (let i = 0; i < diffDays; i++) {
    const dayDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toISOString().slice(0, 10);
    const isLastDay = i === diffDays - 1;

    if (isLastDay) {
      days.push({
        date: dateStr,
        conceptIds: sortedConcepts.slice(0, 3).map((c) => c.id),
        tasks: [
          `Full timed practice exam (50 min) for ${pack.course.code}`,
          "Review missed questions and write down rotation/pointer steps",
          "Final cheat sheet scan of Big-O runtimes and edge cases",
        ],
        minutes: minutesPerDay,
      });
    } else {
      const startIdx = (i * 2) % sortedConcepts.length;
      const dayConcepts = sortedConcepts.slice(startIdx, startIdx + 2);
      days.push({
        date: dateStr,
        conceptIds: dayConcepts.map((c) => c.id),
        tasks: [
          `Review lecture slides & visualizer for ${dayConcepts.map((c) => c.label).join(" & ")}`,
          `Complete 4-5 practice problems on ${dayConcepts[0]?.label ?? "foundations"}`,
          `Draw out diagrams and write edge case test cases`,
        ],
        minutes: minutesPerDay,
      });
    }
  }

  return {
    courseCode: pack.course.code,
    days,
    mocked: true,
  };
}

/** Generate a polite outreach email draft to a professor. */
export function mockOutreach(
  pack: CoursePack,
  professor?: Professor | string,
  studentName = "Georgia Tech Student",
  tone: "formal" | "friendly" = "friendly"
): OutreachDraft {
  const profName = typeof professor === "string" ? professor : professor?.name ?? pack.professors[0]?.name ?? "Professor";
  const profEmail = typeof professor === "object" && professor?.email ? professor.email : pack.professors[0]?.email ?? "";

  const subject = tone === "formal"
    ? `Inquiry: Supplemental Practice Material for ${pack.course.code}`
    : `Quick question about ${pack.course.code} study resources`;

  const body = tone === "formal"
    ? `Dear ${profName},

I hope this email finds you well.

My name is ${studentName}, and I am currently studying ${pack.course.code} (${pack.course.title}) at Georgia Tech. In collaboration with SmartPath Scout—a student academic tool built at Tech—we are creating interactive concept graphs and study guides aligned with public syllabi.

We would be deeply grateful if you could share or recommend any publicly releasable practice exams, recitation worksheets, or study materials that could be indexed to support GT students in mastering ${pack.concepts[0]?.label ?? "core coursework"}.

Thank you very much for your leadership and guidance.

Respectfully,
${studentName}
Georgia Tech College of Computing`
    : `Hi ${profName},

Hope your semester is going great!

I'm ${studentName}, currently taking ${pack.course.code} (${pack.course.title}). Our student group is working on SmartPath Scout, turning public course topics and past exams into interactive concept maps and practice quizzes for GT students.

Do you have any past exam recommendations or public practice sets you'd suggest we index to help students prep for midterms?

Thanks so much for your time!

Best,
${studentName}
Georgia Tech Student`;

  const mailto = `mailto:${encodeURIComponent(profEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    to: profEmail,
    subject,
    body,
    mailto,
    mocked: true,
  };
}

/** Mock a contextual course chat answer grounded in the CoursePack. */
export function mockChat(pack: CoursePack, question: string): ChatResponse {
  const q = question.toLowerCase();

  // Find relevant concept
  const matched = pack.concepts.find((c) =>
    q.includes(c.id) || q.includes(c.label.toLowerCase())
  ) ?? pack.concepts[0];

  const citations = pack.sources.slice(0, 2).map((s) => s.id);

  let reply = `In **${pack.course.code}**, ${matched.label} is covered under *${matched.unit ?? "Core Topics"}*. `;
  if (q.includes("exam") || q.includes("test")) {
    const examTopic = pack.examTopics.find((t) => t.conceptId === matched.id);
    reply += `Exam frequency for this topic is **${Math.round((examTopic?.frequency ?? 0.8) * 100)}%**. `;
    reply += `Students emphasize practicing step-by-step hand traces: *"Drawing operations on paper is essential."*`;
  } else if (q.includes("hard") || q.includes("difficult")) {
    const diff = pack.difficulty.find((d) => d.conceptId === matched.id);
    reply += `Difficulty score is rated at **${Math.round((diff?.score ?? 0.7) * 100)}/100**. Common pitfalls involve boundary conditions and pointer maintenance.`;
  } else {
    reply += `${matched.description} For optimal prep, consult the official course materials and drill past exam questions.`;
  }

  return {
    reply,
    citedSourceIds: citations,
    mocked: true,
  };
}
