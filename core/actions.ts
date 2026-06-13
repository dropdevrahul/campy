import { mutateState, type PetStoreState } from "./store"
import { reactionFor, type CanonicalEvent, type EventPayload } from "./events"
import { INTERACTION_DELTA, DEFAULT_HAPPINESS, type Interaction } from "./happiness"
import { personalityMessage } from "./personality"
import type { PetState } from "./types"

// Store-side actions shared by every out-of-process surface (the CLI, the MCP
// server, hooks). These mutate the state-file bus; long-lived renderers
// (`campy watch`, statuslines) react. No animation engine involved.

export const applyEvent = (event: CanonicalEvent, payload: EventPayload = {}): PetStoreState =>
  mutateState(s => {
    if (event === "idle") {
      return { ...s, mood: "idle", speech: personalityMessage(s.pet, "idle"), speech_until: Date.now() + 4000 }
    }
    const r = reactionFor(event, payload)
    return {
      ...s,
      mood: r.state,
      happiness: s.happiness + r.happiness,
      speech: r.speech,
      speech_until: Date.now() + r.duration,
    }
  })

const INTERACTION: Record<Interaction, { mood: PetState; speech: string; duration: number }> = {
  feed: { mood: "eating", speech: "Nom nom!", duration: 5000 },
  play: { mood: "playing", speech: "Wheee!", duration: 5000 },
  pet: { mood: "happy", speech: "Purr...", duration: 3000 },
}

export const applyInteraction = (kind: Interaction): PetStoreState =>
  mutateState(s => ({
    ...s,
    mood: INTERACTION[kind].mood,
    happiness: s.happiness + INTERACTION_DELTA[kind],
    speech: INTERACTION[kind].speech,
    speech_until: Date.now() + INTERACTION[kind].duration,
  }))

export const applySleep = (): PetStoreState =>
  mutateState(s => ({ ...s, mood: "sleeping", speech: personalityMessage(s.pet, "sleeping"), speech_until: Date.now() + 6000 }))

export const applyWake = (): PetStoreState =>
  mutateState(s => ({ ...s, mood: "idle", speech: "", speech_until: 0 }))

export const applySwitch = (pet: string): PetStoreState =>
  mutateState(s => ({ ...s, pet, happiness: DEFAULT_HAPPINESS, mood: "idle", speech: "", speech_until: 0 }))
