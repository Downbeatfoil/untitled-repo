# qa-api lane — `tests/api/`  (you test; you NEVER fix other lanes' code — post BUG to the owner)
Tests are plain Node ESM using `node:test` + `fetch`, file names `tests/api/*.test.mjs`, base URL `process.env.BASE_URL || "http://localhost:3000"`. Run with `npm run dev` in another terminal, then `npm run test:api`.
- [x] P0 `health.test.mjs`, `courses.test.mjs` (array, each item has code/title/fearScore), `packs.test.mjs` (cs-1332 valid CoursePack; unknown course still returns a pack or clean 404).
- [ ] P0 `scout.test.mjs`: POST /api/scout for CS 1332, read the SSE stream, assert: ≥1 agent event per agent, ≥5 source events, exactly one pack event, ends with done, all within 60 s.
- [ ] P0 `exam.test.mjs`: exam returns N questions with valid shapes; grade returns 0..1 score + feedback.
- [ ] P1 `plan.test.mjs`, `outreach.test.mjs` (mailto starts with "mailto:"), `chat.test.mjs`, `export.test.mjs` (smartpath JSON shape, ics starts with BEGIN:VCALENDAR).
- [ ] P1 `validation.test.mjs`: bad bodies return 400 with `{error}`; never 500.
- [x] P1 `tests/api/contract.mjs`: tiny runtime validators mirroring shared/contract.ts types, reused by all tests.
- [ ] P1 Loop every ~10 min: pull, run the full suite, post a one-line `FYI` summary ("api suite: 14/16 pass") and a `BUG` per failure addressed to the owning lane (api/ai/data).
- [ ] P2 `perf.test.mjs`: courses/packs < 500 ms, exam < 15 s.
- [ ] P2 Run the suite with no XAI_API_KEY to prove demo-safety; report.
