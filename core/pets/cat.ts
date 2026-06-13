import type { PetAnimations, AnimLayer, PetState } from "../types"
import { pad, padAt, SW } from "../frame-utils"
import { auraFor, groundShadow } from "./effects"

// Body rows 2-9 (aura sits in rows 0-1, ground shadow on row 11).
const body = (rows: string[]): string[] => padAt(rows, 2, SW)

// Cat body — `/\___/\` ears, a fuzzy round body, and two paw pairs at the
// bottom. The eyes and nose are kept blank so the eyes layer can overlay them.
const catBody = body([
  "       /\\_____/\\       ",
  "      (         )      ",
  "      |         |      ",
  "      |    ω    |      ",
  "      |  '---'  |      ",
  "       \\       /       ",
  "        |_____|        ",
  "       (__) (__)       ",
])

const catEyes = (left: string, right: string): string[] =>
  padAt([`      |  ${left}   ${right}  |      `], 4, SW)

// A 2-cell tail that flicks left/right at the right edge of the body.
const tail = (frame: string[]): AnimLayer => ({
  id: "tail",
  steps: frame.map(f => ({ frame: padAt([f], 8, SW), duration: 700 })),
  loop: true,
})

const idleEyesLayer: AnimLayer = {
  id: "eyes",
  steps: [
    { frame: catEyes("●", "●"), durationRange: [2500, 4500] },
    { frame: catEyes("-", "-"), duration: 120 },
    { frame: catEyes("·", "·"), duration: 80 },
    { frame: catEyes("-", "-"), duration: 120 },
  ],
  loop: true,
}

const idleBodyLayer: AnimLayer = {
  id: "body",
  steps: [{ frame: catBody, duration: 4800 }],
  loop: true,
}

const idleTailLayer: AnimLayer = tail([
  "                  ╱╲ ",
  "                 ╱   ",
])

// catFrames is the public still-image dictionary used by static renderers
// (statusline, OpenCode seed sprite). It mirrors the body layer at frame 0.
export const catFrames: Record<PetState, string[][]> = {
  idle: [catBody],
  happy: [body([
    "       /\\_____/\\       ",
    "      (  ^   ^  )      ",
    "      |  ●   ●  |      ",
    "      |    ω    |      ",
    "      |  \\___/  |      ",
    "       \\       /       ",
    "        |_____|        ",
    "       (__) (__)       ",
  ])],
  sleeping: [body([
    "       /\\_____/\\       ",
    "      (  ─   ─  )      ",
    "      |  -   -  |      ",
    "      |    ω    |      ",
    "      |   ...   |      ",
    "       \\       /       ",
    "        |_____|        ",
    "       (__) (__)       ",
  ])],
  eating: [body([
    "       /\\_____/\\       ",
    "      (  o   o  )      ",
    "      |  ●   ●  |      ",
    "      |   nom   |      ",
    "      |  \\___/  |      ",
    "       \\       /       ",
    "        |_____|        ",
    "       (__) (__)       ",
  ])],
  playing: [body([
    "        /\\___/\\        ",
    "       (  ^   ^ )      ",
    "       |  ●   ● |      ",
    "       |    ω   |      ",
    "       |  \\__/  |      ",
    "        \\      /       ",
    "         |____|        ",
    "        (_)( )(_)      ",
  ])],
  excited: [body([
    "       /\\_____/\\       ",
    "      (  ★   ★  )      ",
    "      |  ●   ●  |      ",
    "      |    ω    |      ",
    "      |  \\___/  |      ",
    "       \\       /       ",
    "        |_____|        ",
    "       (__) (__)       ",
  ])],
  sad: [body([
    "       /\\_____/\\       ",
    "      (  ╥   ╥  )      ",
    "      |  ●   ●  |      ",
    "      |    ω    |      ",
    "      |  '---'  |      ",
    "       \\       /       ",
    "        |_____|        ",
    "       (__) (__)       ",
  ])],
}

const happyBody = catFrames.happy[0]
const eatingBody = catFrames.eating[0]
const sadBody = catFrames.sad[0]
const sleepingBody = catFrames.sleeping[0]
const excitedBody = catFrames.excited[0]
const playingBody = catFrames.playing[0]

export const catAnim: PetAnimations = {
  states: {
    idle: [idleBodyLayer, idleEyesLayer, idleTailLayer, groundShadow(), auraFor("idle")!],
    happy: [
      {
        id: "base",
        steps: [
          { frame: happyBody, durationRange: [1200, 2400] },
          { frame: catFrames.excited[0], duration: 600 },
        ],
        loop: true,
      },
      groundShadow(),
      auraFor("happy")!,
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: sleepingBody, durationRange: [2400, 3600] },
          { frame: pad([
            "                       ",
            "                       ",
            "       /\\_____/\\       ",
            "      (  ─   ─  )      ",
            "      |  -   -  |      ",
            "      |    ω    |      ",
            "      |   ZZZ   |      ",
            "       \\       /       ",
            "        |_____|        ",
            "       (__) (__)       ",
          ], SW), duration: 1800 },
        ],
        loop: true,
      },
      groundShadow(),
      auraFor("sleeping")!,
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: eatingBody, duration: 360 },
          { frame: pad([
            "                       ",
            "                       ",
            "       /\\_____/\\       ",
            "      (  ^   ^  )      ",
            "      |  ●   ●  |      ",
            "      |   NOM   |      ",
            "      |  \\___/  |      ",
            "       \\       /       ",
            "        |_____|        ",
            "       (__) (__)       ",
          ], SW), duration: 280 },
        ],
        loop: true,
      },
      groundShadow(),
      auraFor("eating")!,
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: playingBody, duration: 420 },
          { frame: happyBody, duration: 420 },
        ],
        loop: true,
      },
      groundShadow(),
      auraFor("playing")!,
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: excitedBody, duration: 260 },
          { frame: happyBody, duration: 260 },
        ],
        loop: true,
      },
      groundShadow(),
      auraFor("excited")!,
    ],
    sad: [
      {
        id: "base",
        steps: [{ frame: sadBody, durationRange: [3000, 5000] }],
        loop: true,
      },
      groundShadow(),
      auraFor("sad")!,
    ],
  },
  transitions: [
    {
      from: "idle",
      to: "happy",
      steps: [
        { frame: body([
          "       /\\_____/\\       ",
          "      (  O   O  )      ",
          "      |  ●   ●  |      ",
          "      |    !    |      ",
          "      |  '---'  |      ",
          "       \\       /       ",
          "        |_____|        ",
          "       (__) (__)       ",
        ]), duration: 220 },
        { frame: happyBody, duration: 280 },
      ],
    },
    {
      from: "happy",
      to: "sad",
      steps: [
        { frame: body([
          "       /\\_____/\\       ",
          "      (  -   -  )      ",
          "      |  ●   ●  |      ",
          "      |   ...   |      ",
          "      |  '---'  |      ",
          "       \\       /       ",
          "        |_____|        ",
          "       (__) (__)       ",
        ]), duration: 380 },
      ],
    },
  ],
}

