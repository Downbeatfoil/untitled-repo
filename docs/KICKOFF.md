# Kickoff runbook (2-hour build)

## Before the event
- [ ] Both laptops: repo cloned, `npm install`, `.env.local` holds `XAI_API_KEY`, `npm run dev` works
- [ ] Both laptops: `gh auth login` done (agents post to the board with `gh`)
- [ ] Vercel project linked to the repo, `XAI_API_KEY` set in Vercel env vars
- [ ] Board PR open and pinned, its number in `board/PR_NUMBER`
- [ ] Fill in HUMAN_A / HUMAN_B GitHub usernames in `AGENTS.md`

## 0:00–0:15: Lock the idea (humans + Claude)
1. Paste the theme, tracks, and prizes to Claude.
2. Claude proposes 3–5 ideas scored on: **prize fit · demo wow · buildable in 90 min · uses Grok well**.
3. Pick one. Claude writes `docs/IDEA.md`, the demo path, and the real types in `shared/contract.ts`, then pushes.

## 0:15–0:20: Fire the swarm
For each lane, open a new Cursor agent and paste `prompts/agents/<lane>.md` with the `{{…}}` filled in
(Claude posts filled versions on the board). Suggested split:
- **HUMAN_A:** pages, components, integrations
- **HUMAN_B:** api, ai, data
- Optional extra agents: a second components agent (different files), or a "polish" agent on pages later on

## 0:20–1:30: Build
- Humans: watch your agents, approve their changes, keep them unblocked, talk to sponsors.
- Claude: watches the board, answers ASKs, updates the contract, flags drift, tracks the demo path.
- **Merge checkpoint every 30 min:** `git pull`, `npm run build`, click through the demo path.

## 1:30–1:45: Integrate
Orchestrator posts `INTEGRATE`. All lanes swap mocks for real calls and fix only demo-path bugs.

## 1:45–2:00: FREEZE
Orchestrator posts `FREEZE`. No new features. Deploy to Vercel, rehearse the demo, submit to Devpost (`docs/DEVPOST.md`).
