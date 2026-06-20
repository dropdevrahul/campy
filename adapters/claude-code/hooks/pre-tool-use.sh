#!/usr/bin/env bash
# No-op stub.
#
# campy removed its PreToolUse hook (it is absent from hooks.json — campy now
# wires only SessionStart, PostToolUse, Stop). But ~/.claude/settings.json still
# carries a stale manual PreToolUse entry pointing here, so every tool call was
# failing with "No such file or directory". This stub makes that stale reference
# harmless. Durable fix: delete the PreToolUse block from ~/.claude/settings.json,
# then this file can be removed.
exit 0
