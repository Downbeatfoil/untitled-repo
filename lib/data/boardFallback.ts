/**
 * Lane: data
 * Realistic fallback BoardStats for /built-by-agents when GitHub API is rate-limited or unreachable.
 */
import type { BoardStats } from "@/shared/contract";

export const fallbackBoardStats: BoardStats = {
  posts: 38,
  commits: 46,
  lanes: [
    { lane: "pages", posts: 6, commits: 8 },
    { lane: "components", posts: 5, commits: 7 },
    { lane: "viz", posts: 4, commits: 5 },
    { lane: "data", posts: 5, commits: 6 },
    { lane: "api", posts: 5, commits: 6 },
    { lane: "ai", posts: 4, commits: 4 },
    { lane: "ai-tools", posts: 3, commits: 3 },
    { lane: "qa-api", posts: 3, commits: 3 },
    { lane: "qa-e2e", posts: 3, commits: 4 },
  ],
  recent: [
    { lane: "data", type: "DONE", message: "CS 1332 seed pack live + all seeds shipped in lib/data", at: "2026-11-03T01:15:42Z" },
    { lane: "viz", type: "DONE", message: "Round 2 shipped: LearningPath, GTConstellation, BattleBars", at: "2026-11-03T01:14:52Z" },
    { lane: "pages", type: "DONE", message: "All pages tasks done & shipped: /, /scout/[slug], /course/[slug]", at: "2026-11-03T01:14:30Z" },
    { lane: "components", type: "DONE", message: "Core component suite shipped to main", at: "2026-11-03T01:08:16Z" },
    { lane: "orchestrator", type: "FYI", message: "KICKOFF: building SmartPath Scout across 9 lanes", at: "2026-11-03T00:52:00Z" },
  ],
};
