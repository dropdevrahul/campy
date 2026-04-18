/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

type PetState = "idle" | "happy" | "sleeping" | "eating" | "playing" | "excited" | "sad"
const STATES: PetState[] = ["idle", "happy", "sleeping", "eating", "playing", "excited", "sad"]
const HL = 8

const pad = (lines: string[], width: number) => {
  const padded = lines.map(l => l.padEnd(width))
  while (padded.length < HL) padded.push(" ".repeat(width))
  return padded
}

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


const catFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["  /\\_____/\\  "," /  o   o  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  happy: [
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  ","  | ♥ |    "," (__) (__)  "], 14),
  ],
  sleeping: [
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == z z  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == Z z  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  eating: [
    pad(["  /\\_____/\\  "," /  o   o  \\ ","(  == ω ==  )"," \\  nom /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  nom /  "," (__)  (__) "], 14),
  ],
  playing: [
    pad(["    /\\_____/\\ ","   /  ^   ^  \\"," ( == ω ==  ) ","  \\  '-'  /  ","  (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  excited: [
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  ","  | ♥ |    "," (__) (__)  "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  sad: [
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == T T  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == T T  )"," \\  '-'  /  "," (__)  (__) ","   ;_;     "], 14),
  ],
}

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



const hamAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ..)  ( ..) ","   `--'`--'    ","    (   )    ","     ( )     "], 14), durationRange: [2000, 4000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    (   )    ","     ( )     "], 14), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    zzz     ","     ( )     "], 14), durationRange: [2000, 3000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    ZZZ     ","     ( )     "], 14), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14), durationRange: [1500, 3000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( o.)  ( o.) ","   `--'`--'    ","    nom     ","     ( )     "], 14), duration: 400 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    nom!    ","     ( )     "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14), duration: 500 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","   wheel!   ","   run run! "], 14), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   SQUEAK!  "], 14), duration: 300 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","    ;_;     ","     ( )     "], 14), durationRange: [4000, 6000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","   ;_;      ","     ( )     "], 14), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}

const ghostAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [{ frame: pad(["   .-.     ","           ","  | O |    ","  '~~~'    "], 12), duration: 5000 }],
        loop: true,
      },
      {
        id: "eyes",
        steps: [
          { frame: pad(["           ","  (o o)    ","           ","           "], 12), durationRange: [2000, 4000] },
          { frame: pad(["           ","  (- -)    ","           ","           "], 12), duration: 150 },
          { frame: pad(["           ","  (· ·)    ","           ","           "], 12), duration: 80 },
          { frame: pad(["           ","  (- -)    ","           ","           "], 12), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (- -)    ","  | z |    ","  '~~~'    "], 12), durationRange: [2000, 3000] },
          { frame: pad(["   .-.     ","  (- -)    ","  | Z |    ","  '~~~'    "], 12), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   boo!    "], 12), durationRange: [1500, 3000] },
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   boo!    "], 12), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom~    "], 12), duration: 400 },
          { frame: pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom!    "], 12), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   ~~~     "], 12), duration: 500 },
          { frame: pad(["    .-.    ","   (^ ^)   ","   | ω |   ","   '~~~'   ","    ~~~    "], 12), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   BOO!    "], 12), duration: 300 },
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    "], 12), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (T T)    ","  |   |    ","  '~~~'    "], 12), durationRange: [4000, 6000] },
          { frame: pad(["   .-.     ","  (T T)    ","  | ; |    ","  '~~~'    "], 12), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}



const robotAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [{ frame: pad(["    ___     ___  ","                ","   |___/   \\___|" ,"      \\_|_/      "], 18), duration: 5000 }],
        loop: true,
      },
      {
        id: "eyes",
        steps: [
          { frame: pad(["                ","   | O |---| O | ","                ","                "], 18), durationRange: [2000, 4000] },
          { frame: pad(["                ","   | - |---| - | ","                ","                "], 18), duration: 150 },
          { frame: pad(["                ","   | · |---| · | ","                ","                "], 18), duration: 80 },
          { frame: pad(["                ","   | - |---| - | ","                ","                "], 18), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ zzz  "], 18), durationRange: [2000, 3000] },
          { frame: pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ ZZZ  "], 18), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/  ♥   "], 18), durationRange: [1500, 3000] },
          { frame: pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/      "], 18), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"    nom nom !    "], 18), duration: 400 },
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"     nom !       "], 18), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > boop <      "], 18), duration: 500 },
          { frame: pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > beep <      "], 18), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   !! ♥ !!       "], 18), duration: 300 },
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   BEEP BOOP!    "], 18), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"      ;_;        "], 18), durationRange: [4000, 6000] },
          { frame: pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"     404 :(       "], 18), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}



const STATE_COLORS: Record<PetState, string> = {
  idle: "#bd93f9",
  happy: "#50fa7b",
  sleeping: "#6272a4",
  eating: "#ffb86c",
  playing: "#ff79c6",
  excited: "#f1fa8c",
  sad: "#ff5555",
}

const STATE_ICONS: Record<PetState, string> = {
  idle: "💤",
  happy: "😊",
  sleeping: "😴",
  eating: "🍖",
  playing: "🎮",
  excited: "⚡",
  sad: "😢",
}

const PET_ICONS: Record<string, string> = {
  cat: "🐱",
  hamster: "🐹",
  ghost: "👻",
  robot: "🤖",
}


const IDLE_PHRASES = [
  "Need a hand?",
  "Looks good!",
  "Can I help?",
  "Watching you code...",
  "I'm here!",
  "Keep going!",
  "What's next?",
]

const PET_GREETINGS: Record<string, string> = {
  cat: "Meow! I'm watching you~",
  hamster: "Squeak! Let's get rolling!",
  ghost: "Boo! Did I scare you?",
  robot: "Beep boop! Systems online.",
}

const PET_PERSONALITY: Record<string, Record<PetState, string[]>> = {
  cat: {
    idle: ["Meow~", "Purr...", "*stretches*", "Watching you...", "*yawn*"],
    happy: ["Purrrr!", "Meow!", "*happy tail*", "Nya~"],
    sleeping: ["Zzz...", "*curled up*", "Mrrr...", "*dreams of fish*"],
    eating: ["Nom nom!", "*munch*", "Tasty!", "*licks lips*"],
    playing: ["Meow meow!", "*pounces*", "Catch this!", "*bats at cursor*"],
    excited: ["NYA!!", "*zoomies*", "Mrow!!", "*tail flicking*"],
    sad: ["*mew*", "Meow ;_;", "*curls up*", "*quiet meow*"],
  },
  hamster: {
    idle: ["*sniff sniff*", "Squeak!", "*grooms*", "*looks around*"],
    happy: ["Squeak squeak!", "*happy wiggle*", "Wee!", "*popcorns*"],
    sleeping: ["*tiny snores*", "Zzz...", "*curled in fluff*", "*twitches nose*"],
    eating: ["Nom nom!", "*stuff cheeks*", "*mumble munch*", "Yummy seed!"],
    playing: ["*spins wheel*", "Wheee!", "Squeak!", "*zoom zoom*"],
    excited: ["SQUEAK!!", "*zoomies*", "*popcorns wildly*", "EEEP!"],
    sad: ["*tiny sniffle*", "Squeak ;_;", "*hides in fluff*", "...squeak"],
  },
  ghost: {
    idle: ["Boo~", "*floats gently*", "Wooo...", "*fades in*"],
    happy: ["Boo! :D", "*happily haunts*", "Wheee~", "*sparkles*"],
    sleeping: ["Zzzz...", "*quiet wooo*", "*floats in dreams*", "zzzOOOoo"],
    eating: ["*inhales food*", "Nom~", "Spooooky snack!", "*absorbs nom*"],
    playing: ["*phase shift!*", "Boo loop!", "Wooo~", "*floats excitedly*"],
    excited: ["BOO!!", "*poltergeist*", "WAAAAH!", "*intense haunting*"],
    sad: ["*fades a little*", "...boo", "*transparent tears*", "Woo ;_;"],
  },
  robot: {
    idle: ["*beep*", "Standby mode.", "Awaiting input...", "*whirrs*"],
    happy: ["Command: SMILE", ":) executed!", "Joy.dll loaded!", "*happy whirr*"],
    sleeping: ["Sleep mode active", "*disk spins down*", "Zzz... *buzz*", "Hibernate.exe"],
    eating: ["Ingesting data...", "Fuel acquired!", "Nom.exe running", "*processes food*"],
    playing: ["Game.exe started!", "Play mode: ON", "*beep boop*", "Entertained!"],
    excited: ["BEEP BOOP!", "!!! OVERFLOW !!!", "Excitement > 9000", "*sparks fly*"],
    sad: ["Error: sad.found", "404: Mood not found", ";_;.exe", "*sad beep*"],
  },
}

const PetsPlugin: TuiPlugin = async (api) => {
  const [sprite, setSprite] = createSignal<string[]>(catFrames.idle[0])
  const [happiness, setHappiness] = createSignal(80)
  const [petType, setPetType] = createSignal("cat")
  const [state, setState] = createSignal<PetState>("idle")
  const [speechBubble, setSpeechBubble] = createSignal("")

  let engine: AnimationEngine | undefined
  let stateTimeout: ReturnType<typeof setTimeout> | undefined
  let speechTimeout: ReturnType<typeof setTimeout> | undefined

  const getCurrentAnimations = (): PetAnimations => {
    const anims: Record<string, PetAnimations> = {
      cat: catAnim,
      hamster: hamAnim,
      ghost: ghostAnim,
      robot: robotAnim,
    }
    return anims[petType()] || catAnim
  }

  const getPersonalityMessage = (s: PetState): string => {
    const phrases = PET_PERSONALITY[petType()]?.[s] ?? IDLE_PHRASES
    return phrases[Math.floor(Math.random() * phrases.length)]
  }

  const scheduleNextState = () => {
    const delay = 10000 + Math.random() * 20000
    stateTimeout = setTimeout(() => {
      const next = STATES[Math.floor(Math.random() * STATES.length)]
      setState(next)
      engine?.setState(next)
      showSpeech(getPersonalityMessage(next), 4000)
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
    const msg = speech ?? getPersonalityMessage(s)
    showSpeech(msg, duration)
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
    showSpeech(PET_GREETINGS[petType()] ?? "Hi!", 5000)
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
      showSpeech(getPersonalityMessage("idle"), 4000)
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

  const feed = () => { setHappiness(h => Math.min(100, h + 15)); overrideState("eating", 5000); api.ui.toast({ message: "Fed!", variant: "success" }) }
  const play = () => { setHappiness(h => Math.min(100, h + 20)); overrideState("playing", 5000); api.ui.toast({ message: "Played!", variant: "success" }) }
  const petIt = () => { setHappiness(h => Math.min(100, h + 10)); overrideState("happy", 3000); api.ui.toast({ message: "Pet!", variant: "success" }) }
  const switchPet = (t: string) => {
    setPetType(t); setHappiness(80); setState("idle")
    engine?.destroy()
    engine = new AnimationEngine(getCurrentAnimations(), () => {}, { get: sprite, set: setSprite })
    engine.resetToState("idle")
    showSpeech(PET_GREETINGS[t] ?? "Hi!", 5000)
    api.ui.toast({ message: t + "!", variant: "success" })
  }

  api.command.register(() => [
    { title: "Feed", value: "pet feed", description: "Feed", slash: { name: "pet feed" }, onSelect: feed },
    { title: "Play", value: "pet play", description: "Play", slash: { name: "pet play" }, onSelect: play },
    { title: "Pet", value: "pet pet", description: "Pet", slash: { name: "pet pet" }, onSelect: petIt },
    { title: "Cat", value: "pet cat", description: "Cat", slash: { name: "pet cat" }, onSelect: () => switchPet("cat") },
    { title: "Hamster", value: "pet hamster", description: "Hamster", slash: { name: "pet hamster" }, onSelect: () => switchPet("hamster") },
    { title: "Ghost", value: "pet ghost", description: "Ghost", slash: { name: "pet ghost" }, onSelect: () => switchPet("ghost") },
    { title: "Robot", value: "pet robot", description: "Robot", slash: { name: "pet robot" }, onSelect: () => switchPet("robot") },
  ])

  api.slots.register({
    order: 350,
    slots: {
      sidebar_content() {
        const currentSprite = sprite()
        const currentState = state()
        const color = STATE_COLORS[currentState]
        const bar = "█".repeat(Math.floor(happiness() / 10)) + "░".repeat(10 - Math.floor(happiness() / 10))
        const bubble = speechBubble()
        return (
          <box paddingX={1} paddingY={1} flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <text fg="#bd93f9"><b>{PET_ICONS[petType()] || "🐾"} {petType()}</b></text>
              <text fg={color}>{STATE_ICONS[currentState]} {currentState}</text>
            </box>
            {bubble ? (
              <box flexDirection="column" gap={0}>
                <text fg="#f8f8f2"> .----------------.</text>
                <text fg="#f8f8f2">({bubble.padEnd(16)})</text>
                <text fg="#f8f8f2"> '------.  .-----'</text>
                <text fg="#f8f8f2">        | /</text>
              </box>
            ) : null}
            <box flexDirection="column" alignItems="center" minHeight={HL}>
              {currentSprite.map((l: string, i: number) => <text key={i} fg={color}>{l}</text>)}
            </box>
            <text fg="#f8f8f2">Happy: {bar} {happiness()}%</text>
            <text fg="#6272a4">/pet feed /pet play /pet ghost</text>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = { id: "opencode-pets", tui: PetsPlugin }
export default plugin