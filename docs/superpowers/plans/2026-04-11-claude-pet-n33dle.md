# N33DLE Pet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the N33DLE ("claude") pet type with all 7 animation states to the existing pets plugin state machine.

**Architecture:** Add a `claudeFrames` frame map to `pets.tsx` following the exact same `Record<PetState, string[][]>` pattern as existing pets, add it to `allPetFrames`, add a `PET_ICONS` map, register `/pet claude` command, and update the sidebar header to use per-pet icons.

**Tech Stack:** TypeScript/TSX, Solid.js, OpenCode TUI Plugin API

---

### Task 1: Add claudeFrames animation data

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (after line 168, before `STATE_COLORS`)

- [ ] **Step 1: Add claudeFrames constant**

Insert the following block after `corgiFrames` (after line 168) and before `STATE_COLORS` (line 170):

```typescript
const claudeFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["   \\|/       ","  ( o o )    ","   |   |     ","  _/   \\_    "], 14),
    pad(["   /|\\       ","  ( o o )    ","   |   |     ","  _/   \\_    "], 14),
  ],
  happy: [
    pad(["   \\|/       ","  ( ^ ^ )    ","   | ♥ |     ","  _/   \\_    "], 14),
    pad(["   \\|/       ","  ( ^ω^ )    ","   | ♥ |     ","  _/ \\_/ \\_  "], 14),
  ],
  sleeping: [
    pad(["   \\|/       ","  ( - - )    ","   | z |     ","  _/   \\_    "], 14),
    pad(["   \\|/       ","  ( - - )    ","   | Z |     ","  _/   \\_    ","    zzz      "], 14),
  ],
  eating: [
    pad(["   \\|/       ","  ( o nom )  ","   |   |     ","  _/   \\_    "], 14),
    pad(["   \\|/       ","  ( nom o )  ","   | ♥ |     ","  _/   \\_    "], 14),
  ],
  playing: [
    pad(["   \\|/    *  ","  ( ^ ^ )    ","   | ♥ |     ","  _/ \\_/ \\_  "], 14),
    pad(["   /|\\       ","  ( ^ ^ )*   ","   | ♥ |     ","  _/   \\_    "], 14),
  ],
  excited: [
    pad(["   \\|/       ","  ( O O )    ","   | ! |     ","  _/ \\_/ \\_  "], 14),
    pad(["   /|\\       ","  ( ω ω )    ","   | ! |     ","  _/ \\_/ \\_  "], 14),
  ],
  sad: [
    pad(["   \\|/       ","  ( T T )    ","   |   |     ","  _/   \\_    "], 14),
    pad(["   \\|/       ","  ( T T )    ","   |   |     ","  _/   \\_    ","    ;_;      "], 14),
  ],
}
```

- [ ] **Step 2: Verify frames render correctly by eye**

Check that each frame is exactly width 14 (matching the `pad(..., 14)` calls) and lines ≤ 8 (matching `HL = 8`).

---

### Task 2: Add claude to allPetFrames map

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (line ~190-196)

- [ ] **Step 1: Add claude entry to allPetFrames**

Change the `allPetFrames` map from:

```typescript
const allPetFrames: Record<string, Record<PetState, string[][]>> = {
  cat: catFrames,
  dog: dogFrames,
  hamster: hamFrames,
  ghost: ghostFrames,
  corgi: corgiFrames,
}
```

To:

```typescript
const allPetFrames: Record<string, Record<PetState, string[][]>> = {
  cat: catFrames,
  dog: dogFrames,
  hamster: hamFrames,
  ghost: ghostFrames,
  corgi: corgiFrames,
  claude: claudeFrames,
}
```

---

### Task 3: Add PET_ICONS map and update sidebar header

**Files:**
- Modify: `.opencode/plugins/pets.tsx`

- [ ] **Step 1: Add PET_ICONS constant**

Add after `STATE_ICONS` (after line ~188):

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

- [ ] **Step 2: Update sidebar header to use PET_ICONS**

Change the sidebar header line from:

```tsx
<text fg="#bd93f9"><b>🐱 {petType()}</b></text>
```

To:

```tsx
<text fg="#bd93f9"><b>{PET_ICONS[petType()] || "🐾"} {petType()}</b></text>
```

---

### Task 4: Add /pet claude command

**Files:**
- Modify: `.opencode/plugins/pets.tsx` (in `api.command.register()` block)

- [ ] **Step 1: Add claude command entry**

Add after the corgi command line (line ~251):

```typescript
    { title: "Claude", value: "pet claude", description: "N33DLE", slash: { name: "pet claude" }, onSelect: () => switchPet("claude") },
```

- [ ] **Step 2: Commit all changes**

```bash
git add .opencode/plugins/pets.tsx
git commit -m "feat: add N33DLE (claude) pet with 7 animation states"
```