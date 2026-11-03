/** Lane: api. GET /api/board-stats -> BoardStats */
import { NextResponse } from "next/server";
import type { BoardStats } from "@/shared/contract";
import { fallbackBoardStats } from "@/lib/data/boardFallback";

export const dynamic = "force-dynamic";

let cachedStats: BoardStats | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30_000;

const KNOWN_LANES = [
  "pages",
  "components",
  "viz",
  "export",
  "qa-e2e",
  "api",
  "ai",
  "data",
  "qa-api",
  "ai-tools",
  "lab",
  "wall",
  "orchestrator",
];

interface GithubComment {
  body: string;
  created_at: string;
  user?: { login: string };
}

interface GithubCommit {
  commit?: {
    message: string;
    committer?: { date: string };
  };
}

export async function GET() {
  const now = Date.now();
  if (cachedStats && now - lastFetchedAt < CACHE_TTL_MS) {
    return NextResponse.json<BoardStats>(cachedStats);
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SmartPath-Scout-Swarm",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch comments (up to 200)
    const [cPage1Res, cPage2Res, commitsRes] = await Promise.all([
      fetch("https://api.github.com/repos/Downbeatfoil/untitled-repo/issues/1/comments?per_page=100&page=1", { headers }),
      fetch("https://api.github.com/repos/Downbeatfoil/untitled-repo/issues/1/comments?per_page=100&page=2", { headers }),
      fetch("https://api.github.com/repos/Downbeatfoil/untitled-repo/commits?per_page=100", { headers }),
    ]);

    if (!cPage1Res.ok || !commitsRes.ok) {
      throw new Error(`GitHub API returned non-200: comments ${cPage1Res.status}, commits ${commitsRes.status}`);
    }

    const c1: GithubComment[] = await cPage1Res.json();
    const c2: GithubComment[] = cPage2Res.ok ? await cPage2Res.json() : [];
    const allComments = [...(Array.isArray(c1) ? c1 : []), ...(Array.isArray(c2) ? c2 : [])];

    const commitsData: GithubCommit[] = await commitsRes.json();
    const allCommits = Array.isArray(commitsData) ? commitsData : [];

    const postsPerLane = new Map<string, number>();
    const commitsPerLane = new Map<string, number>();
    const recentPosts: { lane: string; type: string; message: string; at: string }[] = [];

    // Parse comments
    for (const comment of allComments) {
      if (!comment.body) continue;
      const match = comment.body.match(/\*\*\[([a-zA-Z0-9_-]+)\]\s+([A-Z]+)\*\*\s*—\s*([^\n\r]+)/);
      if (match) {
        const lane = match[1].toLowerCase().trim();
        const type = match[2].trim();
        const msg = match[3].trim();
        postsPerLane.set(lane, (postsPerLane.get(lane) || 0) + 1);
        recentPosts.push({
          lane,
          type,
          message: msg,
          at: comment.created_at,
        });
      }
    }

    // Sort recent descending
    recentPosts.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    // Parse commits
    for (const commit of allCommits) {
      const msg = commit.commit?.message || "";
      const match = msg.match(/^\[([a-zA-Z0-9_-]+)\]/);
      if (match) {
        const lane = match[1].toLowerCase().trim();
        commitsPerLane.set(lane, (commitsPerLane.get(lane) || 0) + 1);
      }
    }

    // Aggregate lanes
    const laneSet = new Set<string>([...KNOWN_LANES, ...postsPerLane.keys(), ...commitsPerLane.keys()]);
    const lanes = Array.from(laneSet).map((lane) => ({
      lane,
      posts: postsPerLane.get(lane) || 0,
      commits: commitsPerLane.get(lane) || 0,
    })).sort((a, b) => (b.posts + b.commits) - (a.posts + a.commits));

    const totalPosts = allComments.length > 0 ? allComments.length : fallbackBoardStats.posts;
    const totalCommits = allCommits.length > 0 ? allCommits.length : fallbackBoardStats.commits;

    cachedStats = {
      posts: totalPosts,
      commits: totalCommits,
      lanes,
      recent: recentPosts.slice(0, 10),
    };
    lastFetchedAt = now;

    return NextResponse.json<BoardStats>(cachedStats);
  } catch (err) {
    console.warn("[api/board-stats] fetch failed, using fallbackBoardStats:", (err as Error)?.message);
    return NextResponse.json<BoardStats>(fallbackBoardStats, {
      headers: { "x-mocked": "1" },
    });
  }
}
