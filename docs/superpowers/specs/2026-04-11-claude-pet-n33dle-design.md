# N33DLE Pet Design — "Claude" Pet Type

## Overview

Add a new pet type called `claude` (display name: N33DLE) to the OpenCode Animated Pets Plugin. N33DLE is a curious tinkerer critter with robot vibes — wide scanning eyes, a twitchy antenna, and a scavenger personality inspired by WALL-E's spirit of curiosity (without being a direct reference).

## Pet Identity

- **Type key**: `"claude"`
- **Default name**: N33DLE
- **Emoji icon**: `\|/` (antenna) — rendered as the antenna glyph in the sidebar header
- **Personality**: Curious tinkerer. Wide eyes always scanning. Antenna twitching. Perks up at activity, collects interesting bits, droops when sad or idle too long.

## ASCII Art — 7 States, 2 Frames Each

All frames padded to width 14, height 8 (following `HL = 8` convention).

### idle
```
Frame 1:              Frame 2:
   \|/                   /|/
  ( o o )               ( o o )
   |   |                 |   |
  _/   \_               _/   \_
```

### happy
```
Frame 1:              Frame 2:
   \|/                   \|/
  ( ^ ^ )               ( ^ω^ )
   | ♥ |                 | ♥ |
  _/   \_               _/ \_/ \_
```

### sleeping
```
Frame 1:              Frame 2:
   \|/                   \|/
  ( - - )               ( - - )
   | z |                 | Z |
  _/   \_               _/   \_
                         zzz
```

### eating
```
Frame 1:              Frame 2:
   \|/                   \|/
  ( o nom )             ( nom o )
   |   |                 | ♥ |
  _/   \_               _/   \_
```

### playing
```
Frame 1:              Frame 2:
   \|/    *              /|\
  ( ^ ^ )       *      ( ^ ^ )
   | ♥ |                 | ♥ |
  _/ \_/ \_             _/   \_
```

### excited
```
Frame 1:              Frame 2:
   \|/                   /|\
  ( O O )               ( ω ω )
   | ! |                 | ! |
  _/ \_/ \_             _/ \_/ \_
```

### sad
```
Frame 1:              Frame 2:
   \|/                   \|/
  ( T T )               ( T T )
   |   |                 |   |
  _/   \_               _/   \_
                         ;_;
```

## Color Scheme

Uses existing `STATE_COLORS` — no pet-specific overrides for now. The green `#50fa7b` on happy state gives the "new life / curiosity" feel aligned with WALL-E's plant moment.

## State Machine Integration

Follows the existing 7-state system (`PetState = "idle" | "happy" | "sleeping" | "eating" | "playing" | "excited" | "sad"`):

- `scheduleNextState()` — random state transitions every 10-30s
- `overrideState(s, duration)` — temporary state from actions (feed, play, pet)
- Recovery back to idle after duration expires

## Per-Pet Icon Map

Add a `PET_ICONS` map so the sidebar header shows the correct icon per pet type:

```typescript
const PET_ICONS: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  hamster: "🐹",
  ghost: "👻",
  corgi: "🐶",
  claude: "🔍",
}
```

N33DLE gets 🔍 (magnifying glass) — the curious tinkerer always searching.

## Slash Commands

Add `/pet claude` command that calls `switchPet("claude")`.

## Configuration

Add N33DLE to `tui.json` example configs alongside existing pet examples.

## Implementation Scope (Simple First Pass)

1. Add `claudeFrames: Record<PetState, string[][]>` to `pets.tsx`
2. Add `claude` to `allPetFrames` map
3. Add `PET_ICONS` map, update render to use it
4. Add `/pet claude` command
5. No special behaviors beyond standard state machine — just frames + command

## Future Enhancements (Out of Scope)

- Per-pet color overrides (N33DLE green theme)
- Event-driven state transitions (react to tool execution, errors)
- Scavenger collectibles (N33DLE "finds" things)
- Custom cute speech bubbles