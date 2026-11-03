"use client";
/** Lane: components. Live "thought" ticker: the last few log lines, newest typed out with a caret. */
import { useEffect, useState } from "react";
import { AGENTS, type AgentName } from "@/shared/contract";
import Fx from "./Fx";

export interface LogLine {
  agent: AgentName;
  message: string;
}

function Typed({ text, animate }: { text: string; animate: boolean }) {
  const [n, setN] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (!animate) return;
    setN(0);
    const step = Math.max(1, Math.ceil(text.length / 40));
    const id = setInterval(() => {
      setN((v) => {
        if (v + step >= text.length) {
          clearInterval(id);
          return text.length;
        }
        return v + step;
      });
    }, 18);
    return () => clearInterval(id);
  }, [text, animate]);
  return <>{text.slice(0, n)}</>;
}

export interface LogTickerProps {
  logs: LogLine[];
  /** How many lines to keep visible. Default 5. */
  max?: number;
  title?: string;
}

export default function LogTicker({ logs, max = 5, title = "Live thoughts" }: LogTickerProps) {
  const shown = logs.slice(-max);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-[13px]">
      <Fx />
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#2D7DFF]" aria-hidden /> {title}
      </div>
      <ul className="space-y-1.5" aria-live="polite" aria-relevant="additions" aria-label="Agent log">
        {shown.length === 0 && <li className="text-neutral-600">Agents are warming up…</li>}
        {shown.map((l, i) => {
          const last = i === shown.length - 1;
          const meta = AGENTS.find((a) => a.name === l.agent);
          return (
            <li
              key={logs.length - shown.length + i}
              className={`flex gap-2 ${last ? "text-neutral-100" : "text-neutral-500"}`}
              style={{ opacity: last ? 1 : 0.5 + (i / shown.length) * 0.4 }}
            >
              <span className="shrink-0 text-[#B3A369]">{meta?.emoji ?? "›"}</span>
              <span className={last ? "sp-caret" : ""}>
                <Typed text={l.message} animate={last} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
