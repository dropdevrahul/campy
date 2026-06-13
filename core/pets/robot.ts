import type { PetAnimations, AnimLayer } from "../types"
import { pad, padAt, SW } from "../frame-utils"
import { auraFor, groundShadow } from "./effects"

const body = (rows: string[]): string[] => padAt(rows, 2, SW)

// A proper robot: antenna with strut, boxy head with LED eyes, chest module,
// blocky legs. Each subsystem can animate independently.
const robotBody = body([
  "         ┌─┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │     │        ",
  "       │ ┌─┐ │        ",
  "       │ └─┘ │        ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const robotEyes = (l: string, r: string): string[] =>
  padAt([`       │ ${l}   ${r} │        `], 5, SW)

const idleRbBodyLayer: AnimLayer = {
  id: "body",
  steps: [{ frame: robotBody, duration: 5000 }],
  loop: true,
}

const idleRbEyesLayer: AnimLayer = {
  id: "eyes",
  steps: [
    { frame: robotEyes("◉", "◉"), durationRange: [2200, 4400] },
    { frame: robotEyes("-", "-"), duration: 120 },
    { frame: robotEyes("·", "·"), duration: 80 },
    { frame: robotEyes("-", "-"), duration: 120 },
  ],
  loop: true,
}

// Antenna LED pulses red/dot/red.
const idleRbAntennaLayer: AnimLayer = {
  id: "antenna",
  steps: [
    { frame: padAt(["         ┌─┐          "], 2, SW), duration: 800 },
    { frame: padAt(["         ┌●┐          "], 2, SW), duration: 200 },
  ],
  loop: true,
}

// Chest module pulses (a soft heartbeat).
const idleRbChestLayer: AnimLayer = {
  id: "chest",
  steps: [
    { frame: padAt(["       │ ┌─┐ │        "], 6, SW), duration: 900 },
    { frame: padAt(["       │ ├─┤ │        "], 6, SW), duration: 500 },
  ],
  loop: true,
}

const happyRb = body([
  "         ┌●┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │ ^ ^ │        ",
  "       │ ┌♥┐ │        ",
  "       │ └─┘ │        ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const sleepingRb = body([
  "         ┌─┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │ - - │        ",
  "       │ ┌─┐ │        ",
  "       │ └─┘ │ zzz    ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const eatingRb = body([
  "         ┌●┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │ ◉ ◉ │        ",
  "       │ ┌─┐ │  nom   ",
  "       │ └─┘ │        ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const playingRb = body([
  "         ┌●┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │ ω ω │  beep  ",
  "       │ ┌♥┐ │        ",
  "       │ └─┘ │  boop  ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const excitedRb = body([
  "         ┌●┐          ",
  "       ✦╱│ │╲✦        ",
  "       ┌──┴──┐        ",
  "       │ ◉ ◉ │ BEEP   ",
  "       │ ┌♥┐ │        ",
  "       │ └─┘ │ BOOP   ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

const sadRb = body([
  "         ┌─┐          ",
  "        ╱│ │╲         ",
  "       ┌──┴──┐        ",
  "       │ ╥ ╥ │        ",
  "       │ ┌─┐ │  ;_;   ",
  "       │ └─┘ │        ",
  "       └─┬─┬─┘        ",
  "        ╱   ╲         ",
])

export const robotAnim: PetAnimations = {
  states: {
    idle: [idleRbBodyLayer, idleRbEyesLayer, idleRbAntennaLayer, idleRbChestLayer, groundShadow(), auraFor("idle")!],
    happy: [
      { id: "base", steps: [
        { frame: happyRb, durationRange: [1200, 2400] },
        { frame: excitedRb, duration: 500 },
      ], loop: true },
      groundShadow(),
      auraFor("happy")!,
    ],
    sleeping: [
      { id: "base", steps: [
        { frame: sleepingRb, durationRange: [2400, 3600] },
        { frame: pad([
          "                       ",
          "                       ",
          "         ┌─┐          ",
          "        ╱│ │╲         ",
          "       ┌──┴──┐        ",
          "       │ - - │        ",
          "       │ ┌─┐ │  ZZZ  ",
          "       │ └─┘ │        ",
          "       └─┬─┬─┘        ",
          "        ╱   ╲         ",
        ], SW), duration: 1800 },
      ], loop: true },
      groundShadow(),
      auraFor("sleeping")!,
    ],
    eating: [
      { id: "base", steps: [
        { frame: eatingRb, duration: 360 },
        { frame: pad([
          "                       ",
          "                       ",
          "         ┌●┐          ",
          "        ╱│ │╲         ",
          "       ┌──┴──┐        ",
          "       │ ◉ ◉ │        ",
          "       │ ┌─┐ │ NOM!  ",
          "       │ └─┘ │        ",
          "       └─┬─┬─┘        ",
          "        ╱   ╲         ",
        ], SW), duration: 280 },
      ], loop: true },
      groundShadow(),
      auraFor("eating")!,
    ],
    playing: [
      { id: "base", steps: [
        { frame: playingRb, duration: 420 },
        { frame: happyRb, duration: 420 },
      ], loop: true },
      groundShadow(),
      auraFor("playing")!,
    ],
    excited: [
      { id: "base", steps: [
        { frame: excitedRb, duration: 240 },
        { frame: happyRb, duration: 240 },
      ], loop: true },
      groundShadow(),
      auraFor("excited")!,
    ],
    sad: [
      { id: "base", steps: [{ frame: sadRb, durationRange: [3200, 5000] }], loop: true },
      groundShadow(),
      auraFor("sad")!,
    ],
  },
}
