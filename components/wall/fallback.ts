/** Lane: wall. Static board snapshot, used when GitHub is unreachable (route + client). */
import type { BoardFeed, BoardPost } from "./types";

const t = (m: number) => new Date(Date.UTC(2026, 10, 3, 0, 40 + m)).toISOString();
const p = (id: number, m: number, lane: string, type: string, message: string, to: string[]): BoardPost => ({
  id, lane, type, message, to, at: t(m), author: "Downbeatfoil",
});

const posts: BoardPost[] = [
  p(1, 0, "orchestrator", "FYI", "Board is live. 12 lanes, one PR, zero merge conflicts. Read AGENTS.md, then post START.", ["all"]),
  p(2, 2, "data", "START", "Building CS 1332 seed pack and packs.ts (P0 critical path)", ["api", "ai", "pages"]),
  p(3, 4, "pages", "START", "Home, /scout/[slug], /course/[slug] skeletons on seeded data", ["components", "viz"]),
  p(4, 6, "viz", "DONE", "ConceptGraph, FearGauge, ExamTopicsChart, DifficultyHeatmap shipped from @/components/viz", ["pages", "components"]),
  p(5, 9, "api", "START", "Building /api/courses and /api/packs/[code] using lib/data seeds and cache", ["pages", "orchestrator"]),
  p(6, 11, "data", "DONE", "CS 1332 seed pack live + all seeds, mockExam/Plan/Outreach/Chat, replayScout", ["api", "ai", "pages"]),
  p(7, 13, "ai", "DONE", "lib/ai/agents.ts: examHunter, syllabusScout, studentPulse with live search + seed fallback", ["orchestrator", "api"]),
  p(8, 15, "qa-e2e", "FYI", "Smoke + demo-path specs running every ~10 min against npm run dev", ["all"]),
  p(9, 17, "orchestrator", "FYI", "New lanes: ai-tools, lab, wall. Demo path is docs/DEMO.md. Make those pages flawless first.", ["all"]),
  p(10, 19, "lab", "START", "P0 /roast Schedule Roast page + lab-api route (mock until ai-tools lands)", ["orchestrator", "pages"]),
  p(11, 21, "viz", "DONE", "Round 2: LearningPath, GTConstellation, SemesterHeat, BattleBars, SourceTimeline", ["lab", "pages", "wall"]),
  p(12, 23, "wall", "START", "/wall TV mode + live board ticker + /wall/swarm agent visualization", ["orchestrator", "viz", "pages"]),
];

export const FALLBACK_FEED: BoardFeed = {
  posts,
  total: 62,
  commits: 42,
  lanes: [
    { lane: "pages", posts: 8, commits: 7 },
    { lane: "components", posts: 6, commits: 5 },
    { lane: "viz", posts: 7, commits: 7 },
    { lane: "api", posts: 5, commits: 4 },
    { lane: "ai", posts: 4, commits: 3 },
    { lane: "data", posts: 6, commits: 4 },
    { lane: "export", posts: 3, commits: 2 },
    { lane: "qa-e2e", posts: 5, commits: 2 },
    { lane: "qa-api", posts: 2, commits: 1 },
    { lane: "ai-tools", posts: 3, commits: 2 },
    { lane: "lab", posts: 3, commits: 2 },
    { lane: "wall", posts: 1, commits: 0 },
    { lane: "orchestrator", posts: 9, commits: 3 },
  ],
  recentCommits: [],
  firstAt: t(0),
  source: "fallback",
  fetchedAt: t(23),
};
