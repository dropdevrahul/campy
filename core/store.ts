import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import type { PetState } from "./types"
import { clamp, DEFAULT_HAPPINESS } from "./happiness"

// The state-file bus. Short-lived hooks mutate this file; long-lived renderers
// (the watcher, a statusline, an in-process adapter) read it. See
// docs/superpowers/specs/2026-06-13-cli-agent-support-design.md.
export type PetStoreState = {
  pet: string
  mood: PetState
  happiness: number
  speech: string
  speech_until: number
  updated_at: number
}

export const DEFAULT_STATE: PetStoreState = {
  pet: "cat",
  mood: "idle",
  happiness: DEFAULT_HAPPINESS,
  speech: "",
  speech_until: 0,
  updated_at: 0,
}

export const statePath = (): string =>
  process.env.CAMPY_STATE || join(homedir(), ".campy", "state.json")

export const readState = (path = statePath()): PetStoreState => {
  try {
    if (!existsSync(path)) return { ...DEFAULT_STATE }
    const raw = JSON.parse(readFileSync(path, "utf8"))
    // Tolerate partial / older files by merging over defaults.
    return {
      ...DEFAULT_STATE,
      ...raw,
      happiness: clamp(typeof raw.happiness === "number" ? raw.happiness : DEFAULT_HAPPINESS),
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

// Atomic write: temp file + rename, so a reader never sees a torn JSON document
// when a hook and the watcher race.
export const writeState = (state: PetStoreState, path = statePath()): void => {
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(state), "utf8")
  renameSync(tmp, path)
}

export const mutateState = (
  fn: (state: PetStoreState) => PetStoreState,
  path = statePath()
): PetStoreState => {
  const next = fn(readState(path))
  next.happiness = clamp(next.happiness)
  next.updated_at = Date.now()
  writeState(next, path)
  return next
}

export const speechActive = (state: PetStoreState, now = Date.now()): boolean =>
  state.speech.length > 0 && state.speech_until > now
