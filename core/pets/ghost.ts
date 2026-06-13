import type { PetAnimations, AnimLayer } from "../types"
import { pad, padAt, SW } from "../frame-utils"
import { auraFor, groundShadow } from "./effects"

const body = (rows: string[]): string[] => padAt(rows, 2, SW)

// A bigger ghost: rounded dome, soft body, wavy ectoplasm tail.
const ghostBody = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │         │      ",
  "     │    o    │      ",
  "     │         │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

const ghostEyes = (l: string, r: string): string[] =>
  padAt([`     │  ${l}   ${r}  │      `], 4, SW)

const idleGhBodyLayer: AnimLayer = {
  id: "body",
  steps: [{ frame: ghostBody, duration: 4800 }],
  loop: true,
}

const idleGhEyesLayer: AnimLayer = {
  id: "eyes",
  steps: [
    { frame: ghostEyes("●", "●"), durationRange: [2400, 4400] },
    { frame: ghostEyes("-", "-"), duration: 130 },
    { frame: ghostEyes("·", "·"), duration: 80 },
    { frame: ghostEyes("-", "-"), duration: 130 },
  ],
  loop: true,
}

// The wavy tail wisps shift left/right — accent layer on row 8.
const idleGhTailLayer: AnimLayer = {
  id: "wisp",
  steps: [
    { frame: padAt(["   ╲▁╱ ╲▁▁▁▁▁╲▁╱      "], 8, SW), duration: 1100 },
    { frame: padAt(["    ╲▁╱╲▁▁▁▁▁╱╲▁╱     "], 8, SW), duration: 1100 },
  ],
  loop: true,
}

const happyGh = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │  ^   ^  │      ",
  "     │    ω    │      ",
  "     │   boo!  │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

const sleepingGh = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │  -   -  │      ",
  "     │    z    │      ",
  "     │   ZZz   │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

const eatingGh = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │  ●   ●  │      ",
  "     │   nom   │      ",
  "     │   ~~~   │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

const playingGh = body([
  "        ╭─────╮       ",
  "       ╱       ╲      ",
  "      │  ^   ^  │     ",
  "      │    ω    │     ",
  "      │  ~~~~~  │     ",
  "       ╲       ╱      ",
  "    ╲▁╱ ╲▁▁▁▁▁╲▁╱     ",
  "                      ",
])

const excitedGh = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │  ★   ★  │      ",
  "     │    ω    │      ",
  "     │  BOO!!  │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

const sadGh = body([
  "       ╭─────╮        ",
  "      ╱       ╲       ",
  "     │  ╥   ╥  │      ",
  "     │   ;_;   │      ",
  "     │         │      ",
  "      ╲       ╱       ",
  "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
  "                      ",
])

export const ghostAnim: PetAnimations = {
  states: {
    idle: [idleGhBodyLayer, idleGhEyesLayer, idleGhTailLayer, groundShadow(), auraFor("idle")!],
    happy: [
      { id: "base", steps: [
        { frame: happyGh, durationRange: [1200, 2400] },
        { frame: excitedGh, duration: 500 },
      ], loop: true },
      groundShadow(),
      auraFor("happy")!,
    ],
    sleeping: [
      { id: "base", steps: [
        { frame: sleepingGh, durationRange: [2400, 3600] },
        { frame: pad([
          "                       ",
          "                       ",
          "       ╭─────╮        ",
          "      ╱       ╲       ",
          "     │  -   -  │      ",
          "     │    Z    │      ",
          "     │   ZZZ   │      ",
          "      ╲       ╱       ",
          "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
          "                      ",
        ], SW), duration: 1800 },
      ], loop: true },
      groundShadow(),
      auraFor("sleeping")!,
    ],
    eating: [
      { id: "base", steps: [
        { frame: eatingGh, duration: 360 },
        { frame: pad([
          "                       ",
          "                       ",
          "       ╭─────╮        ",
          "      ╱       ╲       ",
          "     │  ●   ●  │      ",
          "     │   NOM   │      ",
          "     │   ~~~   │      ",
          "      ╲       ╱       ",
          "   ╲▁╱ ╲▁▁▁▁▁╲▁╱      ",
          "                      ",
        ], SW), duration: 280 },
      ], loop: true },
      groundShadow(),
      auraFor("eating")!,
    ],
    playing: [
      { id: "base", steps: [
        { frame: playingGh, duration: 420 },
        { frame: happyGh, duration: 420 },
      ], loop: true },
      groundShadow(),
      auraFor("playing")!,
    ],
    excited: [
      { id: "base", steps: [
        { frame: excitedGh, duration: 260 },
        { frame: happyGh, duration: 260 },
      ], loop: true },
      groundShadow(),
      auraFor("excited")!,
    ],
    sad: [
      { id: "base", steps: [{ frame: sadGh, durationRange: [3000, 5000] }], loop: true },
      groundShadow(),
      auraFor("sad")!,
    ],
  },
}
