/** Lane: export. CoursePack (+ optional exam) -> SmartPath knowledge-graph JSON. */
import type { CoursePack, PracticeExam, SmartPathExport } from "@/shared/contract";

export function toSmartPath(pack: CoursePack, exam?: PracticeExam): SmartPathExport {
  const freq = new Map(pack.examTopics.map((t) => [t.conceptId, t.frequency]));
  const quizzes: SmartPathExport["quizzes"] = exam
    ? exam.questions.map((q) => ({ conceptId: q.conceptId, question: q.prompt, choices: q.choices, answer: q.answer }))
    : pack.concepts.slice(0, 8).map((c) => ({
        conceptId: c.id,
        question: `Explain ${c.label} and when it shows up on ${pack.course.code} exams.`,
        answer: c.description,
      }));
  return {
    version: 1,
    course: `${pack.course.code}: ${pack.course.title}`,
    nodes: pack.concepts.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      weight: Math.round((freq.get(c.id) ?? 0) * 100) / 100,
    })),
    edges: pack.edges.map((e) => ({ source: e.from, target: e.to, type: e.relation })),
    quizzes,
  };
}
