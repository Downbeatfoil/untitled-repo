"use client";
/**
 * Lane: components. Provider status pill: 'Live · Grok' / 'Live · Gemini' (green) vs 'Demo data' (amber).
 * - Data is demo when `mocked` (or pack.mocked) is true, or provider === "none".
 * - Provider comes from the `provider` prop, else from /api/health's optional `provider` field (read through
 *   lib/api-client's `getHealth` once it exists; no raw fetch here). If provider is unknown we keep the old
 *   wording ('Live Grok'). Gemini output is never labelled Grok.
 */
import { useEffect, useState } from "react";
import type { CoursePack } from "@/shared/contract";

export type Provider = "grok" | "gemini" | "none";

export interface GrokStatusPillProps {
  pack?: Pick<CoursePack, "mocked">;
  /** Overrides pack.mocked. */
  mocked?: boolean;
  /** Overrides the /api/health provider lookup. */
  provider?: Provider;
  className?: string;
}

let healthProvider: Promise<Provider | undefined> | null = null;
function loadProvider(): Promise<Provider | undefined> {
  if (!healthProvider) {
    healthProvider = import("@/lib/api-client")
      .then(async (m) => {
        const fn = (m as unknown as { getHealth?: () => Promise<{ provider?: Provider }> }).getHealth;
        return fn ? (await fn()).provider : undefined;
      })
      .catch(() => undefined);
  }
  return healthProvider;
}

export default function GrokStatusPill({ pack, mocked, provider, className = "" }: GrokStatusPillProps) {
  const [fetched, setFetched] = useState<Provider | undefined>(undefined);
  const demoFlag = mocked ?? pack?.mocked ?? true;

  useEffect(() => {
    if (provider || demoFlag) return;
    let alive = true;
    loadProvider().then((p) => alive && setFetched(p));
    return () => {
      alive = false;
    };
  }, [provider, demoFlag]);

  const p = provider ?? fetched;
  const demo = demoFlag || p === "none";
  const name = p === "gemini" ? "Gemini" : "Grok";
  return (
    <span
      role="status"
      title={demo ? "Showing seeded demo data (no live AI call)" : `Generated live by ${name}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        demo ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      } ${className}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${demo ? "bg-amber-400" : "animate-pulse bg-emerald-400"}`} />
      {demo ? "Demo data" : p ? `Live · ${name}` : "Live Grok"}
    </span>
  );
}
