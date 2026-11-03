"use client";
/** Lane: components. Exam date + hours/day → postPlan → day-by-day grid → "Add to calendar (.ics)". */
import { useState } from "react";
import { exportUrl, postPlan } from "@/lib/api-client";
import type { Concept, StudyPlan } from "@/shared/contract";
import Badge from "./Badge";
import Button from "./Button";
import Fx from "./Fx";
import Skeleton from "./Skeleton";

export interface StudyPlannerProps {
  courseCode: string;
  /** Used to show concept names on plan days. */
  concepts?: Concept[];
}

function isoIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function prettify(id: string) {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function fmtDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    dow: d.toLocaleDateString("en-US", { weekday: "short" }),
    md: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export default function StudyPlanner({ courseCode, concepts = [] }: StudyPlannerProps) {
  const [examDate, setExamDate] = useState(isoIn(10));
  const [hours, setHours] = useState(2);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedKey, setUsedKey] = useState<{ examDate: string; hours: number } | null>(null);

  const label = (id: string) => concepts.find((c) => c.id === id)?.label ?? prettify(id);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(examDate);

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validDate || loading) return;
    setLoading(true);
    setError(null);
    try {
      const p = await postPlan({ courseCode, examDate, hoursPerDay: hours });
      setPlan(p);
      setUsedKey({ examDate, hours });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't build a plan");
    } finally {
      setLoading(false);
    }
  }

  const icsHref = usedKey
    ? exportUrl(courseCode, "ics", `&examDate=${encodeURIComponent(usedKey.examDate)}&hoursPerDay=${usedKey.hours}`)
    : "";
  const totalMin = plan?.days.reduce((s, d) => s + d.minutes, 0) ?? 0;
  const input =
    "rounded-lg border border-white/10 bg-[#0d0f14] px-3 py-2 text-white outline-none transition focus:border-[#2D7DFF] [color-scheme:dark]";

  return (
    <div className="space-y-6">
      <Fx />
      <form onSubmit={generate} className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <label className="space-y-1 text-sm text-neutral-400">
          <span className="block">Exam date</span>
          <input type="date" value={examDate} min={isoIn(1)} onChange={(e) => setExamDate(e.target.value)} className={input} required />
        </label>
        <label className="space-y-1 text-sm text-neutral-400">
          <span className="block">Hours per day</span>
          <input
            type="number"
            min={0.5}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Math.max(0.5, Math.min(12, Number(e.target.value) || 1)))}
            className={`${input} w-28`}
          />
        </label>
        <Button type="submit" loading={loading} disabled={!validDate}>
          {plan ? "Rebuild plan" : "Build my study plan"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading && !plan && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {plan && (
        <div className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-400">
              <b className="text-white">{plan.days.length}</b> days · <b className="text-white">{Math.round((totalMin / 60) * 10) / 10}</b> hours total
              {plan.mocked && <Badge tone="neutral" className="ml-2">demo plan</Badge>}
            </p>
            <Button href={icsHref} download variant="blue" size="sm">
              📅 Add to calendar (.ics)
            </Button>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.days.map((d, i) => {
              const f = fmtDate(d.date);
              const isExam = i === plan.days.length - 1 && d.date === usedKey?.examDate;
              return (
                <li
                  key={d.date}
                  className={`sp-fly-in rounded-2xl border p-4 ${isExam ? "border-[#B3A369]/60 bg-[#B3A369]/10" : "border-white/10 bg-white/[0.04]"}`}
                  style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-white">
                      <span className="text-[#B3A369]">{f.dow}</span> {f.md}
                    </p>
                    <span className="text-xs tabular-nums text-neutral-500">{d.minutes} min</span>
                  </div>
                  {d.conceptIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {d.conceptIds.map((id) => (
                        <Badge key={id} tone="blue">
                          {label(id)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                    {d.tasks.map((t, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-[#2D7DFF]">▸</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
