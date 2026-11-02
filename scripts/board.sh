#!/usr/bin/env bash
# The team board = comments on one pinned draft PR (number in board/PR_NUMBER).
# Usage:
#   scripts/board.sh read [N]              # last N posts (default 15)
#   scripts/board.sh post <lane> <TYPE> "message" [to-lanes] [@humans]
#       TYPE: START | DONE | BLOCKED | ASK | FYI
#       e.g. scripts/board.sh post api DONE "POST /api/plan live, returns PlanResponse" "components,pages"
#   scripts/board.sh mine <lane>           # posts addressed to your lane
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PR=$(tr -d '[:space:]' < board/PR_NUMBER)
[ "$PR" = "TBD" ] && { echo "Board PR not set yet: put the PR number in board/PR_NUMBER" >&2; exit 1; }

fmt='"---\n" + .author.login + " · " + .createdAt + "\n" + .body'

case "${1:-read}" in
  read) gh pr view "$PR" --json comments --jq ".comments[-${2:-15}:][] | $fmt" ;;
  mine) lane="${2:?lane}"
        gh pr view "$PR" --json comments --jq "[.comments[] | select(.body | test(\"TO:[^\\n]*\\\\b(${lane}|all)\\\\b\"))][-10:][] | $fmt" ;;
  post)
    lane="${2:?lane}"; type="${3:?TYPE}"; msg="${4:?message}"; to="${5:-}"; humans="${6:-}"
    body="**[$lane] $type** — $msg"
    [ -n "$to" ] && body+=$'\n'"TO: $to"
    [ -n "$humans" ] && body+=$'\n'"$humans"
    gh pr comment "$PR" --body "$body" >/dev/null && echo "posted: $body" ;;
  *) sed -n '2,9p' "$0"; exit 1 ;;
esac
