import type { PetState, AnimStep, AnimLayer, TransitionAnim, PetAnimations } from "./types"
import { mergeLayers } from "./frame-utils"

export class AnimationEngine {
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
