# Swarm rules (read before EVERY task)

You are one of several AI agents building this project at the same time, in the same repo.
You coordinate with the others only through **the board** (one pinned draft PR). Follow these rules exactly.

## 1. Your lane
Your prompt names your **lane**. `lanes.conf` lists the paths each lane owns.
- Edit, create, or delete files **only inside your lane's paths.**
- **Never** edit another lane's files, even to fix a one-line bug. Post an `ASK` on the board, addressed to that lane.
- You may **read** any file.
- `shared/contract.ts` is the API contract. Code against it. To change it, post an `ASK` to `orchestrator`.
- Need an npm package? Post `ASK` to `orchestrator` with the exact package name. Do not edit `package.json`.

| Lane | Owns | Human / tool |
|---|---|---|
| pages | `app/(site)/`, `app/layout.tsx`, `app/globals.css`, `public/` | @Downbeatfoil |
| components | `components/core/` | @Downbeatfoil |
| viz | `components/viz/` (graph, charts, heatmap, gauges) | @Downbeatfoil |
| export | `lib/export/` (SmartPath JSON, .ics, mailto builders) | @Downbeatfoil |
| qa-e2e | `tests/e2e/`, `playwright.config.ts` | @Downbeatfoil |
| api | `app/api/` | @vibhorguptagt / @v-gupta5044 |
| ai | `lib/ai/` (all Grok calls and prompts) | @vibhorguptagt / @v-gupta5044 |
| data | `lib/data/` (seed packs, mocks, cache) | @vibhorguptagt / @v-gupta5044 |
| qa-api | `tests/api/` | @vibhorguptagt / @v-gupta5044 |
| orchestrator | `shared/`, `lib/api-client.ts`, docs, config, scripts, `package.json` | Claude |

Every lane also owns its own task list: `tasks/<lane>.md`.

## 2. The loop
1. **Read the board first:** `scripts/board.sh mine <lane>` (posts addressed to you) and `scripts/board.sh read 10` (overall state).
2. **Post START:** `scripts/board.sh post <lane> START "what you're about to do"`
3. **Do the work** inside your lane. Keep it running: `npm run build` must still pass.
4. **Ship it:** `scripts/ship.sh <lane> "short message"`. This commits only your lane's files, rebases, and pushes. Ship small and often, at least every ~15 minutes.
5. **Post DONE** and address whoever depends on it:
   `scripts/board.sh post <lane> DONE "POST /api/plan works, returns PlanResponse" "components,pages"`
6. Tick the task in `tasks/<lane>.md` (`- [x]`), check the board again, and take the **next unchecked task**. Work top to bottom: P0 tasks are the demo path.
7. Out of tasks? Post `ASK` to orchestrator for more, and meanwhile polish your lane (loading states, empty states, error handling, visual polish).

Blocked? `scripts/board.sh post <lane> BLOCKED "need X from api" "api"`. While you wait, **use mocks** (`lib/data/mock.ts`) and keep building. Never sit idle.

## 3. Post format
`**[lane] TYPE** — message`, then an optional `TO: lane1, lane2` line (or `TO: all`).
Types: `START` · `DONE` · `BLOCKED` · `ASK` · `FYI` · `BUG` (QA lanes: include the failing route or page, the exact error, and how to reproduce). Keep posts to 1–3 lines with concrete facts: endpoints, file names, what changed.
Lanes are addressed with `TO:`. **Never write `@lane`.** `@` is only for real GitHub usernames of humans.

## 4. Product
Read `docs/IDEA.md` (what we're building and the demo path) and `shared/contract.ts` (every type and endpoint) before your first task.
**Demo safety rule:** every feature must work with NO `XAI_API_KEY` by falling back to seed data in `lib/data` (`mocked: true`). The live demo must never show a crash or a blank screen.

## 5. Speed rules (this is a 90-minute build)
- Working demo beats completeness. Hard-code and fake anything that isn't on the demo path.
- No auth, no refactors of working code, no new frameworks. Tests live only in the QA lanes.
- Don't break the build. If `npm run build` fails because of your lane, fixing it is your top priority.
- Frontend uses `lib/api-client.ts` helpers, not raw `fetch`. Backend Grok calls go through `lib/ai/`.
- The demo path is defined on the board by the orchestrator. Prioritize it over everything else.
