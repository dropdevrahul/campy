#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

if ! command -v bun &>/dev/null; then
  exit 0
fi

bun "$ROOT/cli/campy.ts" event thinking
