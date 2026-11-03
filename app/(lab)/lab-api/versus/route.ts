/** Lane: lab. POST { a: string, b: string } -> VersusResult (cageMatch from ai-tools; inline mock fallback; never throws). */
import { NextResponse } from "next/server";
import { cageMatch } from "@/lib/ai-tools";
import { packsFor } from "@/components/lab/server";
import { mockVersus, type VersusResult, type VersusRound } from "@/components/lab/versusMock";

export const dynamic = "force-dynamic";

const KEYS: [RegExp, number, string][] = [
  [/fear/i, 0, "😱"], [/overload|material|concept(?!.*hard)/i, 1, "🧠"], [/exam|ambush|chaos/i, 2, "🎯"],
  [/hard|boss/i, 3, "👹"], [/student|trauma|tear|reddit|cry/i, 4, "😭"],
];
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

/** Enrich Grok/ai-tools rounds ({title,winner,commentary}) with emoji, stat strings and damage for the arena UI. */
function enrich(g: { rounds: { title: string; winner: string; commentary: string }[]; champion: string; mocked: boolean }, base: VersusResult): VersusResult {
  const valid = new Set([base.a.code, base.b.code]);
  const rounds: VersusRound[] = g.rounds.filter((r) => valid.has(r.winner)).slice(0, 6).map((r) => {
    const k = KEYS.find(([re]) => re.test(r.title));
    const m0 = k ? base.rounds[k[1]] : undefined;
    const m = m0 && m0.winner === r.winner ? m0 : undefined; // only show stats that agree with the stated winner
    return {
      title: r.title.replace(/^\s*round\s*\d+\s*[:.\-–]\s*/i, "").trim() || "Showdown",
      emoji: k ? k[2] : "🥊",
      winner: r.winner,
      commentary: r.commentary,
      aStat: m?.aStat ?? "", bStat: m?.bStat ?? "",
      damage: m ? m.damage : 16 + (hash(r.title + r.winner) % 12),
    };
  });
  if (rounds.length < 2) return base;
  const champion = valid.has(g.champion) ? g.champion : base.champion;
  const cw = champion === base.a.code ? base.a : base.b;
  const wins = rounds.filter((r) => r.winner === champion).length;
  return { ...base, rounds, champion, championLine: `${cw.code} takes it ${wins}–${rounds.length - wins}. Respect the fear: ${cw.hardest} is still out there.`, mocked: g.mocked };
}

export async function POST(req: Request) {
  let body: { a?: unknown; b?: unknown } = {};
  try { body = await req.json(); } catch { /* handled below */ }
  const r = packsFor([body.a, body.b], 2, 2);
  if ("error" in r) return NextResponse.json({ error: r.error === "Pick at least 2 courses" ? "Pick two different courses" : r.error }, { status: 400 });
  const base = mockVersus(r.packs[0], r.packs[1]);
  try {
    const g = await cageMatch(r.packs[0], r.packs[1]);
    return NextResponse.json(enrich(g, base));
  } catch {
    return NextResponse.json(base);
  }
}
