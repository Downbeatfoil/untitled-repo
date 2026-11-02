/**
 * Typed fetch helpers for the frontend. Owner: orchestrator (it mirrors
 * shared/contract.ts). Frontend lanes call these instead of raw fetch.
 */
import type { AiRequest, AiResponse, ApiError } from "@/shared/contract";

export async function postAi(req: AiRequest): Promise<AiResponse> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const data = (await res.json()) as AiResponse | ApiError;
  if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : `HTTP ${res.status}`);
  return data;
}
