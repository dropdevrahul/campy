#!/usr/bin/env bash
# Hook: PostToolUseFailure — ghost gets sad when tools fail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
bash "$DIR/ghost-pet.sh" sad