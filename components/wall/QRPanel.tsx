"use client";
/** Lane: wall. QR panel linking to the deployed app / repo. Pure SVG, no deps. */
import { useMemo } from "react";
import { qrMatrix } from "./qr";

export const REPO_URL = "https://github.com/Downbeatfoil/untitled-repo";

export default function QRPanel({ url = REPO_URL, label = "Scan: try it & read the code", className = "" }: { url?: string; label?: string; className?: string }) {
  const m = useMemo(() => { try { return qrMatrix(url); } catch { return null; } }, [url]);
  if (!m) return null;
  const n = m.length, q = 2;
  const cells: string[] = [];
  m.forEach((row, y) => row.forEach((on, x) => { if (on) cells.push(`M${x + q} ${y + q}h1v1h-1z`); }));
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-line bg-panel/80 p-4 ${className}`}>
      <svg viewBox={`0 0 ${n + q * 2} ${n + q * 2}`} className="h-28 w-28 shrink-0 rounded-lg bg-white" shapeRendering="crispEdges" role="img" aria-label={`QR code for ${url}`}>
        <path d={cells.join("")} fill="#05070b" />
      </svg>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{label}</div>
        <div className="mt-1 break-all text-sm font-semibold text-foreground/90">{url.replace(/^https?:\/\//, "")}</div>
        <div className="mt-1 text-xs text-dim">Built in 90 min by 12 AI agents</div>
      </div>
    </div>
  );
}
