/**
 * Lane: components. Demo-safety fallbacks: when an API call fails, widgets fall back client-side to the
 * lib/data mocks (all `mocked: true`). lib/data is imported lazily so it never bloats the happy path.
 */
import type {
  ChatResponse, CoursePack, GradeResponse, OutreachDraft, PracticeExam, Professor, Question, StudyPlan,
} from "@/shared/contract";

async function data() {
  return import("@/lib/data");
}

export async function fallbackPack(courseCode: string): Promise<CoursePack> {
  const d = await data();
  return d.getSeedPack(courseCode) ?? d.makeGenericPack(courseCode);
}

export async function fallbackExam(courseCode: string, count?: number, conceptIds?: string[]): Promise<PracticeExam> {
  const d = await data();
  return d.mockExam(await fallbackPack(courseCode), count, conceptIds);
}

export async function fallbackGrade(q: Question, userAnswer: string): Promise<GradeResponse> {
  const d = await data();
  return { ...d.mockGrade(q, userAnswer), mocked: true };
}

export async function fallbackPlan(courseCode: string, examDate: string, hoursPerDay: number): Promise<StudyPlan> {
  const d = await data();
  return d.mockPlan(await fallbackPack(courseCode), examDate, hoursPerDay);
}

export async function fallbackOutreach(courseCode: string, prof: Professor | string, studentName?: string): Promise<OutreachDraft> {
  const d = await data();
  return d.mockOutreach(await fallbackPack(courseCode), prof, studentName || undefined);
}

export async function fallbackChat(courseCode: string, question: string): Promise<ChatResponse> {
  const d = await data();
  return d.mockChat(await fallbackPack(courseCode), question);
}
