# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**campy** ships animated ASCII terminal pets for CLI coding agents. The codebase
is organized as a **portable `core/` + per-agent adapters** architecture:

1. **`core/`** — single source of truth for all pet logic. No host-specific code.
   Modules: `types.ts`, `frame-utils.ts`, `animation-engine.ts`, `gif-engine.ts`,
   `pets/{cat,hamster,ghost,robot}.ts` + `index.ts`, `theme.ts`, `personality.ts`,
   `happiness.ts`, `events.ts`, `store.ts`, `runtime.ts`, `render.ts`.
   `.opencode/plugins/` re-exports all modules from `core/` (thin shims only).
2. **`cli/campy.ts`** — the `campy` binary (runnable via `bun`). Subcommands:
   `watch`, `attach`, `statusline`, `mcp`, `event`, `feed`, `play`, `pet`,
   `sleep`, `wake`, `switch`, `status`, `setup`, `install`.
3. **`adapters/pi/`** — Pi coding-agent adapter (in-process TUI widget).
4. **`adapters/claude-code/`** — Claude Code adapter: short-lived hooks mutate
   the state file via the campy CLI; a `campy watch` pane or the statusline
   renders. Wires only two reactive hooks — `PostToolUse` (scoped to
   `Edit|Write|MultiEdit|NotebookEdit|Bash`) and `Stop` — plus a one-shot
   `SessionStart`; read-only tools never spawn a process. Contains `hooks/`,
   `commands/`, `.claude-plugin/`, and `statusline.sh`.
5. **`adapters/mcp/`** — MCP (stdio) server for agents whose native surface is
   MCP (Gemini CLI, Codex CLI, Cursor CLI). Watches the project dir → `file_edited`
   events, and exposes `campy_*` tools (status/feed/play/pet/switch) returning the
   pet as inline ASCII. `dispatch()` is unit-tested; `runMcpServer()` wires stdio.
6. **`ghost-pet/`** — legacy standalone Bash Claude Code plugin (ghost pet only);
   kept for backward compatibility until the `adapters/claude-code/` adapter
   reaches full parity.

### Installing into an agent

`campy setup` detects installed agents (via `core/detect.ts`) and wires each the
native way; `campy install <agent>` does one. Native mechanism per agent:
**Claude Code** → plugin marketplace (`.claude-plugin/marketplace.json`); the
plugin auto-wires its hooks via `adapters/claude-code/hooks/hooks.json` and its
statusline via the `statusLine` field in `plugin.json` (both
`${CLAUDE_PLUGIN_ROOT}`-relative). Or wire the same hooks + statusline manually
in settings.json (printed by `campy install claude-code`). **OpenCode/Pi** → in-process extension. **Gemini CLI** →
`~/.gemini/extensions/campy/` + `gemini-extension.json`. **Codex CLI** →
`[mcp_servers.campy]` in `~/.codex/config.toml`. **Cursor CLI** → `~/.cursor/mcp.json`.
**Aider** → `.git/hooks/post-commit`. For agents without a widget surface,
`campy attach` spawns a `campy watch` pane (tmux/zellij/wezterm/kitty).

## State-file bus

All adapters communicate via a shared state file (`~/.campy/state.json`, or the
path in `CAMPY_STATE`). Short-lived hooks mutate it; long-lived renderers (`campy
watch`, statusline) read it. Writes are atomic (temp + rename).

## Common Commands

```bash
bun cli/campy.ts watch              # full-screen animated pet (run in a side pane)
bun cli/campy.ts statusline         # print one status line and exit
bun cli/campy.ts event file_edited --file path/to/file.ts
bun cli/campy.ts event command_run --cmd npm
bun cli/campy.ts feed               # happiness +15
bun cli/campy.ts play               # happiness +20
bun cli/campy.ts pet                # happiness +10
bun cli/campy.ts switch hamster     # cat | hamster | ghost | robot
bun cli/campy.ts status             # one-shot state dump
bun cli/campy.ts attach             # spawn a watch pane (tmux/zellij/wezterm/kitty)
bun cli/campy.ts mcp                # run the MCP stdio server (Gemini/Codex/Cursor)
bun cli/campy.ts setup              # detect installed agents and wire each natively
bun cli/campy.ts install <agent>    # pi | claude-code | opencode | gemini | codex | cursor | aider

npm run dev              # opencode --dev — run the OpenCode plugins live
npm run generate:ascii   # node scripts/gif-to-ascii.js — regenerate ASCII frames
npm run extract:frames   # node scripts/extract-frames-to-json.js
node scripts/gif-to-ascii.js --width 28 --height 16 --invert   # tuning flags

bun test                 # run unit tests (tests/)
npm run typecheck        # tsc --noEmit -p tsconfig.json

# ghost-pet (legacy Bash plugin) — requires jq
bash ghost-pet/ghost-pet.sh show     # also: feed | play | pet | sad | reset
claude --plugin-dir ./ghost-pet      # load in Claude Code (legacy)
```

## Architecture

### Top-level layout

```
campy/
├── core/                    # portable, host-agnostic single source of truth
│   ├── types.ts             # PetState, AnimStep, AnimLayer, TransitionAnim, PetAnimations, FrameData
│   ├── frame-utils.ts       # HL, pad(), mergeLayers()
│   ├── animation-engine.ts  # AnimationEngine (layered timers, transitions)
│   ├── gif-engine.ts        # GifEngine (linear JSON frame loop)
│   ├── pets/                # cat, hamster, ghost, robot animation data + PET_ANIMATIONS registry
│   ├── theme.ts             # STATE_COLORS, STATE_ICONS, PET_ICONS, PET_COLORS, ansiFg, ANSI_RESET
│   ├── personality.ts       # IDLE_PHRASES, PET_GREETINGS, PET_PERSONALITY, greeting(), personalityMessage()
│   ├── happiness.ts         # clamp, meterBar, INTERACTION_DELTA, DEFAULT_HAPPINESS
│   ├── events.ts            # canonical events, reactionFor(), isCanonicalEvent()
│   ├── store.ts             # state-file bus: readState, writeState, mutateState (Node-only)
│   ├── actions.ts           # store-side actions (applyEvent/Interaction/Sleep/Wake/Switch)
│   ├── detect.ts            # detectAgents() — which agents are installed (for setup)
│   ├── runtime.ts           # PetRuntime — host-agnostic state machine + animation
│   ├── render.ts            # petLines(), statusLine(), petCard(), staticSprite()
│   └── index.ts             # barrel (store/actions/detect are Node-only, import directly)
├── cli/campy.ts             # the campy binary (shebang bun)
├── adapters/
│   ├── pi/                  # Pi coding-agent: in-process TUI widget
│   ├── mcp/server.ts        # MCP stdio server: file-watch events + campy_* tools
│   ├── gemini/             # gemini-extension.json + GEMINI.md (git-install template)
│   └── claude-code/         # Claude Code: hooks + statusline + slash commands
│       ├── hooks/           # hooks.json + session-start.sh, post-tool-use.sh, stop.sh
│       ├── commands/        # campy.md, feed.md, play.md, pet.md, switch.md
│       ├── .claude-plugin/  # plugin.json
│       └── statusline.sh    # thin wrapper around `campy statusline`
├── .claude-plugin/          # marketplace.json (Claude Code plugin marketplace)
├── tests/                   # bun:test unit tests for core/, mcp dispatch, detect
├── .opencode/plugins/       # thin re-export shims → core/ (pets.tsx + gif-pets.tsx unchanged)
├── ghost-pet/               # legacy Bash plugin (kept for backward compatibility)
└── assets/                  # gifs/ + ascii-frames/
```

### .opencode/plugins/ and core/

`pets.tsx` and `gif-pets.tsx` are unchanged entry files. All supporting modules
(`lib/types.ts`, `lib/frame-utils.ts`, `lib/animation-engine.ts`,
`lib/gif-engine.ts`, `config.ts`, `pets/*.ts`) are now thin re-export shims that
point at the corresponding `core/` module. `core/` is the only place where sprite
data, theme, and personality are defined.

`pets.tsx` and `gif-pets.tsx` must stay at these paths and keep their default
exports (`{ id, tui }`) — `tui.json` and `package.json#main` reference them.

### OpenCode pets plugin (`pets.tsx` + `lib/` + `pets/` + `config.ts`)

The main plugin. The engine, sprite data, theme, and personality are split into
modules; `pets.tsx` is the component and wiring. Key concepts:

- **Layered animation model.** A pet state (one of the 7 `PetState`s: idle,
  happy, sleeping, eating, playing, excited, sad) is an array of `AnimLayer`s.
  Each layer independently steps through its `AnimStep` frames on its own timer.
  `mergeLayers()` composites layers per-row, with non-space characters in later
  layers overwriting earlier ones. This is how blinking works: `idle` has a
  static `body` layer plus a separately-timed `eyes` layer.
- **`AnimationEngine`** drives everything via chained `setTimeout`s (no central
  clock). Steps carry either a fixed `duration` or a `durationRange` (randomized
  per cycle for organic motion). `setState()` plays an optional `TransitionAnim`
  before settling into the target state's looping layers; `resetToState()` jumps
  immediately. Always call `engine.destroy()` before discarding an engine —
  `switchPet()` does this.
- **Sprites are fixed-height.** Every frame is run through `pad(lines, width)` to
  `HL` (8) rows. New frames must use `pad(...)` or compositing/rendering misaligns.
- **Event → state mapping** lives in `onMount`. OpenCode events
  (`message.part.delta`, `session.error`, `session.idle`, `file.edited`,
  `command.executed`, `tui.prompt.append`) call `overrideState(state, duration,
  speech)`, which interrupts the random idle-state scheduler, then returns to
  idle. Speech bubbles pull from `PET_PERSONALITY[petType][state]`.
- **Rendering** is the `sidebar_content` slot (registered at `order: 350`).
  Slash commands are registered via `api.command.register` (`/pet feed`, `/pet
  cat`, etc.).

Adding a pet = define a `PetAnimations` object (like `catAnim`) in a new
`pets/<name>.ts`, register it in the `PET_ANIMATIONS` map in `pets/index.ts`
(which `getCurrentAnimations` reads), and add entries to `PET_ICONS`,
`PET_GREETINGS`, and `PET_PERSONALITY` in `config.ts`.

### GIF player (`gif-pets.tsx` + `lib/gif-engine.ts`)

A second, independent sidebar renderer — distinct from the hand-authored
`pets.tsx`. It plays GIF-derived ASCII animations on demand. Hidden by default;
toggled via slash commands `/gif on | off | cat | ghost | robot | help`.
Registered as its own plugin (`opencode-gif-pets`, sidebar slot `order: 360`).

- `gif-pets.tsx` statically imports `assets/ascii-frames/{cat,ghost,robot}.json`
  and plays them with `GifEngine` (`lib/gif-engine.ts`) — a simple linear frame
  loop, much simpler than the layered `AnimationEngine`.
- The JSON imports live in the entry file (`gif-pets.tsx`), so the
  `../../assets/ascii-frames/*.json` relative paths are correct from there.

### GIF pipeline (`scripts/gif-to-ascii.js`)

The build step that produces the JSON the GIF player consumes.

- `scripts/gif-to-ascii.js` reads every `assets/gifs/*.gif`, and for each emits
  `assets/ascii-frames/<name>.json` of shape `{ frames: string[][], durations:
  number[] }`. The pet name is the part of the filename before the first `-`.
- The converter auto-detects the background color from edge pixels, computes a
  foreground bounding box to crop, auto-detects whether to invert the luminance
  ramp (`RAMP = ' .:!*#@'`), and de-dupes consecutive identical frames (folding
  their delays together).

To add/refresh a GIF pet: drop the `.gif` in `assets/gifs/`, run
`npm run generate:ascii`, then add the JSON import + `petData` entry in
`gif-pets.tsx`.

### ghost-pet (`ghost-pet/`)

A self-contained Claude Code plugin. `ghost-pet.sh` is a Bash state machine that
persists `{mood, happiness, last_change}` to `/tmp/ghost-pet.json` (via `jq`) and
renders ASCII via heredocs. `hooks/post-tool-use.sh` and
`hooks/post-tool-use-failure.sh` shell out to it to nudge the mood happy/sad on
tool results. Slash commands are the markdown files in `commands/` (`/ghost-pet:*`).

## Notes

- `.opencode/themes/pets-theme.json` and the Dracula-style hex colors in the
  plugins (`STATE_COLORS`, `PET_COLORS`) define the palette.
- `docs/superpowers/specs/` holds design specs — the GIF pipeline, an
  in-progress cursor-pets (VS Code/WebView) design, and a multi-agent
  CLI-support design (`2026-06-13-cli-agent-support-design.md`) that proposes
  extracting a portable `core/` + per-agent adapters. Useful background, not
  authoritative on current code.
- AGENTS.md references several docs (SPEC.md, COMMANDS.md, etc.) that do not
  exist in the repo; ignore those pointers.
