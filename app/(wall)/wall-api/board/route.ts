/**
 * Lane: wall. GET /wall-api/board -> BoardFeed (last 30 board posts parsed + counts).
 * Calls the PUBLIC GitHub API unauthenticated (optional GITHUB_TOKEN env var, read at runtime only).
 * 20 s in-memory cache, ETag conditional requests (304s are free), stale-on-error, static fallback.
 */
import { NextResponse } from "next/server";
import { FALLBACK_FEED } from "@/components/wall/fallback";
import type { BoardFeed, BoardPost } from "@/components/wall/types";

export const dynamic = "force-dynamic";

const REPO = "Downbeatfoil/untitled-repo";
const API = `https://api.github.com/repos/${REPO}`;
const BOARD_ISSUE = 1;
const TTL_MS = 20_000;

interface Hit { etag?: string; json: unknown; link: string }
const hits = new Map<string, Hit>();
let cache: { at: number; feed: BoardFeed } | null = null;
let inflight: Promise<BoardFeed> | null = null;
let blockedUntil = 0; // set when GitHub rate-limits us

async function gh(url: string): Promise<Hit> {
  const prev = hits.get(url);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "smartpath-scout-wall",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN; // optional, runtime only, never committed
  if (token) headers.Authorization = `Bearer ${token}`;
  if (prev?.etag) headers["If-None-Match"] = prev.etag;
  const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (res.status === 304 && prev) return prev;
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
    blockedUntil = Number.isFinite(reset) && reset > Date.now() ? reset : Date.now() + 60_000;
    throw new Error(`rate limited (${res.status})`);
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const hit: Hit = { etag: res.headers.get("etag") ?? undefined, json: await res.json(), link: res.headers.get("link") ?? "" };
  hits.set(url, hit);
  return hit;
}

const lastPage = (link: string): number => {
  const m = link.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return m ? Number(m[1]) : 1;
};

interface RawComment { id: number; body?: string; created_at: string; user?: { login?: string } }

function parseComment(c: RawComment): BoardPost | null {
  const body = (c.body ?? "").replace(/\r/g, "");
  const lines = body.split("\n");
  const m = lines[0]?.match(/^\*\*\[([a-z0-9-]+)\]\s+([A-Za-z]+)\*\*\s*[—–-]*\s*(.*)$/);
  if (!m) return null;
  const msg: string[] = [m[3]];
  let to: string[] = [];
  for (const line of lines.slice(1)) {
    const t = line.match(/^TO:\s*(.*)$/);
    if (t) { to = t[1].split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean); break; }
    if (/^---/.test(line.trim())) break;
    msg.push(line);
  }
  return {
    id: c.id,
    lane: m[1],
    type: m[2].toUpperCase(),
    message: msg.join(" ").replace(/\s+/g, " ").trim(),
    to,
    at: c.created_at,
    author: c.user?.login ?? "",
  };
}

async function allComments(): Promise<{ posts: BoardPost[]; total: number }> {
  const base = `${API}/issues/${BOARD_ISSUE}/comments?per_page=100`;
  const first = await gh(base);
  const last = lastPage(first.link);
  let rows = first.json as RawComment[];
  let total = rows.length;
  if (last > 1) {
    const tail = (await gh(`${base}&page=${last}`)).json as RawComment[];
    total = (last - 1) * 100 + tail.length;
    rows = tail;
    if (tail.length < 30) rows = [...((await gh(`${base}&page=${last - 1}`)).json as RawComment[]), ...tail];
  }
  const all = rows.map(parseComment).filter((p): p is BoardPost => !!p);
  return { posts: all.slice(-30), total };
}

async function commitInfo(): Promise<{ total: number; recent: BoardFeed["recentCommits"]; byLane: Record<string, number> }> {
  const base = `${API}/commits?per_page=100`;
  const first = await gh(base);
  const rows = first.json as { commit?: { message?: string; author?: { date?: string } } }[];
  const last = lastPage(first.link);
  let total = rows.length;
  if (last > 1) total = (last - 1) * 100 + ((await gh(`${base}&page=${last}`)).json as unknown[]).length;
  const byLane: Record<string, number> = {};
  const recent: BoardFeed["recentCommits"] = [];
  for (const r of rows) {
    const msg = (r.commit?.message ?? "").split("\n")[0];
    const m = msg.match(/^\[([a-z0-9-]+)\]\s*(.*)$/i);
    if (!m) continue;
    const lane = m[1].toLowerCase();
    byLane[lane] = (byLane[lane] ?? 0) + 1;
    if (recent.length < 12) recent.push({ lane, message: m[2], at: r.commit?.author?.date ?? "" });
  }
  return { total, recent, byLane };
}

async function build(): Promise<BoardFeed> {
  const [c, k] = await Promise.all([allComments(), commitInfo()]);
  const perLane: Record<string, number> = {};
  for (const p of c.posts) perLane[p.lane] = (perLane[p.lane] ?? 0) + 1;
  const laneIds = new Set([...Object.keys(perLane), ...Object.keys(k.byLane)]);
  return {
    posts: c.posts,
    total: c.total,
    commits: k.total,
    lanes: [...laneIds].map((lane) => ({ lane, posts: perLane[lane] ?? 0, commits: k.byLane[lane] ?? 0 })),
    recentCommits: k.recent,
    firstAt: c.posts[0]?.at ?? FALLBACK_FEED.firstAt,
    source: "github",
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const now = Date.now();
  const headers = { "Cache-Control": "no-store" };
  if (cache && (now - cache.at < TTL_MS || now < blockedUntil)) return NextResponse.json(cache.feed, { headers });
  try {
    if (now < blockedUntil) throw new Error("backing off");
    inflight ??= build().finally(() => { inflight = null; });
    const feed = await inflight;
    cache = { at: Date.now(), feed };
    return NextResponse.json(feed, { headers });
  } catch {
    if (cache) return NextResponse.json({ ...cache.feed, source: "stale" as const }, { headers });
    return NextResponse.json(FALLBACK_FEED, { headers });
  }
}
