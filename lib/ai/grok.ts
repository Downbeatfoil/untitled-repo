/**
 * Lane: ai. The only place that talks to AI providers (Grok / Gemini).
 * Supports both xAI Grok and Google Gemini with automatic provider detection,
 * web/search grounding, and graceful fallbacks.
 */
import OpenAI from "openai";

export type Provider = "grok" | "gemini" | "none";

const DEFAULT_GROK_MODEL = process.env.GROK_MODEL || "grok-4";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

let grokClient: OpenAI | null = null;
let geminiClient: OpenAI | null = null;

/** Detect active provider based on configured API keys */
export function provider(): Provider {
  if (process.env.XAI_API_KEY) return "grok";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "none";
}

/** Check if either Grok or Gemini is configured */
export function grokConfigured(): boolean {
  return provider() !== "none";
}

function getClient(): OpenAI {
  const p = provider();
  if (p === "gemini") {
    if (!geminiClient) {
      geminiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    }
    return geminiClient;
  }

  if (!grokClient) {
    grokClient = new OpenAI({
      apiKey: process.env.XAI_API_KEY || "dummy",
      baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
    });
  }
  return grokClient;
}

function getModel(custom?: string): string {
  if (custom) return custom;
  return provider() === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_GROK_MODEL;
}

export interface AskOptions {
  system?: string;
  /** Ask the model for a JSON object back. */
  json?: boolean;
  temperature?: number;
  model?: string;
}

/** Send one prompt to Grok or Gemini and get text back. */
export async function askGrok(prompt: string, opts: AskOptions = {}): Promise<string> {
  const p = provider();
  if (p === "none") {
    throw new Error("No AI API key configured (neither XAI_API_KEY nor GEMINI_API_KEY).");
  }

  const res = await getClient().chat.completions.create({
    model: getModel(opts.model),
    temperature: opts.temperature ?? 0.7,
    response_format: opts.json ? { type: "json_object" } : undefined,
    messages: [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

/** Ask Grok or Gemini for JSON and parse it. Throws if invalid JSON. */
export async function askGrokJson<T>(prompt: string, opts: Omit<AskOptions, "json"> = {}): Promise<T> {
  const text = await askGrok(prompt, { ...opts, json: true });
  return JSON.parse(text) as T;
}

/* ------------------------------------------------------------------ */
/* Agentic research: Grok (Responses API) / Gemini (Google Search grounding) */
/* ------------------------------------------------------------------ */

export interface ResearchResult {
  text: string;
  citations: string[]; // URLs cited
}

/**
 * Run one research agent with live web/search tools.
 * Grok uses xAI Responses API (web_search, x_search).
 * Gemini uses generateContent with google_search grounding tool.
 */
export async function researchWithGrok(
  prompt: string,
  opts: { system?: string; tools?: ("web_search" | "x_search")[]; model?: string } = {},
): Promise<ResearchResult> {
  const p = provider();

  if (p === "none") {
    throw new Error("No AI API key configured for live research.");
  }

  if (p === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    const model = opts.model || DEFAULT_GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    // Fold x_search request into web query since Gemini uses Google Search
    let effectivePrompt = prompt;
    if (opts.tools?.includes("x_search")) {
      effectivePrompt += "\n(Include public discussions from site:reddit.com OR site:x.com where relevant.)";
    }

    const payload: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: effectivePrompt }] }],
      tools: [{ google_search: {} }],
    };

    if (opts.system) {
      payload.system_instruction = { parts: [{ text: opts.system }] };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini research failed: HTTP ${res.status} ${errText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    let text = "";
    const citations = new Set<string>();

    const candidate = data.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (typeof part.text === "string") text += part.text;
      }
    }

    // Extract grounding URLs
    const chunks = candidate?.groundingMetadata?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.web?.uri && typeof chunk.web.uri === "string") {
        citations.add(chunk.web.uri);
      }
    }

    return { text, citations: [...citations] };
  }

  // xAI Grok Responses API
  const base = process.env.XAI_BASE_URL || "https://api.x.ai/v1";
  const res = await fetch(`${base}/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({
      model: opts.model || DEFAULT_GROK_MODEL,
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
