"use client";
/** Lane: components. Grok drafts, you send. Professor + tone → postOutreach → editable draft → mailto + copy. */
import { useState } from "react";
import { postOutreach } from "@/lib/api-client";
import { buildMailto } from "@/lib/export/mailto";
import type { OutreachDraft, Professor } from "@/shared/contract";
import Badge from "./Badge";
import Button from "./Button";
import Skeleton from "./Skeleton";

export interface OutreachComposerProps {
  courseCode: string;
  professors: Professor[];
  studentName?: string;
}

const field =
  "w-full rounded-lg border border-white/10 bg-[#0d0f14] px-3 py-2 text-white placeholder-neutral-600 outline-none transition focus:border-[#2D7DFF]";

export default function OutreachComposer({ courseCode, professors, studentName }: OutreachComposerProps) {
  const profs = professors.length ? professors : [{ name: "the course professor" } as Professor];
  const [profIdx, setProfIdx] = useState(0);
  const [tone, setTone] = useState<"formal" | "friendly">("friendly");
  const [name, setName] = useState(studentName ?? "");
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prof = profs[Math.min(profIdx, profs.length - 1)];

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const d = await postOutreach({ courseCode, professorName: prof.name, studentName: name.trim() || undefined, tone });
      setDraft(d);
      setTo(d.to ?? prof.email ?? "");
      setSubject(d.subject);
      setBody(d.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't draft the email");
    } finally {
      setLoading(false);
    }
  }

  const mailto = buildMailto(to || undefined, subject, body);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed — select the text and copy manually.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Badge tone="gold">Grok drafts, you send.</Badge>
        <span className="text-xs text-neutral-500">Nothing is ever sent automatically.</span>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-neutral-400">
          <span className="block">Professor</span>
          <select value={profIdx} onChange={(e) => setProfIdx(Number(e.target.value))} className={field}>
            {profs.map((p, i) => (
              <option key={`${p.name}-${i}`} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm text-neutral-400">
          <span className="block">Your name (optional)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" className={field} />
        </label>
        <div className="space-y-1 text-sm text-neutral-400 sm:col-span-2">
          <span className="block">Tone</span>
          <div role="radiogroup" aria-label="Tone" className="inline-flex rounded-lg border border-white/10 p-0.5">
            {(["friendly", "formal"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tone === t}
                onClick={() => setTone(t)}
                className={`rounded-md px-4 py-1.5 text-sm capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] ${tone === t ? "bg-[#B3A369] font-semibold text-black" : "text-neutral-300 hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Button onClick={generate} loading={loading}>
            {draft ? "Redraft with Grok" : "Draft with Grok"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading && !draft && <Skeleton lines={6} />}

      {draft && (
        <div className="sp-fly-in space-y-3 rounded-2xl border border-white/10 bg-[#0d0f14] p-4" aria-live="polite">
          <label className="block space-y-1 text-xs uppercase tracking-wider text-neutral-500">
            To
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="professor@gatech.edu" className={`${field} normal-case tracking-normal`} />
          </label>
          <label className="block space-y-1 text-xs uppercase tracking-wider text-neutral-500">
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={`${field} normal-case tracking-normal`} />
          </label>
          <label className="block space-y-1 text-xs uppercase tracking-wider text-neutral-500">
            Message
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={11} className={`${field} normal-case leading-relaxed tracking-normal`} />
          </label>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button href={mailto} variant="blue">
              ✉️ Open in mail app
            </Button>
            <Button variant="outline" onClick={copy}>
              {copied ? "Copied ✓" : "Copy"}
            </Button>
            {draft.mocked && <Badge>demo draft</Badge>}
          </div>
        </div>
      )}
    </div>
  );
}
