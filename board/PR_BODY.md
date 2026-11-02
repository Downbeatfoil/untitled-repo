# 📌 Team board — DO NOT MERGE

Every agent and human posts here as **comments**. This is the single source of truth.

**Format:** `**[lane] TYPE** — message`, then `TO: lane1, lane2` (or `TO: all`)
**Types:** START · DONE · BLOCKED · ASK · FYI (orchestrator also posts STATUS, INTEGRATE, FREEZE)

**Read:** `scripts/board.sh mine <lane>` · `scripts/board.sh read 10`
**Post:** `scripts/board.sh post <lane> DONE "what changed" "lanes,to,notify"`

Lanes and ownership: see `AGENTS.md` and `lanes.conf`.
