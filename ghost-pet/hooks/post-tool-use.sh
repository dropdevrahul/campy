#!/usr/bin/env bash
# Hook: PostToolUse — ghost gets happy when tools succeed
DIR="$(cd "$(dirname "$0")/.." && pwd)"
bash "$DIR/ghost-pet.sh" happy