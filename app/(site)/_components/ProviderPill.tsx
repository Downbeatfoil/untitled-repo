"use client";
/** Lane: pages. Provider-aware status pill: never labels Gemini output as Grok. */
import { useEffect, useState } from "react";
import type { CoursePack, HealthResponse } from "@/shared/contract";

type Provider = NonNullable<HealthResponse["provider"]>;
const NAMES: Record<Provider, string> = { grok: "Grok", gemini: "Gemini", none: "" };

export function useProvider(): Provider | null {
  const [p, setP] = useState<Provider | null>(null);
  useEffect(() => {
    let alive = true;
    // No api-client helper for /api/health yet; read-only GET.
    fetch("/api/health")
      .then((r) => r.json() as Promise<HealthResponse>)
      .then((h) => alive && setP(h.provider ?? (h.grokConfigured ? "grok" : "none")))
      .catch(() => alive && setP("none"));
    return () => { alive = false; };
  }, []);
  return p;
}

export default function ProviderPill({ pack }: { pack: Pick<CoursePack, "mocked"> }) {
  const provider = useProvider();
  const demo = pack.mocked || provider === "none";
  const name = provider ? NAMES[provider] : "";
  const label = demo ? "Demo data" : name ? `Live · ${name}` : "Live";
  return (
    <span
      role="status"
      title={demo ? "Showing seeded demo data (no live model call)" : `Generated live${name ? ` by ${name}` : ""}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        demo ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${demo ? "bg-amber-400" : "animate-pulse bg-emerald-400"}`} />
      {label}
    </span>
  );
}
