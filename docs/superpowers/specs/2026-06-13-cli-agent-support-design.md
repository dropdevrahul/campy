# Design: Multi-Agent Support for CLI Coding Agents

**Date:** 2026-06-13
**Status:** Phases 1–5 implemented — core extraction, runtime+store, CLI+watcher, Pi adapter, and Claude Code adapter are all complete and verified. `.opencode/plugins/` now re-exports `core/` (no duplicated data). The MCP adapter (`campy mcp`, for Gemini/Codex/Cursor) and native per-agent installers (`campy setup` / `campy install`) and the `campy attach` pane helper have also landed. The git-hook/file-watch fallback for Aider ships via `campy install aider`. See **Installation & Distribution** below.

## Overview

Today campy ships two unrelated implementations of the same idea: a rich
OpenCode TUI plugin (`.opencode/plugins/*.tsx`) and a standalone Bash plugin for
Claude Code (`ghost-pet/`). Each re-implements the pet state machine, sprite
rendering, and event reactions from scratch. Adding a third agent (Aider, Gemini
CLI, Codex CLI, Cursor CLI, …) currently means a third full rewrite.

This spec defines a **portable core + thin per-agent adapters** architecture so a
single source of truth drives a pet across every major CLI coding agent. The core
owns animation, state, happiness, and personality; each adapter owns only the
glue to one host: how it learns about coding events, how it renders, and how it
exposes commands.

This complements the IDE-extension work in
`2026-05-03-cursor-pets-design.md` (which targets a GUI WebView). CLI agents
mostly lack a persistent custom sidebar, so the hard problem here is the
**rendering surface**, addressed in its own section below.

## Goals

- One shared core (state machine, animation engine, sprite/personality data)
  reused by every integration. No more per-agent rewrites of game logic.
- A documented adapter contract: implement ~4 functions to add a new agent.
- First-class support for the major CLI agents listed below, each installable
  with a single documented command.
- Reuse the existing `assets/ascii-frames/*.json` and the hand-authored
  animation data as the canonical sprite source.

## Non-Goals

- Replacing the Cursor/VS Code WebView extension (covered by its own spec).
- A networked or multi-user pet. State stays local.
- Shipping a binary for every platform; the core targets Node and POSIX shell,
  matching what these agents already require.

## Target Agents

| Agent | Runtime | Extension mechanism | Event source | Render surface |
|-------|---------|---------------------|--------------|----------------|
| **Claude Code** | Node CLI | Plugins, hooks, slash commands, statusline, MCP | `PreToolUse`/`PostToolUse`/`Stop`/`SessionStart` hooks | statusline + hook stdout + optional watcher pane |
| **OpenCode** | Node/Bun TUI | TUI plugins (`@opentui/solid`) | `api.event.on(...)` | native sidebar slot (already built) |
| **Gemini CLI** | Node CLI | Extensions + MCP servers | tool-call lifecycle via MCP / extension hooks | statusline / printed lines |
| **Aider** | Python CLI | No plugin API; wrap via `--aiderignore`-style config + git hooks | git commit hooks, file-watch | watcher pane / statusline shim |
| **Codex CLI** | Node CLI | MCP + config hooks | tool lifecycle | statusline / watcher pane |
| **Cursor CLI** (`cursor-agent`) | Node CLI | MCP, rules | tool lifecycle via MCP | watcher pane |

> Exact hook names and capabilities for non-Claude/OpenCode agents are validated
> during implementation; the table reflects the integration *strategy* per agent,
> not a guarantee of a specific API. The adapter contract is deliberately small so
> a partial integration (e.g. statusline-only, no live events) is still useful.

Two capabilities vary per agent and drive the adapter design:

1. **Event delivery** — does the agent invoke our code on tool use / file edit /
   idle? (Claude Code & OpenCode: yes, richly. Others: via MCP tool-call
   lifecycle or git/file-watch fallbacks.)
2. **Render surface** — does it have a place to draw a multi-line sprite? (Only
   OpenCode's TUI does natively. Everything else uses statusline, hook stdout, or
   a separate watcher process — see Rendering Surfaces.)

## Architecture

### Layering

```
┌──────────────────────────────────────────────────────────────┐
│  core/  (portable, no host APIs, no I/O side effects)         │
│  ├── types.ts            PetState, AnimStep, AnimLayer, ...    │
│  ├── frame-utils.ts      pad(), mergeLayers(), HL             │
│  ├── animation-engine.ts AnimationEngine (layered timers)     │
│  ├── gif-engine.ts       GifEngine (linear JSON frame loop)   │
│  ├── pets/               cat, hamster, ghost, robot data + registry │
│  ├── personality.ts      greetings, idle phrases, per-state lines │
│  ├── theme.ts            STATE_COLORS, *_ICONS, PET_COLORS     │
│  ├── happiness.ts        clamp + happiness mutations           │
│  └── store.ts            load/save state to a state file       │
│                                                                │
│  Pure functions + classes. Knows nothing about any agent.     │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │ imported by
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  adapters/  (one per host; the only host-specific code)       │
│  ├── opencode/   TUI sidebar slot + api.event.on (existing)   │
│  ├── claude-code/ hooks + statusline + slash commands         │
│  ├── gemini/     MCP server + statusline                     │
│  ├── aider/      git-hook shim + watcher                     │
│  └── ... one dir per agent                                    │
└──────────────────────────────────────────────────────────────┘
```

The refactor that extracts `core/` from today's `.opencode/plugins/pets.tsx`
(splitting engine, sprite data, theme, personality into modules) is a
prerequisite and is being done in parallel. This spec assumes that landed: the
OpenCode plugin becomes the first consumer of `core/`, proving the boundary.

### The Adapter Contract

Every adapter implements the same small interface. The core exposes a
host-agnostic `PetRuntime` that an adapter wires to its host:

```ts
interface AgentAdapter {
  // Called once on startup. Adapter subscribes host events and forwards them.
  init(runtime: PetRuntime): void | Promise<void>

  // How this host shows the pet. Exactly one is implemented per adapter:
  //  - "sidebar":   adapter renders multi-line sprite itself (OpenCode)
  //  - "statusline":core asks for a single compact line each tick
  //  - "stdout":    core prints frames to a controlled stream/pane
  surface: RenderSurface

  // Map host commands → runtime actions (feed/play/pet/switch/...).
  registerCommands(runtime: PetRuntime): void
}
```

`PetRuntime` (in core) owns the engine, the current pet/state/happiness, the
idle scheduler, and `overrideState(state, duration, speech)` — exactly the logic
that lives in `pets.tsx`'s `PetsPlugin` today, lifted out of the Solid component
so it has no UI dependency. The Solid component becomes a thin view that observes
the runtime.

### Shared Event Vocabulary

Adapters translate host events into a fixed set of canonical events; the core
maps those to state overrides (same semantics as the OpenCode plugin today):

| Canonical event | Pet reaction (state / speech)        | Host examples |
|-----------------|--------------------------------------|---------------|
| `thinking`      | excited / "Thinking..."              | Claude `PreToolUse` start, OpenCode `message.part.delta` |
| `file_edited`   | eating / "Edited {file}!"            | `PostToolUse` (Edit/Write), OpenCode `file.edited`, git diff |
| `command_run`   | happy / "Ran {cmd}!"                 | `PostToolUse` (Bash), OpenCode `command.executed` |
| `error`         | sad / "Error! Let me help..."        | tool failure hook, OpenCode `session.error` |
| `idle`          | idle / random phrase                 | `Stop`/`SessionEnd`, OpenCode `session.idle`, watcher timeout |
| `attached`      | happy / "I'm here!"                  | `SessionStart`, OpenCode `tui.prompt.append` |

Adding an agent = emit these six events from whatever the host provides, and
pick a render surface. Nothing in `core/` changes.

## Rendering Surfaces

This is the part that differs most from the OpenCode/Cursor work, because most
CLI agents have no persistent panel for a multi-line sprite.

### 1. Native sidebar (OpenCode)

Already implemented. The adapter renders the composited sprite into the TUI
sidebar slot. Full multi-line animation, speech bubble, status row.

### 2. Statusline (Claude Code, Gemini CLI, others with a status line)

The agent calls a script we provide and prints its stdout as a one-line status.
The core exposes `runtime.statusLine()` returning a single compact line:

```
🐱 happy 😊  ♥80%   ~(=^･ω･^=)
```

A statusline can't animate at sprite resolution, but it can:
- show pet emoji, mood emoji, happiness meter, and a tiny one-line face;
- advance a 2–3 frame "kaomoji" cycle on each invocation (the agent re-runs the
  statusline script frequently), giving cheap motion;
- surface the latest speech bubble inline.

Claude Code: configured via `statusLine` in settings; the script reads the
shared state file and prints one line. No daemon required.

### 3. Watcher pane / stdout (Aider, Codex CLI, Cursor CLI, or "I want the full pet")

For agents without a sidebar or statusline rich enough to satisfy, ship a
standalone renderer the user runs in a second pane (tmux split, iTerm pane, or
separate terminal):

```bash
campy watch            # full-screen animated pet, follows the shared state file
```

The watcher reads the same `core/store.ts` state file (updated by the adapter's
event hooks) and runs the real `AnimationEngine` at full fidelity — identical to
the OpenCode sidebar, just hosted in its own pane. This decouples *rendering*
(continuous) from *events* (sporadic hook invocations), which is the key trick:
hooks are short-lived processes that only mutate state; the watcher is the
long-lived process that animates.

### State file as the bus

```
adapter hook (short-lived)  ──writes──▶  state file  ◀──reads──  renderer (long-lived)
   PostToolUse → file_edited            ~/.campy/state.json        watcher / statusline / sidebar
```

`store.ts` defines the schema (superset of today's `ghost-pet.json`):

```json
{
  "pet": "cat",
  "mood": "eating",
  "happiness": 80,
  "speech": "Edited engine.ts!",
  "speech_until": 1750000000000,
  "frame": 3,
  "updated_at": 1749999996000
}
```

Writes are atomic (write temp + rename) to avoid torn reads when a hook and the
watcher race. Default path `~/.campy/state.json`, overridable via `CAMPY_STATE`
so multiple repos/sessions can run independent pets.

## Per-Agent Integration

### Claude Code

- **Events:** hooks in `.claude/settings.json` (or a plugin's `hooks/`):
  `PreToolUse` → `thinking`, `PostToolUse` → `file_edited`/`command_run` (branch
  on tool name), a failing tool → `error`, `SessionStart` → `attached`, `Stop` →
  `idle`. Each hook is a tiny script that calls `campy event <name>` which mutates
  the state file via `core/store.ts`. This generalizes today's
  `ghost-pet/hooks/*.sh`.
- **Render:** statusline script for the always-on glance; `campy watch` for the
  full pet.
- **Commands:** slash commands in `commands/` (`/campy:feed`, `/campy:play`,
  `/campy:pet`, `/campy:cat` …) shelling to `campy <cmd>` — replacing the
  ghost-only commands with the full pet set.
- **Packaging:** a proper Claude Code plugin (`.claude-plugin/plugin.json`) that
  bundles hooks, commands, the statusline, and the `campy` CLI.

### OpenCode

- Already native. Refactored to consume `core/` and emit the canonical events
  from `api.event.on`. The sidebar adapter keeps full-fidelity rendering and is
  the reference implementation of the "sidebar" surface.

### Gemini CLI / Codex CLI / Cursor CLI

- **Events:** expose campy as an MCP server (or use the agent's config hooks
  where available) so tool-call lifecycle maps to `thinking`/`command_run`/
  `error`. Where no lifecycle is exposed, fall back to the file-watch detector
  below.
- **Render:** statusline if the agent has one, otherwise `campy watch`.

### Aider (and any agent with no plugin API)

- **Events:** Aider auto-commits; use a git `post-commit` hook plus a file
  watcher (`chokidar`/`fswatch` on the repo) to synthesize `file_edited` and
  `command_run`. Idle detection from "no writes for N seconds."
- **Render:** `campy watch` in a side pane.
- This "zero-API fallback" (git hook + file watch + watcher pane) is the lowest
  common denominator and works for essentially any tool.

## CLI Surface

A single `campy` binary (Node, shipped via npx/npm) backs every adapter:

```bash
campy watch                 # long-lived animated renderer (reads state file)
campy statusline            # print one status line and exit (for statuslines)
campy event <name> [--file f] [--cmd c]   # mutate state from a hook
campy feed | play | pet | sleep | wake    # interactions (mutate happiness/mood)
campy switch <pet>          # cat | hamster | ghost | robot
campy install <agent>       # scaffold hooks/commands/config for an agent
campy status                # one-shot state dump
```

`campy install <agent>` writes the right glue for the target (Claude Code
settings hooks + slash commands, an MCP entry, or a git hook + watcher snippet)
and prints the one line the user must add to their agent config.

## File Structure

```
campy/
├── core/                          # NEW — portable, host-agnostic
│   ├── types.ts
│   ├── frame-utils.ts
│   ├── animation-engine.ts
│   ├── gif-engine.ts
│   ├── pets/{cat,hamster,ghost,robot}.ts + index.ts
│   ├── personality.ts
│   ├── theme.ts
│   ├── happiness.ts
│   ├── store.ts                   # state-file schema + atomic read/write
│   └── runtime.ts                 # PetRuntime: engine + scheduler + overrides
├── adapters/
│   ├── opencode/                  # consumes core/, renders TUI sidebar
│   ├── claude-code/               # hooks + statusline + slash commands
│   ├── gemini/                    # MCP server + statusline
│   └── aider/                     # git hook + watcher
├── cli/
│   └── campy.ts                   # the `campy` binary (watch/statusline/event/...)
├── assets/                        # unchanged: gifs/ + ascii-frames/
├── scripts/                       # unchanged: gif-to-ascii pipeline
└── .opencode/plugins/*.tsx        # thin entry files importing adapters/opencode
```

`ghost-pet/` is retired once the Claude Code adapter reaches parity (it becomes a
special case: the ghost pet under the general system). Keep it until then for
backward compatibility.

## State Persistence

- Single source of truth: `~/.campy/state.json` (override `CAMPY_STATE`).
- Atomic writes (temp + rename); readers tolerate a missing/partial file by
  falling back to defaults (`pet: cat`, `happiness: 80`, `mood: idle`).
- Happiness mutations and clamping live in `core/happiness.ts`, shared by every
  interaction path (today duplicated between `pets.tsx` and `ghost-pet.sh`).

## Phased Rollout

1. **Core extraction** (in progress, parallel refactor): split `pets.tsx` into
   `core/` modules; OpenCode adapter consumes them. No behavior change.
2. **Runtime + store**: lift `PetRuntime` and the state-file bus out of the Solid
   component. OpenCode keeps working through it.
3. **`campy` CLI + watcher**: full-fidelity renderer driven by the state file.
4. **Claude Code adapter**: hooks + statusline + slash commands + `campy
   install claude-code`; reach parity with and replace `ghost-pet/`.
5. **Zero-API fallback**: git hook + file-watch detector → enables Aider and any
   other agent immediately.
6. **MCP adapter**: Gemini CLI / Codex CLI / Cursor CLI via an MCP server.

Each phase is independently shippable; after phase 3 every new agent is "emit six
events + pick a surface."

## Installation & Distribution

The install story has two halves everywhere: **wire the event source** the native
way, and **point at a render surface**. For agents without a widget, the surface
is always a `campy watch` pane (`campy attach` spawns one in tmux/zellij/wezterm/
kitty). `campy setup` auto-detects installed agents (`core/detect.ts`) and runs
each native installer; `campy install <agent>` does one.

| Agent | Native install mechanism | What campy writes / ships | Render surface |
|-------|--------------------------|---------------------------|----------------|
| **Claude Code** | Plugin marketplace: `/plugin marketplace add dropdevrahul/campy` → `/plugin install campy` (or settings.json hooks) | `.claude-plugin/marketplace.json` → `adapters/claude-code` plugin (hooks + statusline + commands) | statusline + `watch` pane |
| **OpenCode** | `"plugin"` entry in `opencode.json`/`tui.json` (npm pkg or path) | in-process plugin (`.opencode/plugins`) | native sidebar |
| **Pi** | `~/.pi/agent/extensions/campy.ts` (or `pi -e`) | re-export shim → `adapters/pi` | native TUI widget |
| **Gemini CLI** | `~/.gemini/extensions/campy/` + `gemini-extension.json`; or `gemini extensions install <git>` | extension manifest registering the `campy mcp` server + `GEMINI.md` | `watch` pane |
| **Codex CLI** | `[mcp_servers.campy]` in `~/.codex/config.toml` | MCP server entry | `watch` pane |
| **Cursor CLI** | `~/.cursor/mcp.json` | MCP server entry | `watch` pane |
| **Aider** | `.git/hooks/post-commit` (Aider auto-commits) | hook emitting `campy event file_edited` | `watch` pane |

**MCP adapter (`campy mcp`).** A dependency-free stdio JSON-RPC server
(`adapters/mcp/server.ts`). Because MCP can't observe the host's *own* tools, the
server (a) watches the project dir and emits `file_edited` events into the state
file, and (b) exposes `campy_status`/`campy_feed`/`campy_play`/`campy_pet`/
`campy_switch` tools that return the pet as inline ASCII so the agent can show it
in chat. One server backs Gemini, Codex, and Cursor.

**npm.** Publishing `campy` (bin + `core`/`pi`/`mcp` exports) is the distribution
backbone — every native installer bottoms out in `npx campy …` or a local `bun`
invocation. A Claude Code marketplace repo and a Gemini extension repo wrap the
same package in each ecosystem's native format.

## Dependencies

- **Runtime (new):** a file watcher for the zero-API fallback (`chokidar` or the
  platform `fswatch`); an MCP SDK for the MCP adapter. Core itself stays
  dependency-light (Node stdlib + the existing GIF assets).
- **Per-agent:** nothing the agents don't already require (Claude Code hooks,
  OpenCode plugin host, MCP transport).

## Testing

- **Core**: unit-test the state machine, happiness clamping, `mergeLayers`/`pad`,
  and the canonical-event → state-override mapping (pure functions, no host).
- **Store**: concurrent write/read test (hook racing the watcher) for atomicity.
- **Adapters**: golden-file the statusline output; smoke-test `campy install
  <agent>` scaffolding into a temp dir.
- **OpenCode parity**: confirm the refactored, core-backed plugin renders
  byte-identically to today (same sprites, timings, colors, events).
