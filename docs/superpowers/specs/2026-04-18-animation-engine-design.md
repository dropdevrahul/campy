# Animation Engine Design for OpenCode Pets

## Summary

Replace the current fixed 2-frame toggle animation system with a Frame Sequencer engine that supports multi-step animation sequences, overlay layers (sub-animations), and state transitions.

## Current State

Each pet state has exactly 2 ASCII art frames that toggle at a fixed `setInterval`. The recent variable-blink change uses `setTimeout` with per-tick delays based on odd/even frame index. This is fragile and doesn't generalize to richer animations.

## Core Types

```ts
type AnimStep = {
  frame: string[]    // ASCII art lines for this step
  duration: number   // milliseconds to display this step
}

type AnimLayer = {
  id: string         // unique layer name (e.g. "body", "eyes", "tail")
  steps: AnimStep[]  // ordered sequence of frames and durations
  loop: boolean      // true = repeat forever; false = play once then hold last frame
}

type TransitionAnim = {
  from: PetState     // source state
  to: PetState       // target state
  steps: AnimStep[]  // plays once during transition (no loop)
}

type PetAnimations = {
  states: Record<PetState, AnimLayer[]>        // each state has 1+ layers
  transitions?: TransitionAnim[]                // optional state-change animations
}
```

## Multi-Step Sequences

Each `AnimLayer.steps` is an ordered list of `{frame, duration}` entries. The engine steps through each, waits for `duration` ms, then advances to the next step.

Example - cat idle blink:
```ts
{ id: "eyes", steps: [
  { frame: eyesOpen,    duration: 3000 },
  { frame: eyesClosed, duration: 150 },
  { frame: eyesHalf,   duration: 80 },
  { frame: eyesClosed, duration: 150 },
], loop: true }
```

For variable duration (e.g. random 2-4s hold), the engine supports a `durationRange` in place of `duration`:
```ts
type AnimStep = {
  frame: string[]
  duration?: number            // fixed duration
  durationRange?: [number, number]  // [min, max] random duration
}
```

On each cycle through a `durationRange` step, a new random value is picked.

When `loop: false`, the last step holds indefinitely after playing.

## Overlay Layers (Sub-Animations)

Each state can have multiple layers that play simultaneously. Layers render bottom-to-top — later layers' non-space characters overwrite earlier layers at the same position.

```ts
catIdle: [
  { id: "body", steps: [{ frame: catBody, duration: 5000 }], loop: true },
  { id: "eyes", steps: [...blinkSequence], loop: true },
  { id: "tail", steps: [...wagSequence], loop: true },
]
```

Compositing rule: For each `(row, col)` position, take the rightmost layer's character if it is not a space. Otherwise keep the previous layer's character. This lets overlay layers define only the region they animate (e.g. just the eye row).

Framework requirement: All layers must have the same width (use `pad()`). Composite fills missing rows with spaces.

## State Transitions

When switching from state A to state B:

1. Check if a `TransitionAnim` with `{ from: A, to: B }` exists
2. If yes: play its steps once (no loop), then enter state B's layers
3. If no: switch immediately to state B's layers
4. Wildcard transitions `{ from: "*", to: B }` match any source state
5. Specific `{ from: A, to: B }` takes priority over wildcards

During a transition, the current state's layers are paused. Once the transition completes, the new state's layers start from step 0.

## Animation Engine

A single `AnimationEngine` class manages the lifecycle:

```ts
class AnimationEngine {
  private layers: Map<string, { stepIndex: number, remainingMs: number }>
  private timers: Map<string, ReturnType<typeof setTimeout>>
  private currentTransition: { stepIndex: number, remainingMs: number } | null
  private transitionTimer: ReturnType<typeof setTimeout> | null

  constructor(
    private animations: PetAnimations,
    private onRender: () => void  // triggers SolidJS reactivity
  ) {}

  setState(newState: PetState): void
  private scheduleNext(layerId: string): void
  private compositeFrame(): string[][]
  private scheduleTransition(target: PetState): void
  destroy(): void  // clear all timers
}
```

Key behaviors:
- Each layer has its own independent timer
- On each tick, advance the layer's step, pick new duration (random if range), schedule next tick
- `compositeFrame()` merges all active layers into the final sprite
- On state change, all layer timers are cleared, transition is checked, new layers start from step 0
- `destroy()` clears all timers (called from SolidJS `onCleanup`)

The engine replaces the current `frame` signal + `scheduleFrame` + `scheduleNextState` logic. Instead of a single `frame()` index, the engine maintains per-layer state and calls `onRender` which updates a `sprite()` signal.

## Backwards Compatibility

Old 2-frame format converts automatically:
```ts
// Old: idle: [frameA, frameB]
// Converts to:
// idle: [{ id: "base", steps: [
//   { frame: frameA, duration: 1000 },
//   { frame: frameB, duration: 1000 },
// ], loop: true }]
```

Existing pets that don't define layered animations continue working with the single-layer fallback.

## Rendering Integration

Current rendering in `sidebar_content()`:
```ts
const stateFrames = petFrames[currentState]
const idx = frame() % stateFrames.length
const sprite = stateFrames[idx]
```

New rendering:
```ts
const sprite = engine.compositeFrame()
```

The engine is a per-pet-type singleton, initialized in `onMount`. Switching pets creates a new engine instance.

## File Structure

All animation data and engine logic stays in `pets.tsx` (single plugin file). No external dependencies needed.

```
pets.tsx
├── Animation types (AnimStep, AnimLayer, TransitionAnim, PetAnimations)
├── AnimationEngine class
├── Compositing function (mergeLayers)
├── Pet frame data (expanded with per-step durations and layers)
├── PetsPlugin component (unchanged API, uses engine internally)
└── Plugin exports
```

## Example: Cat Idle with Layers

```ts
const catIdleLayers: AnimLayer[] = [
  {
    id: "body",
    steps: [{ frame: pad(["  /\\_____/\\  ", " /      \\ ", "(  == ^ ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 5000 }],
    loop: true,
  },
  {
    id: "eyes",
    steps: [
      { frame: pad(["             ", " /  o   o  \\ ", "             ", "             ", "             "], 14), durationRange: [2000, 4000] },
      { frame: pad(["             ", " /  -   -  \\ ", "             ", "             ", "             "], 14), duration: 150 },
      { frame: pad(["             ", " /  ·   ·  \\ ", "             ", "             ", "             "], 14), duration: 80 },
      { frame: pad(["             ", " /  -   -  \\ ", "             ", "             ", "             "], 14), duration: 150 },
    ],
    loop: true,
  },
]
```

Note: The eyes overlay only contains non-space characters where the eyes go. The compositor merges body (layer 0) with eyes (layer 1) — eyes characters overwrite the body's eye positions.

## Transition Example

```ts
const catTransitions: TransitionAnim[] = [
  {
    from: "idle",
    to: "happy",
    steps: [
      { frame: pad(["  /\\_____/\\  ", " /  O   O  \\ ", "(  == ! ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 200 },
      { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 300 },
    ],
  },
]
```

## Success Criteria

1. Cat blink uses variable 2-4s hold between blinks with multi-step blink sequence
2. Each pet state can define independent animation layers (eyes blink at different rate than tail wags)
3. State transitions play a short animation before entering the new state
4. All existing 6 pets continue rendering correctly (backwards compatible)
5. Adding a new multi-step animation requires only declaring `AnimStep[]` — no code changes to the engine
6. No external npm dependencies