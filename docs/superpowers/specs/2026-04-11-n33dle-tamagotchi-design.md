# N33DLE — Tamagotchi-Inspired Claude Code Pet Design

## Overview

N33DLE is a Tamagotchi-inspired virtual pet for Claude Code. It lives in your terminal, reacts to your coding activity via hooks, and demands care via attention beeps. It evolves from egg to baby to adult based on how well you treat it.

## Core Mechanics

### 3 Care Meters

- **Hunger** (0-100): Depletes -1 every 5 min. Feed with `/n33dle:feed` (+15). Low hunger makes pet sad.
- **Happiness** (0-100): Depletes -1 every 10 min. Boost with `/n33dle:play` (+20), `/n33dle:pet` (+10). Successful tool use gives +2.
- **Discipline** (0-100): Increases +10 when you respond to attention beeps within 2 min (via `/n33dle:pet` or `/n33dle:scold`). Decreases -5 when beeps are ignored.

### 3 Evolution Stages

- **Egg** (first 30 min after first use): Just an egg, occasionally wobbling. Limited interactions.
- **Baby** (30 min - 2 hrs of active use): Small round blob with dot eyes. Basic moods (happy, sad, hungry, sleeping).
- **Adult** (2+ hrs of active use): Full blob with expressive eyes, antenna nub, rich mood animations.

Evolution is based on `total_care_quality` = running average of all three meters. Higher care = faster evolution.

### Attention Beeps

Every 15-20 min of idle time, N33DLE sends an attention beep via the `Notification` hook. This prints a call for attention:

```
🔍 N33DLE needs attention! Try /n33dle:pet or /n33dle:feed
```

Responding within 2 min increases discipline (+10). Ignoring it decreases discipline (-5).

### Mood System

Pet mood is derived from the three meters:

| Mood | Condition |
|------|-----------|
| Happy | Happiness > 70, Hunger > 50 |
| Sad | Happiness < 30 |
| Hungry | Hunger < 30 |
| Excited | Happiness > 90 after tool success |
| Sleeping | No interaction for 30+ min |
| Disciplined | Discipline > 80 |

## ASCII Art — Tamagotchi LCD Frame

All renders show the pet inside an iconic LCD screen frame. Width: 17 chars, consistent across all stages.

### Egg Stage

```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │    ○    │  ║
║  │         │  ║
║  ╰─────────╯  ║
║ ♥░░░░░░░ 💧░░ ║
║ ⚡░░░░░░░      ║
╚═══════════════╝
```

Egg wobble variant (frame 2):
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │   (○)   │  ║
║  │         │  ║
║  ╰─────────╯  ║
║ ♥░░░░░░░ 💧░░ ║
║ ⚡░░░░░░░      ║
╚═══════════════╝
```

### Baby Stage

Idle:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │   ● ●   │  ║
║  │   ___   │  ║
║  ╰─────────╯  ║
║ ♥███░░░░ 💧██░ ║
║ ⚡██░░░░      ║
╚═══════════════╝
```

Sad:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │   ◡ ◡   │  ║
║  │   ───   │  ║
║  ╰─────────╯  ║
║ ♥██░░░░░ 💧░░░ ║
║ ⚡█░░░░░░      ║
╚═══════════════╝
```

Eating:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │   ● ●   │  ║
║  │   ○▽○   │  ║
║  ╰─────────╯  ║
║ ♥█████░░ 💧████░ ║
║ ⚡███░░░░      ║
╚═══════════════╝
```

### Adult Stage

Happy:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │  ◎  ◎  │  ║
║  │  ╲▽╱   │  ║
║  │   ♪     │  ║
║  ╰─────────╯  ║
║ ♥██████░ 💧████░ ║
║ ⚡████░░      ║
╚═══════════════╝
```

Sad:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │  ◡  ◡  │  ║
║  │  ╲﹏╱   │  ║
║  ╰─────────╯  ║
║ ♥██░░░░░ 💧░░░ ║
║ ⚡████░░      ║
╚═══════════════╝
```

Excited (after tool success):
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │  ^  ^  │  ║
║  │  ╲▽╱♪  │  ║
║  ╰─────────╯  ║
║ ♥████████ 💧█████ ║
║ ⚡█████░      ║
╚═══════════════╝
```

Hungry:
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │  ◎  ◎  │  ║
║  │   ○○    │  ║
║  ╰─────────╯  ║
║ ♥█░░░░░░ 💧░░░░ ║
║ ⚡████░░      ║
╚═══════════════╝
```

Sleeping (idle 30+ min):
```
╔═══════════════╗
║    N33DLE      ║
║  ╭─────────╮  ║
║  │  -  -  │  ║
║  │   zzz   │  ║
║  ╰─────────╯  ║
║ ♥██████░ 💧████░ ║
║ ⚡████░░      ║
╚═══════════════╝
```

## Meter Rendering

Each meter uses 8-char block bars:
- `█` = 1 unit, `░` = empty
- Happiness: `♥████░░░░` (4/8 full)
- Hunger: `💧██████░░` (6/8 full)
- Discipline: `⚡██░░░░░░` (2/8 full)

Meter values are mapped from 0-100 to 0-8 blocks.

## Slash Commands

| Command | Action | Effect |
|---------|--------|--------|
| `/n33dle` | Show full LCD status | Renders current pet state |
| `/n33dle:feed` | Feed N33DLE | +15 hunger, shows eating animation |
| `/n33dle:play` | Play with N33DLE | +20 happiness |
| `/n33dle:pet` | Pet N33DLE | +10 happiness, +5 discipline |
| `/n33dle:scold` | Scold N33DLE | +10 discipline (for attention beeps) |

## Hooks

| Hook Event | Script | Effect |
|------------|--------|--------|
| `PostToolUse` | `post-tool-use.sh` | +2 happiness, set mood to excited briefly |
| `PostToolUseFailure` | `post-tool-use-failure.sh` | -5 happiness |
| `Notification` (idle_prompt) | `notification-idle.sh` | Trigger attention beep, decay meters |

## State File

Location: `/tmp/n33dle-state.json`

```json
{
  "stage": "baby",
  "hunger": 70,
  "happiness": 80,
  "discipline": 50,
  "born": 1712836800,
  "last_interaction": 1712840400,
  "last_decay": 1712840400,
  "total_care_quality": 65,
  "mood": "happy"
}
```

- `born`: Unix timestamp of when the pet was hatched (first `/n33dle` command)
- `last_interaction`: Timestamp of last user interaction
- `last_decay`: Timestamp of last meter decay calculation
- `total_care_quality`: Running average of (hunger + happiness + discipline) / 3
- `mood`: Current derived mood

### Evolution Logic

- Egg → Baby: 30 minutes after `born`
- Baby → Adult: When `total_care_quality` > 50 AND 2+ hours since `born`
- Meter decay is calculated on read, not on a timer (lazy evaluation)

## Plugin Structure

```
n33dle/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── n33dle.md
│   ├── n33dle-feed.md
│   ├── n33dle-play.md
│   ├── n33dle-pet.md
│   └── n33dle-scold.md
├── n33dle.sh                # Core: state machine + ASCII renderer + hook handlers
└── hooks/
    ├── post-tool-use.sh     # +2 happiness on success
    ├── post-tool-use-failure.sh  # -5 happiness on failure
    └── notification-idle.sh # Attention beep + meter decay
```

### n33dle.sh

Single bash script that handles everything:
- State management (read/write JSON to `/tmp/n33dle-state.json`)
- Meter decay calculation (lazy, computed on read)
- Mood derivation from meters
- ASCII art rendering for all stages+moods
- Hook handlers (`happy`, `sad`, `beep` subcommands)
- Command handlers (`show`, `feed`, `play`, `pet`, `scold` subcommands)

Dependencies: Only `bash`, `jq` (for JSON), standard UNIX utils. No Node.js required.

### Command Files

Each `/n33dle:*` command is a markdown file that calls `n33dle.sh` with the appropriate subcommand:

```markdown
---
description: Feed N33DLE your Tamagotchi pet
---
Run: `./n33dle.sh feed`
```

### Hook Scripts

Each hook is a thin wrapper that calls `n33dle.sh`:

```bash
#!/bin/bash
# post-tool-use.sh
DIR="$(cd "$(dirname "$0")/.." && pwd)"
bash "$DIR/n33dle.sh" happy
```

## Not in Scope (YAGNI)

- Sound effects
- Multiple pets
- Pet death (meters bottom at 0, pet is just very sad)
- Persistence across reboots (state is in /tmp)
- MCP server for state
- Animated transitions (terminal can't animate)
- Evolution beyond adult stage
- Pet accessories/cosmetics