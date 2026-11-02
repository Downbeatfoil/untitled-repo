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
