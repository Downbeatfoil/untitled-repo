# ai-tools lane — `lib/ai-tools/`  (Grok-powered study tools; api lane wires them into routes)
Use `askGrok` / `askGrokJson` from `@/lib/ai/grok`. Every function: if `!grokConfigured()` or on ANY error, return the lib/data mock (`mockExam`, `mockGrade`, …; if they don't exist yet, return an inline contract-shaped mock) with `mocked: true`. Never throw.
- [x] P0 `exam.ts`: `generateExam(pack, count=6, conceptIds?)`: questions in the style of the pack's exam sources, weighted by examTopics frequency, mix of mcq (4 choices) + short; `gradeAnswer(question, userAnswer)`: partial credit + 1–3 sentence feedback in Grok's voice.
- [x] P0 `index.ts` barrel + post DONE to `api` with exact signatures.
- [x] P1 `plan.ts`: `generatePlan(pack, examDate, hoursPerDay)`: frequency × difficulty weighting, spaced repetition, last day = full mock exam.
- [x] P1 `outreach.ts`: `draftOutreach(pack, professor, studentName?, tone)`: short respectful email asking to share past exams with SmartPath; `mailto` via `buildMailto` from `@/lib/export`.
- [x] P1 `chat.ts`: `courseChat(pack, messages)`: grounded in the pack + sources, returns `citedSourceIds`.
- [x] P1 `roast.ts`: `roastSchedule(packs: CoursePack[])` → `{ survivalOdds: number, verdict: string, perCourse: {code, line}[] }` savage-but-kind Grok roast of a semester schedule (for the lab lane). Export the type from this file.
- [x] P2 `versus.ts`: `cageMatch(a, b)` → `{ rounds: {title, winner: code, commentary}[], champion: code }` Grok sports-commentator battle of two courses.
- [x] P2 Prompt polish: Grok's voice = witty, confident, actually helpful.
- [x] P1 `selfcheck.ts`: `npx tsx lib/ai-tools/selfcheck.ts` runs every function on the CS 1332 seed, prints PASS/FAIL + mocked flag (orchestrator request).
