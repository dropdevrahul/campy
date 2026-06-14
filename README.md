<!-- markdownlint-disable MD041 -->
<div align="center">

# campy

[![CI](https://github.com/dropdevrahul/campy/actions/workflows/ci.yml/badge.svg)](https://github.com/dropdevrahul/campy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with bun](https://img.shields.io/badge/made%20with-bun-black.svg)](https://bun.sh)

Animated terminal pets for CLI coding agents — Claude Code, OpenCode, Pi, Gemini CLI, Codex CLI, Cursor CLI, Aider.

[Features](#features) • [Installation](#installation) • [Per-agent setup](#per-agent-setup) • [Slash Commands](#slash-commands) * [Discord](https://discord.gg/aY9Fv5ZRj)


</div>

## Demo

![campy demo](./campy.gif)

## Overview

campy brings delightful ASCII pets to your terminal sidebar. Pets animate through states, react to coding events, and display contextual speech bubbles—adding personality to your coding sessions.

## Features

- **4 Pet Types**: Cat, Hamster, Ghost, and Robot
- **7 Animation States**: idle, happy, sleeping, eating, playing, excited, sad—with multi-frame animations and blinking
- **Speech Bubbles**: Context-aware messages ("Edited file!", "Thinking...", "Need a hand?")
- **Happiness System**: Feed, play, or pet your companion to increase happiness
- **Event Reactions**: Automatic responses to tool use, file edits, errors, and idle states
- **Multi-agent**: One CLI + per-agent adapters for Claude Code, OpenCode, Pi, Gemini CLI, Codex CLI, Cursor CLI, and Aider
- **MCP server**: One stdio server unlocks Gemini / Codex / Cursor at once

## Installation

> **Prerequisite:** [bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`). The CLI is a single TypeScript file with a `#!/usr/bin/env bun` shebang — no build step.

campy isn't on npm yet. Pick one of these:

### Option 1 — install straight from GitHub (recommended)

```bash
# via bun
bun add -g github:dropdevrahul/campy

# or via npm
npm install -g github:dropdevrahul/campy
```

This registers `campy` on your `$PATH`. Verify:

```bash
campy status
```

### Option 2 — clone and symlink

```bash
git clone https://github.com/dropdevrahul/campy.git ~/work/campy
cd ~/work/campy && bun install
chmod +x cli/campy.ts
ln -s "$PWD/cli/campy.ts" ~/.bun/bin/campy   # or any dir on $PATH
```

### Auto-detect & wire every agent you have installed

```bash
campy setup
```

This detects which agents are installed on your machine (`~/.claude`, `~/.gemini`, `~/.codex`, `~/.cursor`, `~/.pi`, `.opencode/`, `.aider.conf.yml`) and wires each natively. Or install for one agent:

```bash
campy install claude-code   # | opencode | pi | gemini | codex | cursor | aider
```

### Render the pet

```bash
campy watch     # run inline in any terminal
campy attach    # auto-split a side pane (tmux / zellij / wezterm / kitty)
```

## Per-agent setup

| Agent       | Surface                         | Install                         |
|-------------|---------------------------------|---------------------------------|
| Claude Code | statusline + hooks              | `campy install claude-code`     |
| OpenCode    | native sidebar widget           | `campy install opencode`        |
| Pi          | native sidebar widget           | `campy install pi`              |
| Gemini CLI  | MCP tools (inline ASCII card)   | `campy install gemini`          |
| Codex CLI   | MCP tools (inline ASCII card)   | `campy install codex`           |
| Cursor CLI  | MCP tools (inline ASCII card)   | `campy install cursor`          |
| Aider       | `.git/hooks/post-commit`        | `campy install aider`           |

For agents with no built-in render surface, run `campy attach` in a side pane.

### Token usage

The Claude Code adapter is **zero-token** for normal operation. Hooks and the statusline are bash scripts run outside the model. Slash commands (`/campy:feed`, etc.) cost a small prompt when *you* invoke them.

## Slash Commands

The slash-command prefix depends on the host:

- **OpenCode / Pi**: `/pet feed`, `/pet play`, `/pet robot`, …
- **Claude Code**: `/campy:feed`, `/campy:play`, `/campy:pet`, `/campy:switch <pet>`
- **MCP agents** (Gemini / Codex / Cursor): call the tools `campy_feed`, `campy_play`, `campy_pet`, `campy_switch`, `campy_status`

| Command       | Effect                          |
|---------------|---------------------------------|
| `feed`        | Feed your pet (+15 happiness)   |
| `play`        | Play with your pet (+20 happiness) |
| `pet`         | Pet your pet (+10 happiness)    |
| `sleep`       | Put pet to sleep                |
| `wake`        | Wake pet                        |
| `status`      | Show mood & happiness           |
| `switch <pet>` | `cat` \| `hamster` \| `ghost` \| `robot` |

## Available Pets

| Pet | States | Blinking | Emoji |
|-----|--------|----------|-------|
| Cat | 7 states | Yes (layered eyes) | 🐱 |
| Hamster | 7 states | Yes (frame-step) | 🐹 |
| Ghost | 7 states | Yes (layered eyes) | 👻 |
| Robot | 7 states | Yes (layered eyes) | 🤖 |

## File Structure

```
core/             # portable pet logic (animation, store, runtime, render)
cli/campy.ts      # the campy binary (bun)
adapters/
├── claude-code/  # hooks + statusline + slash commands
├── pi/           # in-process TUI widget
├── mcp/          # stdio MCP server (Gemini / Codex / Cursor)
└── gemini/       # gemini-extension.json + GEMINI.md
.opencode/        # OpenCode plugins (re-export from core/)
.claude-plugin/   # Claude Code marketplace manifest
ghost-pet/        # legacy standalone Bash plugin (kept for back-compat)
```

See `CLAUDE.md` for the full architecture, and `docs/superpowers/specs/2026-06-13-cli-agent-support-design.md` for the multi-agent design spec.

## License

[MIT](LICENSE)
