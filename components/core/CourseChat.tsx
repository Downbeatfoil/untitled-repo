"use client";
/** Lane: components. "Ask the course" chat grounded in the pack; replies cite sources as chips. */
import { useEffect, useRef, useState } from "react";
import { postChat } from "@/lib/api-client";
import type { ChatMessage, Source } from "@/shared/contract";
import Button from "./Button";
import { fallbackChat } from "./fallback";
import GrokStatusPill from "./GrokStatusPill";
import Fx from "./Fx";

export interface CourseChatProps {
  courseCode: string;
  /** Pack sources: lets citations render as titled links. Optional. */
  sources?: Source[];
  suggestions?: string[];
}

interface Turn extends ChatMessage {
  cited?: string[];
  mocked?: boolean;
}

const DEFAULT_SUGGESTIONS = ["What's on exam 2?", "What do students say is hardest?", "Where can I find past exams?", "How should I study for this class?"];

export default function CourseChat({ courseCode, sources = [], suggestions = DEFAULT_SUGGESTIONS }: CourseChatProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [turns, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      let res;
      try {
        res = await postChat({ courseCode, messages: next.map(({ role, content }) => ({ role, content })) });
      } catch {
        res = await fallbackChat(courseCode, content); // demo safety: never show a raw HTTP error
      }
      setTurns([...next, { role: "assistant", content: res.reply, cited: res.citedSourceIds, mocked: res.mocked }]);
    } catch {
      setError("Couldn't get an answer right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
      <Fx />
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-label="Conversation">
        {turns.length === 0 && (
          <div className="space-y-3 py-6 text-center">
            <p className="text-lg font-semibold text-white">Ask the course</p>
            <p className="text-sm text-neutral-400">Answers are grounded in {courseCode}&rsquo;s course pack, with sources cited.</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-[#2D7DFF]/70 hover:bg-[#2D7DFF]/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7DFF]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`sp-fly-in flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                t.role === "user" ? "rounded-br-sm bg-[#2D7DFF] text-white" : "rounded-bl-sm border border-white/10 bg-black/40 text-neutral-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{t.content}</p>
              {t.role === "assistant" && t.mocked && <GrokStatusPill mocked className="mt-2 !px-2 !py-0.5 !text-[10px]" />}
              {t.cited && t.cited.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.cited.map((id) => {
                    const s = sources.find((x) => x.id === id);
                    const cls =
                      "rounded-full border border-[#B3A369]/40 bg-[#B3A369]/10 px-2 py-0.5 text-[11px] text-[#D9CD9A] transition hover:bg-[#B3A369]/20";
                    return s ? (
                      <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.title} className={cls}>
                        📎 {s.title.length > 28 ? `${s.title.slice(0, 27)}…` : s.title}
                      </a>
                    ) : (
                      <span key={id} className={cls}>
                        📎 {id}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start" role="status" aria-label="Grok is typing">
            <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-black/40 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#B3A369]" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="text-center text-sm text-rose-300">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about exams, topics, tips…"
          aria-label="Your question"
          disabled={loading}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0d0f14] px-3 py-2 text-white placeholder-neutral-600 outline-none transition focus:border-[#2D7DFF]"
        />
        <Button type="submit" disabled={!input.trim()} loading={loading}>
          Ask
        </Button>
      </form>
    </div>
  );
}
