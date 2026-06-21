<!-- markdownlint-disable MD041 -->
<div align="center">

# campy

[![CI](https://github.com/dropdevrahul/campy/actions/workflows/ci.yml/badge.svg)](https://github.com/dropdevrahul/campy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with bun](https://img.shields.io/badge/made%20with-bun-black.svg)](https://bun.sh)
[![Docs](https://img.shields.io/badge/docs-github.io-blue.svg)](https://dropdevrahul.github.io/campy/)

**Animated ASCII terminal pets for CLI coding agents.**

Claude Code · OpenCode · Pi · Gemini CLI · Codex CLI · Cursor CLI · Aider

![campy demo](./campy.gif)

[Features](#features) • [Installation](#installation) • [Per-agent setup](#per-agent-setup) • [Slash Commands](#slash-commands) • [Docs](https://dropdevrahul.github.io/campy/) • [Discord](https://discord.gg/aY9Fv5ZRj)

</div>

---

## Features

Your pet lives in a terminal sidebar and reacts to what you're doing. It blinks, animates through moods, and drops speech bubbles when something happens — a file gets edited, a command runs, an error fires. There are four pets to choose from (Cat, Hamster, Ghost, Robot), each with seven animation states and a layered blinking system.

- **Four pets, seven states each** — idle, happy, sleeping, eating, playing, excited, sad, all multi-frame animated
- **Happiness system** — feed (+15), play (+20), or pet (+10) to keep your companion content
- **Speech bubbles** — context-aware messages like "Edited a file!", "Thinking…", "Need a hand?"
- **Automatic event reactions** — hooks fire on tool use, file edits, errors, and idle time
- **One CLI, every agent** — a single `campy` binary with per-agent adapters; no per-agent installs beyond a one-time `campy setup`
- **MCP server included** — one stdio server wires Gemini CLI, Codex CLI, and Cursor CLI at once
- **Zero-token for Claude Code** — hooks and the statusline are Bash scripts that run outside the model

## Installation

**Prerequisite:** [bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`). The CLI is a single TypeScript file with a `#!/usr/bin/env bun` shebang — no build step required.

campy isn't on the public npm registry yet. There are two ways to install it:

### Option 1 — install from GitHub (recommended)

```bash
# via bun
bun add -g github:dropdevrahul/campy

# or via npm
npm install -g github:dropdevrahul/campy
```

This registers `campy` on your `$PATH`. Verify with:

```bash
campy status
```

### Option 2 — clone and symlink

If you'd rather keep the source around to hack on it:

```bash
git clone https://github.com/dropdevrahul/campy.git ~/work/campy
cd ~/work/campy && bun install
chmod +x cli/campy.ts
ln -s "$PWD/cli/campy.ts" ~/.bun/bin/campy   # or any directory on $PATH
```

### Wire your agents

After installing, run the auto-setup to detect and wire every agent on your machine:

```bash
campy setup
```

This looks for `~/.claude`, `~/.gemini`, `~/.codex`, `~/.cursor`, `~/.pi`, `.opencode/`, and `.aider.conf.yml`, and wires each natively. To install for one agent specifically:

```bash
campy install claude-code   # | opencode | pi | gemini | codex | cursor | aider
```

### Show the pet

```bash
campy watch     # full-screen animated pet — run this in a side pane
campy attach    # auto-split a pane (tmux / zellij / wezterm / kitty)
```

## Per-agent setup

Different agents have different native surfaces. campy meets each one where it lives:

| Agent       | Surface                          | Install                         |
|-------------|----------------------------------|---------------------------------|
| Claude Code | statusline + reactive hooks      | `campy install claude-code`     |
| OpenCode    | native sidebar widget            | `campy install opencode`        |
| Pi          | native sidebar widget            | `campy install pi`              |
| Gemini CLI  | MCP tools (inline ASCII card)    | `campy install gemini`          |
| Codex CLI   | MCP tools (inline ASCII card)    | `campy install codex`           |
| Cursor CLI  | MCP tools (inline ASCII card)    | `campy install cursor`          |
| Aider       | `.git/hooks/post-commit`         | `campy install aider`           |

For agents that don't have a built-in render surface, `campy attach` spawns a side pane automatically.

**Claude Code note:** The adapter is zero-token during normal operation. Hooks and the statusline are Bash scripts that run outside the model. Slash commands (`/campy:feed`, etc.) cost a small prompt only when you explicitly invoke them.

## Slash Commands

The prefix depends on which agent you're using:

- **OpenCode / Pi**: `/pet feed`, `/pet play`, `/pet robot`, …
- **Claude Code**: `/campy:feed`, `/campy:play`, `/campy:pet`, `/campy:switch <pet>`
- **MCP agents** (Gemini / Codex / Cursor): call tools `campy_feed`, `campy_play`, `campy_pet`, `campy_switch`, `campy_status`

| Command          | Effect                               |
|------------------|--------------------------------------|
| `feed`           | Feed your pet (+15 happiness)        |
| `play`           | Play with your pet (+20 happiness)   |
| `pet`            | Pet your pet (+10 happiness)         |
| `sleep`          | Put the pet to sleep                 |
| `wake`           | Wake the pet                         |
| `status`         | Show current mood and happiness      |
| `switch <name>`  | `cat` \| `hamster` \| `ghost` \| `robot` |

## Available Pets

| Pet     | Emoji | States | Blinking        |
|---------|-------|--------|-----------------|
| Cat     | 🐱    | 7      | Layered eyes    |
| Hamster | 🐹    | 7      | Frame-step      |
| Ghost   | 👻    | 7      | Layered eyes    |
| Robot   | 🤖    | 7      | Layered eyes    |

All pets cycle through: idle, happy, sleeping, eating, playing, excited, sad.

## File Structure

```
core/             # portable pet logic — animation, store, runtime, render
cli/campy.ts      # the campy binary (bun, no build step)
adapters/
├── claude-code/  # hooks + statusline + slash commands
├── pi/           # in-process TUI widget
├── mcp/          # stdio MCP server (Gemini / Codex / Cursor)
└── gemini/       # gemini-extension.json + GEMINI.md
.opencode/        # OpenCode plugins (thin re-exports of core/)
.claude-plugin/   # Claude Code plugin marketplace manifest
ghost-pet/        # legacy standalone Bash plugin (kept for back-compat)
```

The full architecture is in [`CLAUDE.md`](./CLAUDE.md). The multi-agent design spec lives at `docs/superpowers/specs/2026-06-13-cli-agent-support-design.md`.

## License

[MIT](LICENSE)
