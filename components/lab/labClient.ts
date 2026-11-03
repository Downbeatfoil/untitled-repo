"use client";
/** Lane: lab. Typed client for lab-api routes (same shape as lib/api-client helpers). */
import type { RoastResult } from "./roastMock";
import type { VersusResult } from "./versusMock";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok || (data && typeof data === "object" && "error" in data)) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}
export const postRoast = (codes: string[]) => post<RoastResult>("/lab-api/roast", { codes });
export const postVersus = (a: string, b: string) => post<VersusResult>("/lab-api/versus", { a, b });
