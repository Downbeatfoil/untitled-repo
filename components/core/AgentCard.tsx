"use client";
/** Lane: components. One of the 4 Grok scout agents with an animated status. */
import { AGENTS, type AgentName, type AgentStatus } from "@/shared/contract";
import Badge from "./Badge";
import Fx from "./Fx";

const TOOL_LABEL = { web: "web_search", x: "x_search", "web+x": "web + X", reasoning: "reasoning" } as const;

const STATUS_LABEL: Record<AgentStatus, string> = {
  queued: "Queued",
  searching: "Searching",
  thinking: "Thinking",
  done: "Done",
  error: "Error",
};

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "done")
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/20 text-emerald-300" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
    );
  if (status === "error")
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-400/20 text-rose-300" aria-hidden>
        !
      </span>
    );
  if (status === "searching" || status === "thinking")
    return (
      <span
        aria-hidden
        className={`h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${status === "searching" ? "border-[#2D7DFF]" : "border-[#B3A369]"}`}
      />
    );
  return <span aria-hidden className="h-3 w-3 animate-pulse rounded-full bg-neutral-600" />;
}

export interface AgentCardProps {
  agent: AgentName;
  status?: AgentStatus;
  /** Latest message from the `agent` event. */
  message?: string;
}

export default function AgentCard({ agent, status = "queued", message }: AgentCardProps) {
  const meta = AGENTS.find((a) => a.name === agent) ?? { label: agent, emoji: "🤖", tool: "reasoning" as const };
  const active = status === "searching" || status === "thinking";
  const border =
    status === "done"
      ? "border-emerald-400/30"
      : status === "error"
        ? "border-rose-400/40"
        : active
          ? status === "searching"
            ? "border-[#2D7DFF]/60"
            : "border-[#B3A369]/60"
          : "border-white/10";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 transition-colors duration-500 ${border} ${active ? "shadow-[0_0_32px_-12px_#2D7DFF]" : ""} ${status === "queued" ? "opacity-70" : ""}`}
      data-agent={agent}
      data-status={status}
    >
      <Fx />
      {active && <div aria-hidden className="sp-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />}
      <div className="relative flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-black/40 text-2xl ${active ? "sp-ping" : ""}`} aria-hidden>
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{meta.label}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge tone={meta.tool === "reasoning" ? "gold" : "blue"}>{TOOL_LABEL[meta.tool]}</Badge>
            <span
              className={`text-xs font-medium ${status === "done" ? "text-emerald-300" : status === "error" ? "text-rose-300" : active ? "text-[#7FB0FF]" : "text-neutral-500"}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
        <StatusIcon status={status} />
      </div>
      <p className="relative mt-3 min-h-[2.5rem] text-sm leading-snug text-neutral-400" aria-live="polite">
        {message || (status === "queued" ? "Waiting for its turn…" : "")}
      </p>
    </div>
  );
}
