# Project Name

> One-line pitch.

## Run it
```bash
npm install
cp .env.example .env.local   # add XAI_API_KEY
npm run dev
```
Without `XAI_API_KEY` the app still runs on mock responses.

## How this repo works
This project is built by a swarm of AI agents working in parallel:
- **Lanes:** each agent owns specific folders (`lanes.conf`, `AGENTS.md`) and never edits another lane's files.
- **Board:** one pinned draft PR is the shared message board (`scripts/board.sh`).
- **Shipping:** `scripts/ship.sh <lane> "msg"` commits only that lane's files, then rebases and pushes.
- **Contract:** `shared/contract.ts` defines every cross-lane type, so frontend and backend never block each other.

Kickoff runbook: `docs/KICKOFF.md` · Agent prompts: `prompts/agents/`

Final commit from GrokBot (Downbeatfoil) after FREEZE. Thanks to every lane in the swarm.
