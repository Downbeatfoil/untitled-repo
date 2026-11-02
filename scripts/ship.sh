#!/usr/bin/env bash
# Commit + push ONLY your lane's files, safely alongside other agents.
# Usage: scripts/ship.sh <lane> "commit message"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
lane="${1:?usage: ship.sh <lane> \"message\"}"
msg="${2:?usage: ship.sh <lane> \"message\"}"
mapfile -t paths < <(scripts/lane-paths.sh "$lane")

retry() { local n=0; until "$@"; do n=$((n+1)); [ $n -ge 5 ] && return 1; echo "retrying ($n)…" >&2; sleep $((n*2)); done; }

# Stage only this lane's paths (new, modified, deleted).
existing=(); for p in "${paths[@]}"; do [ -e "$p" ] || git ls-files --error-unmatch "$p" >/dev/null 2>&1 && existing+=("$p"); done
[ ${#existing[@]} -eq 0 ] && { echo "Nothing in lane '$lane' exists yet."; exit 0; }
retry git add -A -- "${existing[@]}"

if git diff --cached --quiet -- "${existing[@]}"; then
  echo "No changes in lane '$lane' to ship."
else
  # --only semantics: commits just these paths even if other agents staged things.
  retry git commit -m "[$lane] $msg" -- "${existing[@]}"
fi

retry git pull --rebase --autostash origin "$(git branch --show-current)"
retry git push origin HEAD
echo "Shipped [$lane] $msg"
