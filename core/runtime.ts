import type { PetState } from "./types"
import { AnimationEngine } from "./animation-engine"
import { getAnimations } from "./pets"
import { STATE_COLORS, STATE_ICONS, PET_ICONS } from "./theme"
import { greeting, personalityMessage } from "./personality"
import { clamp, DEFAULT_HAPPINESS, INTERACTION_DELTA, type Interaction } from "./happiness"
import {
  reactionFor,
  type CanonicalEvent,
  type EventPayload,
} from "./events"

// A snapshot of everything a host needs to draw the pet.
export type PetView = {
  pet: string
  state: PetState
  happiness: number
  speech: string
  sprite: string[]
  color: string
  stateIcon: string
  petIcon: string
}

export type NotifyVariant = "success" | "info" | "warning" | "error"

export type PetRuntimeOptions = {
  pet?: string
  happiness?: number
  // Called whenever the visible pet changes (new frame, state, or speech).
  onRender?: (view: PetView) => void
  // Optional host toast/notification (interactions call this).
  onNotify?: (message: string, variant: NotifyVariant) => void
  // Auto-cycle through random states when idle (the ambient "alive" behavior).
  // Disable for hosts that drive state purely from events.
  idleScheduler?: boolean
  random?: () => number
}

/**
 * Host-agnostic pet state machine + animation driver. This is the logic that
 * used to live inside the OpenCode `PetsPlugin` Solid component, lifted out so
 * the OpenCode sidebar, the Pi TUI widget, and the CLI watcher all share it.
 *
 * The host supplies `onRender` (draw) and optionally `onNotify` (toast); the
 * runtime owns the engine, the idle scheduler, speech bubbles, and the mapping
 * from canonical events to state overrides.
 */
export class PetRuntime {
  private engine: AnimationEngine | undefined
  private sprite: string[] = []
  private petType: string
  private state: PetState = "idle"
  private happiness: number
  private speech = ""

  private stateTimeout: ReturnType<typeof setTimeout> | undefined
  private speechTimeout: ReturnType<typeof setTimeout> | undefined

  private readonly onRender?: (view: PetView) => void
  private readonly onNotify?: (message: string, variant: NotifyVariant) => void
  private readonly useIdleScheduler: boolean
  private readonly random: () => number
  private destroyed = false

  constructor(opts: PetRuntimeOptions = {}) {
    this.petType = opts.pet ?? "cat"
    this.happiness = clamp(opts.happiness ?? DEFAULT_HAPPINESS)
    this.onRender = opts.onRender
    this.onNotify = opts.onNotify
    this.useIdleScheduler = opts.idleScheduler ?? true
    this.random = opts.random ?? Math.random
  }

  // ---- lifecycle -------------------------------------------------------

  start(): void {
    this.buildEngine()
    this.engine?.resetToState("idle")
    this.showSpeech(greeting(this.petType), 5000)
    this.scheduleNextState()
  }

  destroy(): void {
    this.destroyed = true
    this.engine?.destroy()
    if (this.stateTimeout) clearTimeout(this.stateTimeout)
    if (this.speechTimeout) clearTimeout(this.speechTimeout)
  }

  private buildEngine(): void {
    this.engine?.destroy()
    this.engine = new AnimationEngine(
      getAnimations(this.petType),
      () => this.emit(),
      { get: () => this.sprite, set: (v) => { this.sprite = v } }
    )
  }

  // ---- rendering -------------------------------------------------------

  view(): PetView {
    return {
      pet: this.petType,
      state: this.state,
      happiness: this.happiness,
      speech: this.speech,
      sprite: this.sprite,
      color: STATE_COLORS[this.state],
      stateIcon: STATE_ICONS[this.state],
      petIcon: PET_ICONS[this.petType] || "🐾",
    }
  }

  private emit(): void {
    if (this.destroyed) return
    this.onRender?.(this.view())
  }

  // ---- speech & scheduling --------------------------------------------

  private personalityFor(state: PetState): string {
    return personalityMessage(this.petType, state, this.random)
  }

  showSpeech(text: string, duration = 5000): void {
    if (this.speechTimeout) clearTimeout(this.speechTimeout)
    this.speech = text
    this.emit()
    this.speechTimeout = setTimeout(() => {
      this.speech = ""
      this.emit()
    }, duration)
  }

  private scheduleNextState(): void {
    if (!this.useIdleScheduler || this.destroyed) return
    const delay = 10000 + this.random() * 20000
    this.stateTimeout = setTimeout(() => {
      const states: PetState[] = ["idle", "happy", "sleeping", "eating", "playing", "excited", "sad"]
      const next = states[Math.floor(this.random() * states.length)]
      this.state = next
      this.engine?.setState(next)
      this.showSpeech(this.personalityFor(next), 4000)
      this.scheduleNextState()
    }, delay)
  }

  // Temporarily force a state, show speech, then drop back to idle.
  overrideState(state: PetState, duration: number, speech?: string): void {
    if (this.stateTimeout) clearTimeout(this.stateTimeout)
    this.state = state
    this.engine?.setState(state)
    this.showSpeech(speech ?? this.personalityFor(state), duration)
    this.stateTimeout = setTimeout(() => {
      this.state = "idle"
      this.engine?.setState("idle")
      this.scheduleNextState()
    }, duration)
  }

  private goIdle(): void {
    if (this.stateTimeout) clearTimeout(this.stateTimeout)
    this.state = "idle"
    this.engine?.resetToState("idle")
    this.showSpeech(this.personalityFor("idle"), 4000)
    this.scheduleNextState()
  }

  // ---- canonical events (from any host adapter) ------------------------

  handleEvent(event: CanonicalEvent, payload: EventPayload = {}): void {
    if (event === "idle") {
      this.goIdle()
      return
    }
    const r = reactionFor(event, payload)
    if (r.happiness) this.happiness = clamp(this.happiness + r.happiness)
    this.overrideState(r.state, r.duration, r.speech)
  }

  // ---- interactions ----------------------------------------------------

  private interact(kind: Interaction, state: PetState, duration: number, toast: string): void {
    this.happiness = clamp(this.happiness + INTERACTION_DELTA[kind])
    this.overrideState(state, duration)
    this.onNotify?.(toast, "success")
  }

  feed(): void { this.interact("feed", "eating", 5000, "Fed!") }
  play(): void { this.interact("play", "playing", 5000, "Played!") }
  pet(): void { this.interact("pet", "happy", 3000, "Pet!") }

  sleep(): void {
    if (this.stateTimeout) clearTimeout(this.stateTimeout)
    this.state = "sleeping"
    this.engine?.setState("sleeping")
    this.showSpeech(this.personalityFor("sleeping"), 6000)
  }

  wake(): void { this.goIdle() }

  switchPet(pet: string): void {
    this.petType = pet
    this.happiness = DEFAULT_HAPPINESS
    this.state = "idle"
    this.buildEngine()
    this.engine?.resetToState("idle")
    this.showSpeech(greeting(pet), 5000)
    this.onNotify?.(`${pet}!`, "success")
  }

  // ---- accessors -------------------------------------------------------

  get currentPet(): string { return this.petType }
  get currentState(): PetState { return this.state }
  get currentHappiness(): number { return this.happiness }
}
