/**
 * Lane: ai. Multi-agent Scout runner.
 * Orchestrates Exam Hunter, Syllabus Scout, and Student Pulse in parallel,
 * streaming live ScoutEvents over an async generator, followed by Concept Mapper.
 * If Grok is unconfigured or fails, gracefully streams replayScout from lib/data. Never throws.
 */
import type {
  AgentName,
  CourseCode,
  CoursePack,
  ScoutEvent,
} from "@/shared/contract";
import { normalizeCourseCode } from "@/shared/contract";
import { grokConfigured } from "./grok";
import { examHunter, syllabusScout, studentPulse, type AgentResult } from "./agents";
import { buildPack } from "./conceptMapper";
import { getSeedPack, makeGenericPack, replayScout } from "@/lib/data";

interface AsyncQueue<T> {
  push(item: T): void;
  next(): Promise<{ value: T; done: boolean }>;
  close(): void;
}

function createAsyncQueue<T>(): AsyncQueue<T> {
  const queue: T[] = [];
  let resolveNext: ((res: { value: T; done: boolean }) => void) | null = null;
  let isClosed = false;

  return {
    push(item: T) {
      if (resolveNext) {
        const resolve = resolveNext;
        resolveNext = null;
        resolve({ value: item, done: false });
      } else {
        queue.push(item);
      }
    },
    async next() {
      if (queue.length > 0) {
        return { value: queue.shift()!, done: false };
      }
      if (isClosed) {
        return { value: undefined as unknown as T, done: true };
      }
      return new Promise<{ value: T; done: boolean }>((resolve) => {
        resolveNext = resolve;
      });
    },
    close() {
      isClosed = true;
      if (resolveNext) {
        const resolve = resolveNext;
        resolveNext = null;
        resolve({ value: undefined as unknown as T, done: true });
      }
    },
  };
}

/**
 * Runs the live 4-agent Grok research swarm for a given course code.
 * Yields ScoutEvent items as agents discover sources and build the course pack.
 */
export async function* runScout(code: CourseCode): AsyncGenerator<ScoutEvent> {
  const normCode = normalizeCourseCode(code);

  // Demo safety: if Grok is not configured, replay seed/generic pack smoothly
  if (!grokConfigured()) {
    const pack = getSeedPack(normCode) ?? makeGenericPack(normCode);
    yield* replayScout(pack);
    return;
  }

  try {
    // 1. Initial swarm queue announcements
    yield { type: "agent", agent: "syllabus-scout", status: "queued", message: `Queued for ${normCode} syllabus & catalog` };
    yield { type: "agent", agent: "exam-hunter", status: "queued", message: `Queued for ${normCode} public past exam scan` };
    yield { type: "agent", agent: "student-pulse", status: "queued", message: `Queued for r/gatech & X student chatter` };
    yield { type: "agent", agent: "concept-mapper", status: "queued", message: "Awaiting research swarm findings" };

    // 2. Launch 3 research agents in parallel
    yield { type: "agent", agent: "syllabus-scout", status: "searching", message: `Searching official syllabi & catalog for ${normCode}...` };
    yield { type: "agent", agent: "exam-hunter", status: "searching", message: `Searching public archives for ${normCode} past exams...` };
    yield { type: "agent", agent: "student-pulse", status: "searching", message: `Searching r/gatech and X for sentiment on ${normCode}...` };

    const eventQueue = createAsyncQueue<ScoutEvent>();

    let resEh: AgentResult | undefined;
    let resSs: AgentResult | undefined;
    let resSp: AgentResult | undefined;

    const runAgent = async (
      agentName: AgentName,
      fn: () => Promise<AgentResult>,
      saveResult: (res: AgentResult) => void
    ) => {
      try {
        eventQueue.push({
          type: "log",
          agent: agentName,
          message: `Agent ${agentName} executing live query...`,
        });

        const res = await fn();
        saveResult(res);

        for (const source of res.sources) {
          eventQueue.push({
            type: "log",
            agent: agentName,
            message: `Discovered [${source.kind.toUpperCase()}]: ${source.title.slice(0, 50)}...`,
          });
          eventQueue.push({ type: "source", source });
        }

        eventQueue.push({
          type: "agent",
          agent: agentName,
          status: "done",
          message: `Discovered ${res.sources.length} sources and notes`,
        });
      } catch (err) {
        eventQueue.push({
          type: "agent",
          agent: agentName,
          status: "error",
          message: `Agent encountered error: ${(err as Error).message}`,
        });
      }
    };

    const allAgentsPromise = Promise.all([
      runAgent("exam-hunter", () => examHunter(normCode), (r) => (resEh = r)),
      runAgent("syllabus-scout", () => syllabusScout(normCode), (r) => (resSs = r)),
      runAgent("student-pulse", () => studentPulse(normCode), (r) => (resSp = r)),
    ]).finally(() => {
      eventQueue.close();
    });

    // Yield events as research agents discover sources in real-time
    for (;;) {
      const { value, done } = await eventQueue.next();
      if (done) break;
      yield value;
    }
    await allAgentsPromise;

    // 3. Concept Mapper synthesizes findings into CoursePack
    yield {
      type: "agent",
      agent: "concept-mapper",
      status: "thinking",
      message: "Synthesizing concept graph, exam weights, and student sentiment...",
    };
    yield {
      type: "log",
      agent: "concept-mapper",
      message: "Building prerequisite dependency DAG and exam frequency matrix...",
    };

    const pack: CoursePack = await buildPack(normCode, {
      examHunter: resEh,
      syllabusScout: resSs,
      studentPulse: resSp,
    });

    yield {
      type: "agent",
      agent: "concept-mapper",
      status: "done",
      message: `Assembled ${pack.concepts.length} concepts across ${pack.edges.length} edges`,
    };

    // 4. Deliver finalized CoursePack
    yield { type: "pack", pack };
    yield { type: "done" };
  } catch (err) {
    console.error(`[runScout] Unexpected live scout failure for ${normCode}:`, err);
    // Never crash: replay fallback seed or generic pack
    const fallback = getSeedPack(normCode) ?? makeGenericPack(normCode);
    yield* replayScout(fallback);
  }
}
