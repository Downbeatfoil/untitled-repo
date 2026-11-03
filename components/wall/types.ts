/** Lane: wall. Shared types + constants for the TV wall and swarm viz. */

export interface BoardPost {
  id: number;
  lane: string;
  type: string; // START | DONE | BLOCKED | ASK | FYI | BUG
  message: string;
  to: string[]; // lanes addressed via "TO:"; may contain "all"
  at: string; // ISO
  author: string;
}

export interface BoardFeed {
  /** Newest-last, max 30. */
  posts: BoardPost[];
  total: number; // all board posts
  commits: number; // all commits on the default branch
  lanes: { lane: string; posts: number; commits: number }[];
  recentCommits: { lane: string; message: string; at: string }[];
  firstAt: string; // ISO of the first board post (for the "minutes" counter)
  source: "github" | "stale" | "fallback";
  fetchedAt: string;
}

export interface WallCourse {
  code: string;
  title: string;
  fearScore: number;
  summary: string;
  conceptCount: number;
  sourceCount: number;
  mocked: boolean;
  hardest: { label: string; description: string; score: number; unit?: string };
  topics: { label: string; frequency: number }[];
  quote: { text: string; from: string; sentiment: "positive" | "neutral" | "negative" } | null;
}

export interface LaneMeta {
  id: string;
  label: string;
  who: string;
  color: string;
}

const GROK = "#d6c78a"; // GrokBot / Cursor
const ANTI = "#3d8bff"; // Antigravity
const CLAUDE = "#ff9b6b"; // Claude

/** The 12 worker lanes + the orchestrator hub. */
export const LANES: LaneMeta[] = [
  { id: "pages", label: "Pages", who: "GrokBot", color: GROK },
  { id: "components", label: "Components", who: "GrokBot", color: GROK },
  { id: "viz", label: "Viz", who: "GrokBot", color: GROK },
  { id: "ai-tools", label: "AI Tools", who: "GrokBot", color: GROK },
  { id: "lab", label: "Lab", who: "GrokBot", color: GROK },
  { id: "wall", label: "Wall", who: "GrokBot", color: GROK },
  { id: "api", label: "API", who: "Antigravity", color: ANTI },
  { id: "ai", label: "AI", who: "Antigravity", color: ANTI },
  { id: "data", label: "Data", who: "Antigravity", color: ANTI },
  { id: "qa-api", label: "QA API", who: "Antigravity", color: ANTI },
  { id: "export", label: "Export", who: "Claude", color: CLAUDE },
  { id: "qa-e2e", label: "QA E2E", who: "Claude", color: CLAUDE },
];
export const ORCH: LaneMeta = { id: "orchestrator", label: "Orchestrator", who: "Claude", color: CLAUDE };

export const TYPE_COLOR: Record<string, string> = {
  START: "#3d8bff",
  DONE: "#3ddc97",
  BLOCKED: "#ff5d6c",
  BUG: "#ff5d6c",
  ASK: "#ffb547",
  FYI: "#8a96aa",
};

export function laneColor(lane: string): string {
  return [...LANES, ORCH].find((l) => l.id === lane)?.color ?? "#8a96aa";
}

export function ago(iso: string, now = 0): string {
  if (!now) return "";
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (!Number.isFinite(s)) return "";
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
