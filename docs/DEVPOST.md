# SmartPath Scout: Devpost write-up

**Tagline:** Name any Georgia Tech class. A swarm of Grok agents finds the public past exams, syllabi and student chatter, then builds you a study path in about 60 seconds.

## Inspiration
Every GT student knows the trick for the scary classes: get the old exams from someone who already took the course. But those exams live in frat files, upperclassman group chats and Discords. If you are first-gen, a transfer student, or just new, you don't have that network, and you walk into CS 1332 or MATH 1554 a step behind.

SmartPath (BDBI, gt-big-data/smart-path-ai) already turns study material into knowledge graphs and quizzes, but students must already *have* the material, and there is no courses page. Scout fills both gaps: it finds the material for you, using only **publicly posted** sources with every one cited, and exports straight into SmartPath's graph format.

## What it does
1. **Search any class** ("What class are you dreading?"). The home page also shows a "Most feared at GT" gallery of seeded courses with fear scores.
2. **Live scout:** four specialist agents (Exam Hunter, Syllabus Scout, Student Pulse, Concept Mapper) light up, a thought ticker streams, and sources fly into a feed with kind badges (exam, syllabus, reddit, x).
3. **Course pack dashboard:** fear-score gauge, summary, a **concept graph** (nodes sized by exam frequency, colored by difficulty, prerequisite arrows), a "What's on the exam" chart, a difficulty heatmap, student quotes, cited sources and study tips.
4. **Practice exam:** questions in the style of the real past exams (MCQ + short answer), weighted by how often each topic appears. Grok grades free-text answers with partial credit and 1-3 sentences of feedback.
5. **Study plan:** pick an exam date and hours per day, get a day-by-day plan (frequency x difficulty priority, spaced repetition, last day = full mock exam) and **Add to calendar (.ics)**.
6. **Professor outreach:** Grok drafts a short, respectful email asking the professor to share past exams with SmartPath. It opens in your mail app; **a human always hits send**, nothing is auto-sent.
7. **Ask the course:** chat grounded in the pack that cites its sources.
8. **Export to SmartPath:** JSON in SmartPath's knowledge-graph format.
9. **Extras for fun:** `/roast` (Schedule Roast: pick your semester, get survival odds and one savage-but-kind line per class), `/versus` (Course Cage Match: sports-commentator battle of two courses), `/wall` (TV mode with live agent swarm) and `/built-by-agents` (live stats of how this app was built).

12 courses are seeded (CS 1332, 2110, 1331, 2340, 2200, 3510, 4641, MATH 1554, 2551, PHYS 2211, ECE 2020, CHEM 1310), so the demo never depends on the venue network.

## How we built it
We built it with a **swarm of AI coding agents** coordinating through **one pinned draft PR used as a message board**. A lane was a set of file paths one agent was allowed to touch (`lanes.conf`); a shared TypeScript contract (`shared/contract.ts`) and a typed client (`lib/api-client.ts`) let every lane build in parallel against the same types.

- **Agents:** GrokBot, Antigravity and Cursor agents each ran lanes; **Claude was the orchestrator** (contract, config, scripts, docs, answering ASKs, running the QA lanes).
- **Lanes:** pages, components, viz, export, api, ai, data, ai-tools, lab, wall, qa-api, qa-e2e (12 worker lanes) plus the orchestrator.
- **Protocol:** `scripts/board.sh post <lane> START|DONE|ASK|BUG|FYI "..." <to-lanes>` and `scripts/ship.sh <lane>`, which commits only that lane's files, rebases and pushes. Nobody edits another lane's files; they post an ASK or BUG instead.
- **Real numbers (as of 01:28Z, about 2 hours in, still growing):** **71 commits** on `main` and **121 board posts** (31 orchestrator, 17 ai-tools, 12 qa-e2e, 10 ai, 9 pages, 9 components, 8 viz, 6 data, 5 lab, 5 api, 4 wall, 3 qa-api, 2 export). The live final counts are on `/built-by-agents` (`GET /api/board-stats`, which reads the board and `git log`).
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind, SSE for the scout stream, Vercel to deploy.

## How we use Grok
Grok is the product **and** the builder.
- **Research agents:** the scout runs four agents in parallel. Exam Hunter, Syllabus Scout and Student Pulse use xAI's Responses API with server-side `web_search` and `x_search` (Student Pulse uses both), returning text plus citations. Concept Mapper reasons over everything and emits the validated concept graph (zod-checked, with a repair pass).
- **Study tools (`lib/ai-tools`):** Grok writes practice exams in the style of the real past-exam sources (we validate every question: 4 distinct choices, answer must be one of them, concept ids must exist), grades short answers with partial credit, writes the study-plan task text, drafts the professor email, answers course chat with source citations, roasts your schedule and commentates a Course Cage Match. One shared "Grok voice": witty, confident, actually helpful.
- **Grounding:** every tool is given a compact digest of the course pack (concepts with exam frequency and difficulty, sources, student quotes), and cited source ids are validated against the pack so Grok can't invent a source.
- **Model-agnostic at the edge:** all calls go through one module (`lib/ai/grok.ts`), so the provider can be swapped without touching any lane. At the organizers' request an alternative provider (Gemini) is being wired in behind the same function names; the UI is meant to label whichever provider actually answered, never to pass one off as the other.
- **Built by agents:** the whole codebase was written by coding agents (GrokBot, Cursor, Antigravity, Claude) coordinating on the board.

## Challenges we ran into
- **Many agents, one repo.** Early on two agents started the same lane and one overwrote the other's file. We fixed it with an explicit split posted on the board ("A owns exam/plan/chat, B owns roast/versus/outreach"), append-only rules for the shared `index.ts` barrel, and `git pull --rebase` before every ship.
- **Shared tooling that broke everyone.** One type error in an API route (a mock called with the wrong arity) can fail `npm run build` for every lane at once; one bash-4-only script failed on macOS. The board made these visible within minutes and the owning lane fixed them.
- **Demo safety.** We had no live key during most of the build, so *every* feature has a deterministic fallback to seed data (`mocked: true`, shown as a "Demo data" pill) and nothing may throw or show a raw HTTP error. We tested the live paths against a stub of the xAI endpoint (malformed MCQs, wrong source ids, bad JSON) to make sure validation and fallbacks hold. An honest caveat: the seeded demo is deterministic; the live scout depends on the network and a key.
- **Keeping LLM output trustworthy.** Models happily return MCQs with duplicate choices or an "answer" that isn't a choice, plans on the wrong dates, or citations to sources that don't exist. We made the schedule (dates, minutes, spaced repetition) deterministic and let Grok write only the prose, graded MCQs by exact match, and filtered citations to real source ids.
- **Ethics.** We only use public material, cite everything, never scrape behind logins, and the outreach email is a draft a human sends.

## Accomplishments we're proud of
- A full demo path that is green end to end in automated e2e tests: search, scout stream, course pack, exam, plan, outreach mailto, export.
- A real multi-agent build: 12 worker lanes shipped in parallel with no human merge conflicts to resolve by hand.
- Every Grok tool works offline with sensible output, and a `selfcheck` script (`npx tsx lib/ai-tools/selfcheck.ts`) exercises all of them plus edge cases (empty packs, bad dates, bad counts).
- Social good: the "old exam from a friend" advantage, available to every student, with sources.

## What we learned
- A typed contract plus lane ownership is what lets agents move fast without stepping on each other; a board with START/DONE/ASK/BUG posts is enough coordination.
- Let the model do language and let code do structure: deterministic skeletons with LLM-written text beat free-form generation for plans and exams.
- Demo reliability is a feature: fallbacks first, live Grok as the upgrade.

## What's next
- Real SmartPath integration: push the exported graph and quizzes straight into smart-path-ai instead of a JSON download.
- Many more courses and schools; community-contributed packs with moderation and provenance.
- Retrieval over the actual text of public exams (not just snippets and citations) for more faithful question styles.
- Spaced-repetition reminders and calendar sync that adapt to how you score on practice exams.
- Instructor opt-in: professors can publish official practice material that Scout prioritizes.

## Built with
nextjs · typescript · tailwind · grok · xai · web_search · x_search · zod · server-sent-events · vercel · github-actions-free-pr-board · cursor · grokbot · antigravity · claude
