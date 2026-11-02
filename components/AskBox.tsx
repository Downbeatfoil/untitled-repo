"use client";
/** Lane: components. Demo component proving the frontend → API → Grok path works. */
import { useState } from "react";
import { postAi } from "@/lib/api-client";

export default function AskBox() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [mocked, setMocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postAi({ prompt });
      setAnswer(res.text);
      setMocked(res.mocked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-4">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Grok anything…"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {answer && (
        <div className="rounded-lg border border-neutral-200 p-4 text-sm leading-relaxed dark:border-neutral-800">
          {mocked && <span className="mb-2 block text-xs uppercase tracking-wide text-amber-600">Mock response</span>}
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
