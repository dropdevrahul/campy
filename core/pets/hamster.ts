import type { PetAnimations, AnimLayer } from "../types"
import { pad, padAt, SW } from "../frame-utils"
import { auraFor, groundShadow } from "./effects"

const body = (rows: string[]): string[] => padAt(rows, 2, SW)

// Chubby hamster: two big ears, round body, cheek pouches, tiny paws.
const hamsterBody = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │           │     ",
  "    │   ° ω °   │     ",
  "    │   ╰───╯   │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       / | | \\        ",
])

const hamsterEyes = (l: string, r: string): string[] =>
  padAt([`    │  ${l}     ${r}  │     `], 4, SW)

const idleHamBodyLayer: AnimLayer = {
  id: "body",
  steps: [{ frame: hamsterBody, duration: 4600 }],
  loop: true,
}

const idleHamEyesLayer: AnimLayer = {
  id: "eyes",
  steps: [
    { frame: hamsterEyes("●", "●"), durationRange: [2200, 4200] },
    { frame: hamsterEyes("-", "-"), duration: 120 },
    { frame: hamsterEyes("·", "·"), duration: 80 },
    { frame: hamsterEyes("-", "-"), duration: 120 },
  ],
  loop: true,
}

// Cheek pouches puff in and out — subtle accent on the cheeks row.
const idleHamCheeksLayer: AnimLayer = {
  id: "cheeks",
  steps: [
    { frame: padAt(["    │   ° ω °   │     "], 5, SW), duration: 900 },
    { frame: padAt(["    │   ◦ ω ◦   │     "], 5, SW), duration: 600 },
  ],
  loop: true,
}

const happyHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  ^     ^  │     ",
  "    │   ° ω °   │     ",
  "    │   ╰─♥─╯   │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       /  ♥  \\        ",
])

const sleepingHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  -     -  │     ",
  "    │   ° ω °   │     ",
  "    │    zzz    │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       /     \\        ",
])

const eatingHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  ●     ●  │     ",
  "    │   ● ω ●   │     ",
  "    │   ╰nom╯   │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       / | | \\        ",
])

const playingHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  ^     ^  │     ",
  "    │   ° ω °   │     ",
  "    │  run run  │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       / / / \\        ",
])

const excitedHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  ★     ★  │     ",
  "    │  SQUEAK   │     ",
  "    │   ╰─!─╯   │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       / ♥ ♥ \\        ",
])

const sadHam = body([
  "      ╱─╲   ╱─╲       ",
  "     ╱   ╲_╱   ╲      ",
  "    │  ╥     ╥  │     ",
  "    │   ° ω °   │     ",
  "    │   ╰_;_╯   │     ",
  "     ╲         ╱      ",
  "      ╲_______╱       ",
  "       /     \\        ",
])

export const hamAnim: PetAnimations = {
  states: {
    idle: [idleHamBodyLayer, idleHamEyesLayer, idleHamCheeksLayer, groundShadow(), auraFor("idle")!],
    happy: [
      { id: "base", steps: [
        { frame: happyHam, durationRange: [1200, 2400] },
        { frame: excitedHam, duration: 500 },
      ], loop: true },
      groundShadow(),
      auraFor("happy")!,
    ],
    sleeping: [
      { id: "base", steps: [
        { frame: sleepingHam, durationRange: [2400, 3600] },
        { frame: pad([
          "                       ",
          "                       ",
          "      ╱─╲   ╱─╲       ",
          "     ╱   ╲_╱   ╲      ",
          "    │  -     -  │     ",
          "    │   ° ω °   │     ",
          "    │    ZZZ    │     ",
          "     ╲         ╱      ",
          "      ╲_______╱       ",
          "       /     \\        ",
        ], SW), duration: 1800 },
      ], loop: true },
      groundShadow(),
      auraFor("sleeping")!,
    ],
    eating: [
      { id: "base", steps: [
        { frame: eatingHam, duration: 320 },
        { frame: pad([
          "                       ",
          "                       ",
          "      ╱─╲   ╱─╲       ",
          "     ╱   ╲_╱   ╲      ",
          "    │  ^     ^  │     ",
          "    │   ● ω ●   │     ",
          "    │   ╰NOM╯   │     ",
          "     ╲         ╱      ",
          "      ╲_______╱       ",
          "       / | | \\        ",
        ], SW), duration: 280 },
      ], loop: true },
      groundShadow(),
      auraFor("eating")!,
    ],
    playing: [
      { id: "base", steps: [
        { frame: playingHam, duration: 380 },
        { frame: happyHam, duration: 380 },
      ], loop: true },
      groundShadow(),
      auraFor("playing")!,
    ],
    excited: [
      { id: "base", steps: [
        { frame: excitedHam, duration: 240 },
        { frame: happyHam, duration: 240 },
      ], loop: true },
      groundShadow(),
      auraFor("excited")!,
    ],
    sad: [
      { id: "base", steps: [{ frame: sadHam, durationRange: [3200, 5000] }], loop: true },
      groundShadow(),
      auraFor("sad")!,
    ],
  },
}
