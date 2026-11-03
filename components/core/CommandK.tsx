"use client";
/**
 * Lane: components. Quick-switcher: Cmd/Ctrl+K opens; '/' focuses the page's course search
 * (any element with [data-course-search]) or, if none, opens the switcher. Type any course code to scout it.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { courseSlug, normalizeCourseCode, type CourseCode, type CourseSummary } from "@/shared/contract";

export interface CommandKProps {
  /** Courses to list (e.g. from getCourses()). Optional: typing a code always works. */
  courses?: CourseSummary[];
  /** Called with the normalized code. Default: navigate to /scout/[slug]. */
  onSelect?: (code: CourseCode) => void;
}

function isTyping(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

export default function CommandK({ courses = [], onSelect }: CommandKProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const typed = normalizeCourseCode(q);
  const typedValid = /^[A-Z]{2,4} \d{4}[A-Z]?$/.test(typed);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const list = courses.filter((c) => !needle || `${c.code}${c.title}`.toLowerCase().replace(/[^a-z0-9]/g, "").includes(needle));
    const items = list.map((c) => ({ code: c.code, sub: c.title, fear: c.fearScore }));
    if (typedValid && !items.some((i) => i.code === typed)) items.unshift({ code: typed, sub: "Scout this course", fear: -1 });
    return items;
  }, [courses, q, typed, typedValid]);

  function choose(code: CourseCode) {
    setOpen(false);
    setQ("");
    if (onSelect) onSelect(code);
    else window.location.assign(`/scout/${courseSlug(code)}`);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        prevFocus.current = document.activeElement as HTMLElement | null;
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        const el = document.querySelector<HTMLElement>("[data-course-search]");
        if (el) {
          el.focus();
          return;
        }
        prevFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else prevFocus.current?.focus?.();
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-start justify-items-center bg-black/70 px-4 pt-[15vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Scout a course"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#B3A369]/40 bg-[#0d0f14] shadow-[0_0_60px_-20px_#2D7DFF]"
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const r = results[active];
              if (r) choose(r.code);
              else if (typedValid) choose(typed);
            }
          }}
          placeholder="Scout any course… (e.g. CS 1332)"
          aria-label="Course"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          className="w-full border-b border-white/10 bg-transparent px-5 py-4 text-lg text-white placeholder-neutral-600 outline-none"
        />
        <ul id="cmdk-list" role="listbox" className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-neutral-500">Type a course code like “MATH 1554”.</li>}
          {results.map((r, i) => (
            <li key={r.code} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r.code)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${i === active ? "bg-[#2D7DFF]/20 text-white" : "text-neutral-300"}`}
              >
                <span>
                  <b className="text-[#D9CD9A]">{r.code}</b> <span className="text-sm text-neutral-400">{r.sub}</span>
                </span>
                {r.fear >= 0 && <span className="text-xs tabular-nums text-neutral-500">😱 {Math.round(r.fear)}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-neutral-500">
          <span>↑↓ navigate</span>
          <span>↵ scout</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
