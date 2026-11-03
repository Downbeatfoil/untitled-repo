# ai lane — `lib/ai/`  (Grok research: scout + concept mapper)
**SCOPE CHANGE:** exam/grade/plan/outreach/chat moved to the new `ai-tools` lane (`lib/ai-tools`). Skip those tasks; go deep on scout quality.
`lib/ai/grok.ts` already has `askGrok`, `askGrokJson`, and `researchWithGrok(prompt, {tools: ["web_search","x_search"]})`.
- [x] P0 `lib/ai/agents.ts`: one function per scout agent, each returning `{ sources: Source[], notes: string }`:
      `examHunter(code)` (web_search: publicly posted past exams/practice tests for the GT course), `syllabusScout(code)` (web_search: syllabus, course page, professors, schedule), `studentPulse(code)` (x_search + web_search for r/gatech: what's hard, quotes w/ sentiment). Map citations → `Source` with correct `kind` + `foundBy`.
- [x] P0 `lib/ai/conceptMapper.ts`: `buildPack(code, findings): Promise<CoursePack>` using `askGrokJson` with a strict JSON schema in the prompt; validate with zod; repair or fall back to seed on bad JSON.
- [x] P0 `lib/ai/scout.ts`: `async function* runScout(code): AsyncGenerator<ScoutEvent>` — run the 3 research agents in PARALLEL, yield agent status + log + source events as each finishes, then concept-mapper → pack → done. If no key or any failure: `yield* replayScout(seed or generic pack)` from lib/data. Never throw.
- [x] P0 `lib/ai/exam.ts`: `generateExam(pack, count, conceptIds?)` — questions imitate the style of found exam sources; `gradeAnswer(question, userAnswer)` with partial credit + feedback. Fallbacks to lib/data mocks.
- [x] P1 `lib/ai/plan.ts`: `generatePlan(pack, examDate, hoursPerDay)` — weight by examTopics frequency × difficulty; spaced repetition; final day = mock exam.
- [x] P1 `lib/ai/outreach.ts`: `draftOutreach(pack, professor, studentName, tone)` — short, respectful email asking the professor to share past exams/practice material with SmartPath; never pushy. Builds `mailto` via lib/export if available.
- [x] P1 `lib/ai/chat.ts`: `courseChat(pack, messages)` grounded in pack + sources, returns cited source ids.
- [x] P1 `lib/ai/prompts.ts`: put EVERY system prompt here; make Grok's voice witty but useful (it's Grok).
- [x] P2 Timeouts: each research agent max 25 s (AbortController); on timeout, emit agent error + continue with what you have.
- [ ] P2 Quality loop: run scout for CS 1332 live (if key), compare with seed, tighten prompts until output looks great.
