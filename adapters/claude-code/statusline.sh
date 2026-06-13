#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v bun &>/dev/null; then
  exit 0
fi

# Claude Code feeds JSON on stdin for statusline scripts; ignore it.
# Just print one compact status line.
bun "$ROOT/cli/campy.ts" statusline
