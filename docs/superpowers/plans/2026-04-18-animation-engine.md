# Animation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed 2-frame toggle animation system with a Frame Sequencer engine supporting multi-step sequences, overlay layers (sub-animations), and state transitions.

**Architecture:** An `AnimationEngine` class manages per-layer timers and composites multiple `AnimLayer` objects into a single sprite. Each pet state defines 1+ layers with independent animation sequences. State transitions can play a one-shot animation before entering the new state. The engine is instantiated per-pet and replaces the current `frame` signal + `scheduleFrame` logic.

**Tech Stack:** TypeScript, SolidJS (createSignal, onMount, onCleanup), no external dependencies

---

### Task 1: Define Animation Types

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (add types after line 7, before `const pad`)

- [ ] **Step 1: Add animation type definitions**

Add the following types after `const HL = 8` (line 7) and before `const pad`:

```ts
type AnimStep = {
  frame: string[]
  duration?: number
  durationRange?: [number, number]
}

type AnimLayer = {
  id: string
  steps: AnimStep[]
  loop: boolean
}

type TransitionAnim = {
  from: PetState | "*"
  to: PetState
  steps: AnimStep[]
}

type PetAnimations = {
  states: Record<PetState, AnimLayer[]>
  transitions?: TransitionAnim[]
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /Users/rahultyagi/work/campy && npx tsc --noEmit .opencode/plugins/pets.tsx 2>&1 | head -20` (or just check for syntax errors)

Expected: No new type errors (existing ones from the SolidJS/jsx runtime are OK — the types themselves should be valid)

- [ ] **Step 3: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add animation engine type definitions"
```

---

### Task 2: Implement mergeLayers compositing function

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (add after `pad` function)

- [ ] **Step 1: Add mergeLayers function**

Add the following function after `const pad` (after line 13):

```ts
const mergeLayers = (layers: string[][]): string[] => {
  if (layers.length === 0) return []
  if (layers.length === 1) return layers[0]
  const height = Math.max(...layers.map(l => l.length))
  const width = Math.max(...layers.map(l => l[0]?.length ?? 0))
  const result: string[] = []
  for (let row = 0; row < height; row++) {
    let line = " ".repeat(width)
    for (const layer of layers) {
      const sourceRow = layer[row] ?? ""
      for (let col = 0; col < sourceRow.length; col++) {
        if (sourceRow[col] !== " ") {
          line = line.substring(0, col) + sourceRow[col] + line.substring(col + 1)
        }
      }
    }
    result.push(line)
  }
  return result
}
```

This composites multiple layer frames bottom-to-top: later layers' non-space characters overwrite earlier layers.

- [ ] **Step 2: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add mergeLayers compositing function"
```

---

### Task 3: Implement AnimationEngine class

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (add after `mergeLayers`)

- [ ] **Step 1: Add AnimationEngine class**

Add the following class after `mergeLayers`:

```ts
class AnimationEngine {
  private layerState: Map<string, { stepIndex: number }>
  private timers: Map<string, ReturnType<typeof setTimeout>>
  private currentTransition: { stepIndex: number; timer: ReturnType<typeof setTimeout> } | null = null
  private currentState: PetState = "idle"
  private destroyed = false
  private onRender: () => void
  private animations: PetAnimations
  private spriteSignal: { get: () => string[]; set: (v: string[]) => void }

  constructor(
    animations: PetAnimations,
    onRender: () => void,
    spriteSignal: { get: () => string[]; set: (v: string[]) => void }
  ) {
    this.animations = animations
    this.onRender = onRender
    this.spriteSignal = spriteSignal
    this.layerState = new Map()
    this.timers = new Map()
  }

  private getStepDuration(step: AnimStep): number {
    if (step.durationRange) {
      const [min, max] = step.durationRange
      return min + Math.random() * (max - min)
    }
    return step.duration ?? 1000
  }

  private scheduleLayer(layer: AnimLayer, stepIndex: number): void {
    if (this.destroyed) return
    const step = layer.steps[stepIndex]
    if (!step) return
    const duration = this.getStepDuration(step)
    const timer = setTimeout(() => {
      if (this.destroyed) return
      const nextIndex = stepIndex + 1
      if (nextIndex >= layer.steps.length) {
        if (layer.loop) {
          this.layerState.set(layer.id, { stepIndex: 0 })
          this.renderFrame()
          this.scheduleLayer(layer, 0)
        } else {
          this.layerState.set(layer.id, { stepIndex: stepIndex })
          this.renderFrame()
        }
      } else {
        this.layerState.set(layer.id, { stepIndex: nextIndex })
        this.renderFrame()
        this.scheduleLayer(layer, nextIndex)
      }
    }, duration)
    this.timers.set(layer.id, timer)
  }

  private renderFrame(): void {
    const layers = this.animations.states[this.currentState]
    if (!layers) return
    const frames: string[][] = []
    for (const layer of layers) {
      const state = this.layerState.get(layer.id)
      const idx = state?.stepIndex ?? 0
      const step = layer.steps[idx] ?? layer.steps[0]
      if (step) frames.push(step.frame)
    }
    const composited = mergeLayers(frames)
    this.spriteSignal.set(composited)
    this.onRender()
  }

  private startLayers(): void {
    this.clearTimers()
    const layers = this.animations.states[this.currentState]
    if (!layers) return
    this.layerState.clear()
    for (const layer of layers) {
      this.layerState.set(layer.id, { stepIndex: 0 })
      this.scheduleLayer(layer, 0)
    }
    this.renderFrame()
  }

  private clearTimers(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    if (this.currentTransition) {
      clearTimeout(this.currentTransition.timer)
      this.currentTransition = null
    }
  }

  private findTransition(from: PetState, to: PetState): TransitionAnim | undefined {
    const transitions = this.animations.transitions ?? []
    const specific = transitions.find(t => t.from === from && t.to === to)
    if (specific) return specific
    return transitions.find(t => t.from === "*" && t.to === to)
  }

  private playTransition(target: PetState): void {
    const transition = this.findTransition(this.currentState, target)
    if (!transition || transition.steps.length === 0) {
      this.currentState = target
      this.startLayers()
      return
    }
    this.clearTimers()
    this.currentState = target
    let stepIndex = 0
    const playStep = () => {
      if (this.destroyed) return
      const step = transition.steps[stepIndex]
      if (!step) {
        this.currentTransition = null
        this.startLayers()
        return
      }
      this.spriteSignal.set(step.frame)
      this.onRender()
      const duration = this.getStepDuration(step)
      const timer = setTimeout(() => {
        stepIndex++
        playStep()
      }, duration)
      this.currentTransition = { stepIndex, timer }
    }
    playStep()
  }

  setState(newState: PetState): void {
    if (this.destroyed) return
    this.playTransition(newState)
  }

  resetToState(newState: PetState): void {
    this.clearTimers()
    this.currentState = newState
    this.startLayers()
  }

  destroy(): void {
    this.destroyed = true
    this.clearTimers()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add AnimationEngine class with layers, compositing, and transitions"
```

---

### Task 4: Add convertLegacyFrames helper

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (add after AnimationEngine class)

This converts the old `Record<PetState, string[][]>` format into `PetAnimations` so existing pets continue working without manually rewriting all their data.

- [ ] **Step 1: Add convertLegacyFrames function**

```ts
const convertLegacyFrames = (frames: Record<PetState, string[][]>, defaultDuration: number = 1000): PetAnimations => {
  const states: Record<PetState, AnimLayer[]> = {} as Record<PetState, AnimLayer[]>
  for (const state of STATES) {
    const stateFrames = frames[state]
    if (!stateFrames || stateFrames.length === 0) continue
    states[state] = [{
      id: "base",
      steps: stateFrames.map(f => ({ frame: f, duration: defaultDuration })),
      loop: true,
    }]
  }
  return { states }
}
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add convertLegacyFrames for backwards compatibility"
```

---

### Task 5: Define cat layered animations

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (add after catFrames, before dogFrames)

This creates the cat's layered animation data with multi-step blink sequences and per-state overlays. The cat will be the showcase pet that uses all engine features.

- [ ] **Step 1: Add cat animation layers**

Add the following after `catFrames` (after line 43) — this defines all cat states with body and eyes as separate layers:

```ts
const catAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [{ frame: pad(["  /\\_____/\\  ", " /          \\ ", "(    ^ ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 5000 }],
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
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), durationRange: [1500, 3000] },
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", "  | ♥ |    ", " (__) (__)  "], 14), duration: 800 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad(["  /\\_____/\\  ", " /  -   -  \\ ", "(  == z z  )", " \\  '-'  /  ", " (__)  (__) "], 14), durationRange: [2000, 3000] },
          { frame: pad(["  /\\_____/\\  ", " /  -   -  \\ ", "(  == Z z  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 1500 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad(["  /\\_____/\\  ", " /  o   o  \\ ", "(  == ω ==  )", " \\  nom /  ", " (__)  (__) "], 14), duration: 400 },
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  nom /  ", " (__)  (__) "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad(["    /\\_____/\\ ", "   /  ^   ^  \\", " ( == ω ==  ) ", "  \\  '-'  /  ", "  (__)  (__) "], 14), duration: 500 },
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", "  | ♥ |    ", " (__) (__)  "], 14), duration: 300 },
          { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad(["  /\\_____/\\  ", " /  -   -  \\ ", "(  == T T  )", " \\  '-'  /  ", " (__)  (__) "], 14), durationRange: [4000, 6000] },
          { frame: pad(["  /\\_____/\\  ", " /  -   -  \\ ", "(  == T T  )", " \\  '-'  /  ", " (__)  (__) ", "   ;_;     "], 14), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
  transitions: [
    {
      from: "idle",
      to: "happy",
      steps: [
        { frame: pad(["  /\\_____/\\  ", " /  O   O  \\ ", "(  == ! ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 200 },
        { frame: pad(["  /\\_____/\\  ", " /  ^   ^  \\ ", "(  == ω ==  )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 300 },
      ],
    },
    {
      from: "happy",
      to: "sad",
      steps: [
        { frame: pad(["  /\\_____/\\  ", " /  -   -  \\ ", "(  == ... == )", " \\  '-'  /  ", " (__)  (__) "], 14), duration: 400 },
      ],
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add cat layered animation data with multi-step blink"
```

---

### Task 6: Wire AnimationEngine into PetsPlugin

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (PetsPlugin function)

This replaces the current `frame` signal + `scheduleFrame` + rendering logic with `AnimationEngine`. Non-cat pets use `convertLegacyFrames` for backwards compatibility.

- [ ] **Step 1: Replace frame signal and scheduleFrame with AnimationEngine**

In the `PetsPlugin` function, replace the signals and engine logic. The changes are:

1. Replace `const [frame, setFrame] = createSignal(0)` with `const [sprite, setSprite] = createSignal<string[]>(catFrames.idle[0])` 
2. Remove `let frameTimeout` declaration (line 258)
3. Remove the `scheduleFrame` function (lines 290-297)
4. In `onMount`, remove `scheduleFrame()` call and initialize the engine
5. In `onCleanup`, remove `if (frameTimeout) clearTimeout(frameTimeout)` and add `engine.destroy()`
6. In `overrideState`, replace `setFrame(0)` with `engine.setState(s)`
7. In `scheduleNextState`, replace `setFrame(0)` with `engine.resetToState(next)` 
8. In the `session.idle` handler, replace `setFrame(0)` with `engine.resetToState("idle")`
9. Replace the rendering section in `sidebar_content`

Here is the exact replacement for the `PetsPlugin` function body. Replace everything from `const PetsPlugin: TuiPlugin = async (api) => {` through the end of the function (before the last `}`):

```ts
const PetsPlugin: TuiPlugin = async (api) => {
  const [sprite, setSprite] = createSignal<string[]>(catFrames.idle[0])
  const [happiness, setHappiness] = createSignal(80)
  const [petType, setPetType] = createSignal("cat")
  const [state, setState] = createSignal<PetState>("idle")
  const [speechBubble, setSpeechBubble] = createSignal("")

  let stateTimeout: ReturnType<typeof setTimeout> | undefined
  let speechTimeout: ReturnType<typeof setTimeout> | undefined
  let engine: AnimationEngine | undefined

  const getCurrentAnimations = (): PetAnimations => {
    const pt = petType()
    if (pt === "cat") return catAnim
    return convertLegacyFrames(allPetFrames[pt] || catFrames)
  }

  const scheduleNextState = () => {
    const delay = 10000 + Math.random() * 20000
    stateTimeout = setTimeout(() => {
      const next = STATES[Math.floor(Math.random() * STATES.length)]
      setState(next)
      engine?.setState(next)
      scheduleNextState()
    }, delay)
  }

  const showSpeech = (text: string, duration = 5000) => {
    if (speechTimeout) clearTimeout(speechTimeout)
    setSpeechBubble(text)
    speechTimeout = setTimeout(() => setSpeechBubble(""), duration)
  }

  const overrideState = (s: PetState, duration: number, speech?: string) => {
    if (stateTimeout) clearTimeout(stateTimeout)
    setState(s)
    engine?.setState(s)
    if (speech) showSpeech(speech, duration)
    stateTimeout = setTimeout(() => {
      setState("idle")
      engine?.setState("idle")
      scheduleNextState()
    }, duration)
  }

  onMount(() => {
    engine = new AnimationEngine(
      getCurrentAnimations(),
      () => {},
      { get: sprite, set: setSprite }
    )
    engine.resetToState("idle")
    scheduleNextState()

    api.event.on("message.part.delta", () => {
      overrideState("excited", 3000, "Thinking...")
    })

    api.event.on("session.error", () => {
      overrideState("sad", 5000, "Error! Let me help...")
    })

    api.event.on("session.idle", () => {
      if (stateTimeout) clearTimeout(stateTimeout)
      setState("idle")
      engine?.resetToState("idle")
      showSpeech(IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)], 4000)
      scheduleNextState()
    })

    api.event.on("file.edited", (data: any) => {
      const path = data?.path || data?.filePath || ""
      const filename = path ? path.split("/").pop() || path : ""
      overrideState("eating", 4000, filename ? `Edited ${filename}!` : "File saved!")
    })

    api.event.on("tui.prompt.append", () => {
      overrideState("happy", 2000, "I'm here!")
    })

    api.event.on("command.executed", (data: any) => {
      const cmd = data?.command || ""
      overrideState("happy", 3000, cmd ? `Ran ${cmd}!` : "Done!")
    })
  })

  onCleanup(() => {
    engine?.destroy()
    if (stateTimeout) clearTimeout(stateTimeout)
    if (speechTimeout) clearTimeout(speechTimeout)
  })
```

- [ ] **Step 2: Update switchPet to re-create engine**

Replace the `switchPet` line:

Old: `const switchPet = (t: string) => { setPetType(t); setHappiness(80); setState("idle"); setFrame(0); api.ui.toast({ message: t + "!", variant: "success" }) }`

New:
```ts
const switchPet = (t: string) => {
  setPetType(t); setHappiness(80); setState("idle")
  engine?.destroy()
  engine = new AnimationEngine(getCurrentAnimations(), () => {}, { get: sprite, set: setSprite })
  engine.resetToState("idle")
  api.ui.toast({ message: t + "!", variant: "success" })
}
```

- [ ] **Step 3: Update sidebar_content rendering**

In `sidebar_content()`, replace:
```ts
const petFrames = allPetFrames[petType()] || catFrames
const currentState = state()
const stateFrames = petFrames[currentState] || petFrames.idle
const idx = frame() % stateFrames.length
const sprite = stateFrames[idx] || petFrames.idle[0]
```

With:
```ts
const currentSprite = sprite()
```

And update the JSX that renders the sprite (replace `{sprite.map(...)` with `{currentSprite.map(...)`):

```tsx
<box flexDirection="column" alignItems="center" minHeight={HL}>
  {currentSprite.map((l: string, i: number) => <text key={i} fg={color}>{l}</text>)}
</box>
```

- [ ] **Step 4: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: wire AnimationEngine into PetsPlugin"
```

---

### Task 7: Handle legacy frame access in sidebar_content

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (sidebar_content function)

The `mergeLayers` function returns its result, and `sprite()` signal is already set by the engine. This step ensures the existing `catFrames.idle[0]` default still works as the initial signal value, and that the engine properly initializes.

- [ ] **Step 1: Verify initial sprite value**

The initial `sprite` signal value `catFrames.idle[0]` is correct — it shows a cat until the engine starts. The engine's `resetToState("idle")` call in `onMount` will immediately overwrite it with the correct composited frame.

- [ ] **Step 2: Verify rendering reads from signal**

Ensure `sidebar_content()` uses `sprite()` (aliased as `currentSprite`) and not `allPetFrames`. The old code path through `allPetFrames[petType()]` / `stateFrames` / `frame()` index should be completely gone.

- [ ] **Step 3: Commit any fixes**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "fix: ensure sidebar_content reads from AnimationEngine sprite signal"
```

---

### Task 8: Manual testing and verification

**Files:**
- None (testing only)

- [ ] **Step 1: Start OpenCode and verify cat idle animation**

Run: `cd /Users/rahultyagi/work/campy && npx opencode --dev`

Expected: Cat appears in sidebar, eyes stay open for 2-4 seconds, then brief blink sequence (close 150ms → half-open 80ms → close 150ms), then hold again.

- [ ] **Step 2: Test state transitions**

Trigger a state change (e.g., `/pet feed`). Verify:
- Cat transitions through idle→happy transition animation (surprised face for 200ms, happy face for 300ms)
- Then shows happy state with its loop animation
- After duration, returns to idle

- [ ] **Step 3: Test other pets still work**

Switch to dog: `/pet dog`. Verify:
- Dog renders correctly with its legacy 2-frame animation at 1000ms per frame
- State changes work (feed, play, pet)

- [ ] **Step 4: Test switchPet creates new engine**

Switch between cat and dog multiple times. Verify no timer leaks (old animations stop, new ones start).

- [ ] **Step 5: Final commit if fixes needed**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "fix: address testing issues found in animation engine"
```

---

### Task 9: Remove legacy code and unused variables

**Files:**
- Modify: `.opencode/plugins/pets.tsx`

- [ ] **Step 1: Remove unused `frame` signal and `scheduleFrame`**

After Task 6, these should already be removed. Verify that no references to `frame`, `setFrame`, `frameInterval`, `frameTimeout`, or `scheduleFrame` remain in the file. Search for any residual references and remove them.

- [ ] **Step 2: Verify allPetFrames is still used**

`allPetFrames` is still needed by `convertLegacyFrames` for non-cat pets. Confirm it's referenced in `getCurrentAnimations()`.

- [ ] **Step 3: Commit**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "chore: clean up legacy animation code"
```