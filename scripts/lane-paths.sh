#!/usr/bin/env bash
# Print the paths owned by a lane, one per line. Usage: scripts/lane-paths.sh <lane>
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
lane="${1:?usage: lane-paths.sh <lane>}"
line=$(grep -E "^${lane}[[:space:]]*=" lanes.conf || true)
[ -z "$line" ] && { echo "Unknown lane '$lane'. Lanes: $(grep -E '^[a-z]' lanes.conf | cut -d= -f1 | xargs)" >&2; exit 1; }
for p in ${line#*=}; do echo "$p"; done
