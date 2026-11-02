/**
 * SHARED CONTRACT — the single source of truth for types that cross lanes.
 * Owner: orchestrator. Any lane may READ this. To CHANGE it, post a request
 * on the board and tag the orchestrator. Never edit it from a worker lane.
 *
 * Rule: frontend lanes code against these types + the mocks in lib/data,
 * backend lanes make the real thing match them. Nobody waits on anybody.
 */

/** POST /api/ai — generic "ask Grok" endpoint. Replace/extend at kickoff. */
export interface AiRequest {
  prompt: string;
  /** Optional system-style instruction to steer the model. */
  system?: string;
}

export interface AiResponse {
  text: string;
  /** true when the server had no XAI_API_KEY and returned a mock. */
  mocked: boolean;
}

/** GET /api/health */
export interface HealthResponse {
  ok: true;
  grokConfigured: boolean;
}

/** Standard error body for every API route. */
export interface ApiError {
  error: string;
}

/* ---- Add the idea's domain types below at kickoff ---- */
