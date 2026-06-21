# Architecture

campy is organized as a portable `core/` library plus per-agent adapters. All pet logic — animations, state, rendering, event handling — lives in `core/`. Adapters are thin wrappers that wire `core/` into each agent's native extension surface.

## Layout

```
campy/
├── core/                    # portable, host-agnostic single source of truth
│   ├── types.ts             # PetState, AnimStep, AnimLayer, PetAnimations, FrameData
│   ├── frame-utils.ts       # HL, pad(), mergeLayers()
│   ├── animation-engine.ts  # AnimationEngine (layered timers, transitions)
│   ├── gif-engine.ts        # GifEngine (linear JSON frame loop)
│   ├── pets/                # cat, hamster, ghost, robot animation data + registry
│   ├── theme.ts             # STATE_COLORS, STATE_ICONS, PET_ICONS, PET_COLORS
│   ├── personality.ts       # IDLE_PHRASES, PET_GREETINGS, PET_PERSONALITY
│   ├── happiness.ts         # clamp, meterBar, INTERACTION_DELTA, DEFAULT_HAPPINESS
│   ├── events.ts            # canonical events, reactionFor(), isCanonicalEvent()
│   ├── store.ts             # state-file bus: readState, writeState, mutateState
│   ├── actions.ts           # store-side actions (applyEvent/Interaction/Sleep/Wake/Switch)
│   ├── detect.ts            # detectAgents() — which agents are installed
│   ├── runtime.ts           # PetRuntime — host-agnostic state machine + animation
│   └── render.ts            # petLines(), statusLine(), petCard(), staticSprite()
├── cli/campy.ts             # the campy binary (shebang bun, no build step)
├── adapters/
│   ├── claude-code/         # hooks + statusline + slash commands
│   ├── pi/                  # in-process TUI widget
│   ├── mcp/server.ts        # MCP stdio server: file-watch + campy_* tools
│   └── gemini/              # gemini-extension.json + GEMINI.md
├── .opencode/plugins/       # thin re-export shims → core/
├── .claude-plugin/          # Claude Code marketplace manifest
├── ghost-pet/               # legacy Bash plugin (kept for back-compat)
└── assets/                  # gifs/ + ascii-frames/
```

## State-file bus

All adapters communicate via a shared state file at `~/.campy/state.json` (or the path in `$CAMPY_STATE`). Short-lived hooks mutate it via the `campy` CLI; long-lived renderers (`campy watch`, the statusline) read it. Writes are atomic — a temp file is written and then renamed.

## AnimationEngine

`AnimationEngine` drives all animations via chained `setTimeout`s — no central clock. Each `AnimLayer` runs on its own timer. Frames carry either a fixed `duration` or a `durationRange` (randomized per cycle for organic motion).

`setState()` plays an optional `TransitionAnim` before settling into the target state's looping layers. `resetToState()` jumps immediately without a transition. Always call `engine.destroy()` before discarding an engine — `switchPet()` does this.

Sprites are fixed-height: every frame is run through `pad(lines, width)` to `HL` (8) rows. Frames that skip this step will misalign during compositing.

## Claude Code adapter

The Claude Code adapter wires three hooks:

- `SessionStart` (one-shot) — fires on session open
- `PostToolUse` (scoped to `Edit|Write|MultiEdit|NotebookEdit|Bash`) — fires on tool use
- `Stop` — fires when the agent stops

Each hook is a short Bash script that calls `campy event <type>` or `campy feed` etc. to mutate state. The statusline is a thin wrapper around `campy statusline`.

## MCP server

`adapters/mcp/server.ts` runs a stdio MCP server. It watches the project directory for file changes and fires `file_edited` events, and exposes five tools (`campy_feed`, `campy_play`, `campy_pet`, `campy_switch`, `campy_status`). Tool responses return the pet as an inline ASCII card. `dispatch()` is unit-tested; `runMcpServer()` wires stdio.

## OpenCode plugins

`.opencode/plugins/` contains two entry files (`pets.tsx` and `gif-pets.tsx`) that are unchanged from the original. All supporting modules under `lib/` and `pets/` are now thin re-export shims pointing at `core/`. `core/` is the only place where sprite data, theme, and personality are defined.

`pets.tsx` registers in the `sidebar_content` slot at `order: 350`. `gif-pets.tsx` is an independent plugin that plays GIF-derived ASCII animations — registered at `order: 360`, toggled via `/gif on|off`.
