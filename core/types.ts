export type PetState = "idle" | "happy" | "sleeping" | "eating" | "playing" | "excited" | "sad"
export const STATES: PetState[] = ["idle", "happy", "sleeping", "eating", "playing", "excited", "sad"]

export type AnimStep = {
  frame: string[]
  duration?: number
  durationRange?: [number, number]
}

export type AnimLayer = {
  id: string
  steps: AnimStep[]
  loop: boolean
}

export type TransitionAnim = {
  from: PetState | "*"
  to: PetState
  steps: AnimStep[]
}

export type PetAnimations = {
  states: Record<PetState, AnimLayer[]>
  transitions?: TransitionAnim[]
}

export type FrameData = { frames: string[][]; durations: number[] }
