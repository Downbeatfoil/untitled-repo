/**
 * Lane: ai. The only place that talks to the xAI (Grok) API.
 * xAI's API is OpenAI-compatible, so we use the OpenAI SDK with a custom baseURL.
 */
import OpenAI from "openai";

const MODEL = process.env.GROK_MODEL || "grok-4";

let client: OpenAI | null = null;

export function grokConfigured(): boolean {
  return Boolean(process.env.XAI_API_KEY);
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
    });
  }
  return client;
}

export interface AskOptions {
  system?: string;
  /** Ask the model for a JSON object back. */
  json?: boolean;
  temperature?: number;
}

/** Send one prompt to Grok and get text back. */
export async function askGrok(prompt: string, opts: AskOptions = {}): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.7,
    response_format: opts.json ? { type: "json_object" } : undefined,
    messages: [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

/** Ask Grok for JSON and parse it. Throws if the model returns invalid JSON. */
export async function askGrokJson<T>(prompt: string, opts: Omit<AskOptions, "json"> = {}): Promise<T> {
  const text = await askGrok(prompt, { ...opts, json: true });
  return JSON.parse(text) as T;
}

/* ------------------------------------------------------------------ */
/* Agentic research: Grok with server-side web_search / x_search tools */
/* ------------------------------------------------------------------ */

export interface ResearchResult {
  text: string;
  citations: string[]; // URLs Grok cited
}

/**
 * Run one Grok research agent with live web and/or X search (xAI Responses API).
 * xAI executes the searches server-side; we just get text + citations back.
 * ai lane: tune model/tools/prompt here. Falls back gracefully; callers must catch.
 */
export async function researchWithGrok(
  prompt: string,
  opts: { system?: string; tools?: ("web_search" | "x_search")[]; model?: string } = {},
): Promise<ResearchResult> {
  const base = process.env.XAI_BASE_URL || "https://api.x.ai/v1";
  const res = await fetch(`${base}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({
      model: opts.model || MODEL,
      input: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: prompt },
      ],
      tools: (opts.tools || ["web_search"]).map((type) => ({ type })),
    }),
  });
  if (!res.ok) throw new Error(`Grok research failed: HTTP ${res.status} ${await res.text().catch(() => "")}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  let text: string = data.output_text || "";
  const citations = new Set<string>(Array.isArray(data.citations) ? data.citations.map(String) : []);
  for (const item of data.output || []) {
    for (const c of item.content || []) {
      if (!data.output_text && typeof c.text === "string") text += c.text;
      for (const a of c.annotations || []) if (a.url) citations.add(a.url);
    }
  }
  return { text, citations: [...citations] };
}
