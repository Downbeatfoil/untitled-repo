/**
 * Typed client for every API route in shared/contract.ts. Owner: orchestrator.
 * Frontend lanes call these, never raw fetch.
 */
import type {
  AiRequest, AiResponse, ApiError, BoardStats, ChatRequest, ChatResponse, CoursePack, CourseSummary,
  ExamRequest, GradeRequest, GradeResponse, OutreachDraft, OutreachRequest, PlanRequest, PracticeExam,
  ScoutEvent, ScoutRequest, StudyPlan,
} from "@/shared/contract";
import { courseSlug } from "@/shared/contract";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as T | ApiError;
  if (!res.ok || (data && typeof data === "object" && "error" in data)) {
    throw new Error((data as ApiError).error || `HTTP ${res.status}`);
  }
  return data as T;
}
const post = <T>(path: string, body: unknown) => call<T>(path, { method: "POST", body: JSON.stringify(body) });

export const getCourses = () => call<CourseSummary[]>("/api/courses");
export const getPack = (code: string) => call<CoursePack>(`/api/packs/${courseSlug(code)}`);
export const postExam = (req: ExamRequest) => post<PracticeExam>("/api/exam", req);
export const postGrade = (req: GradeRequest) => post<GradeResponse>("/api/exam/grade", req);
export const postPlan = (req: PlanRequest) => post<StudyPlan>("/api/plan", req);
export const postOutreach = (req: OutreachRequest) => post<OutreachDraft>("/api/outreach", req);
export const postChat = (req: ChatRequest) => post<ChatResponse>("/api/chat", req);
export const getBoardStats = () => call<BoardStats>("/api/board-stats");
export const postAi = (req: AiRequest) => post<AiResponse>("/api/ai", req);

export const exportUrl = (code: string, format: "smartpath" | "ics", extra = "") =>
  `/api/export/${courseSlug(code)}?format=${format}${extra}`;

/**
 * Start a scout run. Calls onEvent for every ScoutEvent until "done"/"error".
 * Returns an abort function.
 */
export function startScout(req: ScoutRequest, onEvent: (e: ScoutEvent) => void): () => void {
  const ctrl = new AbortController();
  (async () => {
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Scout failed: HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const chunk = buf.slice(0, i).trim();
          buf = buf.slice(i + 2);
          if (chunk.startsWith("data:")) onEvent(JSON.parse(chunk.slice(5).trim()) as ScoutEvent);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") onEvent({ type: "error", message: (err as Error).message });
    }
  })();
  return () => ctrl.abort();
}
