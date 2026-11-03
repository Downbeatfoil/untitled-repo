/**
 * Lane: data
 * Believable scout replay generator for demo safety when no XAI_API_KEY is configured.
 */
import type { CoursePack, ScoutEvent } from "@/shared/contract";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Async generator yielding a realistic sequence of ScoutEvent events
 * simulating the 4-agent Grok research swarm.
 * Duration: ~12-18 seconds, perfectly calibrated for live judging.
 */
export async function* replayScout(pack: CoursePack): AsyncGenerator<ScoutEvent> {
  const code = pack.course.code;

  // 1. Initial swarm queue
  yield { type: "agent", agent: "syllabus-scout", status: "queued", message: "Queued for catalog & syllabus lookup" };
  yield { type: "agent", agent: "exam-hunter", status: "queued", message: "Queued for past exam archive scan" };
  yield { type: "agent", agent: "student-pulse", status: "queued", message: "Queued for r/gatech & X sentiment analysis" };
  yield { type: "agent", agent: "concept-mapper", status: "queued", message: "Waiting for research agent findings" };
  await sleep(400);

  // 2. Start research agents
  yield { type: "agent", agent: "syllabus-scout", status: "searching", message: `Searching official GT syllabi for ${code}...` };
  yield { type: "log", agent: "syllabus-scout", message: `Executing query: site:gatech.edu syllabus "${code}"` };
  await sleep(500);

  yield { type: "agent", agent: "exam-hunter", status: "searching", message: `Searching public archives for ${code} past midterms...` };
  yield { type: "log", agent: "exam-hunter", message: `Executing query: "${code}" ("past exam" OR "practice test" OR "midterm") filetype:pdf` };
  await sleep(400);

  yield { type: "agent", agent: "student-pulse", status: "searching", message: `Searching r/gatech and X for student commentary...` };
  yield { type: "log", agent: "student-pulse", message: `Scanning reddit.com/r/gatech for thread mentions of "${code}"` };
  await sleep(600);

  // 3. Emit sources one by one with realistic delays
  for (const source of pack.sources) {
    yield {
      type: "log",
      agent: source.foundBy,
      message: `Discovered [${source.kind.toUpperCase()}]: "${source.title.slice(0, 50)}..."`,
    };
    yield { type: "source", source };
    await sleep(650);
  }

  // 4. Conclude research agents
  yield { type: "agent", agent: "syllabus-scout", status: "done", message: `Extracted course schedule and staff` };
  yield { type: "agent", agent: "exam-hunter", status: "done", message: `Found ${pack.sources.filter((s) => s.kind === "exam" || s.kind === "practice").length} past exam references` };
  yield { type: "agent", agent: "student-pulse", status: "done", message: `Synthesized student difficulty sentiment (${pack.fearScore}/100 fear score)` };
  await sleep(500);

  // 5. Concept Mapper takes over
  yield { type: "agent", agent: "concept-mapper", status: "thinking", message: "Building concept dependency graph & exam frequency model..." };
  yield { type: "log", agent: "concept-mapper", message: `Mapping ${pack.concepts.length} core concepts across ${pack.edges.length} prerequisite edges` };
  await sleep(800);

  yield { type: "log", agent: "concept-mapper", message: "Calculated exam frequency matrix and difficulty percentiles" };
  await sleep(600);

  yield { type: "agent", agent: "concept-mapper", status: "done", message: "Course pack assembly complete" };
  await sleep(300);

  // 6. Deliver pack and finish
  yield { type: "pack", pack };
  yield { type: "done" };
}
