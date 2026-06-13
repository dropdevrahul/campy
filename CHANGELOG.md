# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project loosely follows [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-06-13

First proper release. campy is now a multi-agent project rather than an OpenCode-only plugin.

### Added

- **Portable `core/` module** — single source of truth for all pet logic (types, animation engine, GIF engine, pets, theme, personality, happiness, events, store, actions, runtime, render, detect).
- **`campy` CLI** (`cli/campy.ts`) — subcommands: `watch`, `attach`, `statusline`, `mcp`, `event`, `feed`, `play`, `pet`, `sleep`, `wake`, `switch`, `status`, `setup`, `install`.
- **State-file bus** — short-lived hooks mutate `~/.campy/state.json` (atomic temp + rename); long-lived renderers read it.
- **MCP adapter** (`adapters/mcp/`) — dependency-free stdio JSON-RPC 2.0 server. Watches the project directory and emits `file_edited` events; exposes `campy_status`, `campy_feed`, `campy_play`, `campy_pet`, `campy_switch` tools that return inline ASCII pet cards. Unlocks Gemini CLI, Codex CLI, and Cursor CLI in one go.
- **Claude Code adapter** (`adapters/claude-code/`) — `post-tool-use`, `pre-tool-use`, `session-start`, `stop` hooks + statusline + `/campy:*` slash commands. Zero token cost for passive reactions.
- **Pi adapter** (`adapters/pi/`) — native in-process TUI widget extension.
- **Gemini adapter** (`adapters/gemini/`) — `gemini-extension.json` + `GEMINI.md` context file.
- **Native installers** — `campy install claude-code | opencode | pi | gemini | codex | cursor | aider`. Each writes the tool's own config format and is idempotent.
- **`campy setup`** — auto-detects installed agents via `core/detect.ts` and wires each natively.
- **`campy attach`** — auto-spawns a side `campy watch` pane in tmux / zellij / wezterm / kitty; graceful manual fallback otherwise.
- **Claude Code marketplace manifest** (`.claude-plugin/marketplace.json`) — installable via `/plugin marketplace add dropdevrahul/campy`.
- **Tests** — 38 unit tests across `core/` (reactions, happiness, store), MCP dispatch, and agent detection.
- **Docs** — `CLAUDE.md` architecture guide and `docs/superpowers/specs/2026-06-13-cli-agent-support-design.md` design spec.

### Changed

- **`.opencode/plugins/`** refactored — `lib/*.ts`, `config.ts`, and `pets/*.ts` are now thin `export *` re-export shims pointing at `core/`. Entry files (`pets.tsx`, `gif-pets.tsx`) unchanged.
- **`package.json`** — renamed to `campy`; added `bin`, `files`, and `exports` (`./core`, `./pi`, `./mcp`); repository/bugs/homepage URLs updated.
- **README** — install instructions cover the two paths that work today (GitHub install via `bun add -g github:dropdevrahul/campy`, and clone + symlink); per-agent install table added.

### Preserved

- **`ghost-pet/`** — legacy standalone Bash plugin for Claude Code is still in the repo for backward compatibility while the new `adapters/claude-code/` adapter rolls out.
