"use client";
/** Lane: components. Big course search box with example chips. Props typed with contract types. */
import { useState } from "react";
import { normalizeCourseCode, type CourseCode } from "@/shared/contract";

const DEFAULT_EXAMPLES: CourseCode[] = ["CS 1332", "CS 2110", "MATH 1554", "CS 3510", "PHYS 2211"];

export interface CourseSearchProps {
  onSubmit: (code: CourseCode) => void;
  examples?: CourseCode[];
  placeholder?: string;
  buttonLabel?: string;
  disabled?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function CourseSearch({
  onSubmit,
  examples = DEFAULT_EXAMPLES,
  placeholder = "e.g. CS 1332, MATH 1554…",
  buttonLabel = "Scout it",
  disabled = false,
  initialValue = "",
  autoFocus = false,
}: CourseSearchProps) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const normalized = normalizeCourseCode(value);
  const valid = /^[A-Z]{2,4} \d{4}[A-Z]?$/.test(normalized);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setTouched(true);
    if (!valid || disabled) return;
    onSubmit(normalized);
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={submit} className="group relative" role="search" aria-label="Search for a Georgia Tech course">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#B3A369] via-[#2D7DFF] to-[#B3A369] opacity-30 blur transition group-focus-within:opacity-70" />
        <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0f14] p-2 pl-5">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#B3A369]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => value && setTouched(true)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-label="Course code"
            aria-invalid={touched && !valid && !!value}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-3 text-lg text-white placeholder-neutral-500 outline-none"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="rounded-xl bg-[#B3A369] px-6 py-3 font-semibold text-black shadow-[0_0_24px_-6px_#B3A369] transition hover:bg-[#C9BB82] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buttonLabel} →
          </button>
        </div>
      </form>
      {touched && value && !valid && (
        <p role="alert" className="mt-2 pl-2 text-sm text-rose-300">
          Try a course code like “CS 1332” (letters + 4 digits).
        </p>
      )}
      {examples.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pl-1">
          <span className="text-xs uppercase tracking-wider text-neutral-500">Try</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={disabled}
              onClick={() => {
                setValue(ex);
                setTouched(true);
                onSubmit(normalizeCourseCode(ex));
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300 transition hover:border-[#2D7DFF]/70 hover:bg-[#2D7DFF]/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF] disabled:opacity-40"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
