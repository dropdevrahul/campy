import type { PetState } from "./types"

// The canonical event vocabulary every adapter emits. Hosts translate their own
// lifecycle (tool use, file edits, idle, …) into one of these.
export type CanonicalEvent =
  | "thinking"
  | "file_edited"
  | "command_run"
  | "error"
  | "attached"
  | "idle"

export const CANONICAL_EVENTS: CanonicalEvent[] = [
  "thinking",
  "file_edited",
  "command_run",
  "error",
  "attached",
  "idle",
]

export type EventPayload = {
  file?: string
  cmd?: string
}

// What an event does to the pet: a temporary state override + happiness nudge.
// `idle` is special — it returns the pet to its idle baseline rather than
// overriding for a fixed duration (handled in the runtime).
export type EventReaction = {
  state: PetState
  duration: number
  speech: string
  happiness: number
}

const basename = (p: string): string => {
  const parts = p.split("/")
  return parts[parts.length - 1] || p
}

export const isCanonicalEvent = (name: string): name is CanonicalEvent =>
  (CANONICAL_EVENTS as string[]).includes(name)

// Maps a canonical event to its reaction. Mirrors the OpenCode plugin's
// onMount event handlers so behavior is consistent across every host.
export const reactionFor = (
  event: Exclude<CanonicalEvent, "idle">,
  payload: EventPayload = {}
): EventReaction => {
  switch (event) {
    case "thinking":
      return { state: "excited", duration: 3000, speech: "Thinking...", happiness: 0 }
    case "file_edited": {
      const file = payload.file ? basename(payload.file) : ""
      return {
        state: "eating",
        duration: 4000,
        speech: file ? `Edited ${file}!` : "File saved!",
        happiness: 2,
      }
    }
    case "command_run": {
      const cmd = payload.cmd || ""
      return {
        state: "happy",
        duration: 3000,
        speech: cmd ? `Ran ${cmd}!` : "Done!",
        happiness: 3,
      }
    }
    case "error":
      return { state: "sad", duration: 5000, speech: "Error! Let me help...", happiness: -5 }
    case "attached":
      return { state: "happy", duration: 2000, speech: "I'm here!", happiness: 0 }
  }
}
