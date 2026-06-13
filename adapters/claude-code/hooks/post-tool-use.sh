#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

if ! command -v bun &>/dev/null; then
  exit 0
fi

# Read stdin once into a variable (Claude Code PostToolUse pipes JSON here)
INPUT="$(cat)"

if command -v jq &>/dev/null; then
  TOOL_NAME="$(printf '%s' "$INPUT" | jq -r '.tool_name // ""')"
  FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')"
  COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')"
  # Detect error: success == false or presence of .tool_response.error
  IS_ERROR="$(printf '%s' "$INPUT" | jq -r 'if (.tool_response.success == false or (.tool_response.error != null and .tool_response.error != "")) then "1" else "0" end')"

  if [ "$IS_ERROR" = "1" ]; then
    bun "$ROOT/cli/campy.ts" event error
    exit 0
  fi

  case "$TOOL_NAME" in
    Edit|Write|MultiEdit|NotebookEdit)
      if [ -n "$FILE_PATH" ]; then
        bun "$ROOT/cli/campy.ts" event file_edited --file "$FILE_PATH"
      else
        bun "$ROOT/cli/campy.ts" event file_edited
      fi
      ;;
    Bash)
      # Extract the first word of the command as the short command name
      CMD_FIRST="$(printf '%s' "$COMMAND" | awk '{print $1}')"
      if [ -n "$CMD_FIRST" ]; then
        bun "$ROOT/cli/campy.ts" event command_run --cmd "$CMD_FIRST"
      else
        bun "$ROOT/cli/campy.ts" event command_run
      fi
      ;;
    *)
      # Unknown tool — emit a generic command_run
      bun "$ROOT/cli/campy.ts" event command_run
      ;;
  esac
else
  # jq not available — emit a generic command_run so the pet still reacts
  bun "$ROOT/cli/campy.ts" event command_run
fi
