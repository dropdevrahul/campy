import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { existsSync, unlinkSync } from "node:fs"

import { reactionFor, isCanonicalEvent } from "../core/events"
import { clamp, meterBar, HAPPINESS_MIN, HAPPINESS_MAX, DEFAULT_HAPPINESS } from "../core/happiness"
import { readState, writeState, mutateState, DEFAULT_STATE } from "../core/store"
import type { PetStoreState } from "../core/store"
import { PET_ANIMATIONS, PET_NAMES } from "../core/pets"
import { PET_ICONS } from "../core/theme"
import { PET_GREETINGS, PET_PERSONALITY } from "../core/personality"
import { STATES } from "../core/types"

// ---- events ----------------------------------------------------------------

describe("isCanonicalEvent", () => {
  test("accepts all canonical event names", () => {
    expect(isCanonicalEvent("thinking")).toBe(true)
    expect(isCanonicalEvent("file_edited")).toBe(true)
    expect(isCanonicalEvent("command_run")).toBe(true)
    expect(isCanonicalEvent("error")).toBe(true)
    expect(isCanonicalEvent("attached")).toBe(true)
    expect(isCanonicalEvent("idle")).toBe(true)
  })

  test("rejects unknown event names", () => {
    expect(isCanonicalEvent("unknown")).toBe(false)
    expect(isCanonicalEvent("file_saved")).toBe(false)
    expect(isCanonicalEvent("")).toBe(false)
    expect(isCanonicalEvent("THINKING")).toBe(false)
  })
})

describe("reactionFor", () => {
  test("thinking → excited state, 0 happiness delta", () => {
    const r = reactionFor("thinking")
    expect(r.state).toBe("excited")
    expect(r.happiness).toBe(0)
    expect(r.speech).toBe("Thinking...")
    expect(r.duration).toBe(3000)
  })

  test("file_edited → eating state, +2 happiness, speech includes basename", () => {
    const r = reactionFor("file_edited", { file: "/home/user/project/core/engine.ts" })
    expect(r.state).toBe("eating")
    expect(r.happiness).toBe(2)
    expect(r.speech).toBe("Edited engine.ts!")
    expect(r.duration).toBe(4000)
  })

  test("file_edited with no file → generic speech", () => {
    const r = reactionFor("file_edited", {})
    expect(r.state).toBe("eating")
    expect(r.speech).toBe("File saved!")
  })

  test("file_edited basename extraction strips path correctly", () => {
    const r1 = reactionFor("file_edited", { file: "README.md" })
    expect(r1.speech).toBe("Edited README.md!")

    const r2 = reactionFor("file_edited", { file: "/a/b/c/deep.ts" })
    expect(r2.speech).toBe("Edited deep.ts!")
  })

  test("command_run → happy state, +3 happiness, speech includes cmd", () => {
    const r = reactionFor("command_run", { cmd: "npm" })
    expect(r.state).toBe("happy")
    expect(r.happiness).toBe(3)
    expect(r.speech).toBe("Ran npm!")
    expect(r.duration).toBe(3000)
  })

  test("command_run with no cmd → generic speech", () => {
    const r = reactionFor("command_run", {})
    expect(r.speech).toBe("Done!")
  })

  test("error → sad state, -5 happiness", () => {
    const r = reactionFor("error")
    expect(r.state).toBe("sad")
    expect(r.happiness).toBe(-5)
    expect(r.speech).toBe("Error! Let me help...")
    expect(r.duration).toBe(5000)
  })

  test("attached → happy state, 0 happiness delta", () => {
    const r = reactionFor("attached")
    expect(r.state).toBe("happy")
    expect(r.happiness).toBe(0)
    expect(r.speech).toBe("I'm here!")
  })
})

// ---- happiness -------------------------------------------------------------

describe("clamp", () => {
  test("values within range pass through unchanged", () => {
    expect(clamp(0)).toBe(0)
    expect(clamp(50)).toBe(50)
    expect(clamp(100)).toBe(100)
    expect(clamp(DEFAULT_HAPPINESS)).toBe(DEFAULT_HAPPINESS)
  })

  test("clamps values below minimum to HAPPINESS_MIN", () => {
    expect(clamp(-1)).toBe(HAPPINESS_MIN)
    expect(clamp(-100)).toBe(HAPPINESS_MIN)
  })

  test("clamps values above maximum to HAPPINESS_MAX", () => {
    expect(clamp(101)).toBe(HAPPINESS_MAX)
    expect(clamp(999)).toBe(HAPPINESS_MAX)
  })

  test("boundary values are kept", () => {
    expect(clamp(HAPPINESS_MIN)).toBe(HAPPINESS_MIN)
    expect(clamp(HAPPINESS_MAX)).toBe(HAPPINESS_MAX)
  })
})

describe("meterBar", () => {
  test("full happiness gives all filled blocks", () => {
    const bar = meterBar(100, 10)
    expect(bar).toBe("██████████")
  })

  test("zero happiness gives all empty blocks", () => {
    const bar = meterBar(0, 10)
    expect(bar).toBe("░░░░░░░░░░")
  })

  test("50% happiness gives half filled", () => {
    const bar = meterBar(50, 10)
    expect(bar).toBe("█████░░░░░")
  })

  test("80% happiness with default width=10", () => {
    const bar = meterBar(80)
    expect(bar).toBe("████████░░")
    expect(bar.length).toBe(10)
  })

  test("custom width respected", () => {
    const bar = meterBar(100, 5)
    expect(bar).toBe("█████")
    expect(bar.length).toBe(5)
  })

  test("values are clamped before rendering", () => {
    expect(meterBar(200, 10)).toBe("██████████")
    expect(meterBar(-50, 10)).toBe("░░░░░░░░░░")
  })
})

// ---- store -----------------------------------------------------------------

describe("store round-trip", () => {
  let statePath: string

  beforeEach(() => {
    statePath = join(tmpdir(), `campy-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
    process.env.CAMPY_STATE = statePath
  })

  afterEach(() => {
    delete process.env.CAMPY_STATE
    if (existsSync(statePath)) unlinkSync(statePath)
  })

  test("readState returns defaults when file does not exist", () => {
    const state = readState(statePath)
    expect(state.pet).toBe(DEFAULT_STATE.pet)
    expect(state.mood).toBe(DEFAULT_STATE.mood)
    expect(state.happiness).toBe(DEFAULT_STATE.happiness)
  })

  test("writeState then readState round-trips the full object", () => {
    const written: PetStoreState = {
      pet: "hamster",
      mood: "eating",
      happiness: 65,
      speech: "Nom nom!",
      speech_until: Date.now() + 5000,
      updated_at: Date.now(),
    }
    writeState(written, statePath)
    const read = readState(statePath)
    expect(read.pet).toBe(written.pet)
    expect(read.mood).toBe(written.mood)
    expect(read.happiness).toBe(written.happiness)
    expect(read.speech).toBe(written.speech)
  })

  test("readState tolerates a partial/missing-key file by merging defaults", () => {
    // Write only a subset of keys
    const { writeFileSync } = require("node:fs")
    writeFileSync(statePath, JSON.stringify({ pet: "ghost" }), "utf8")
    const state = readState(statePath)
    expect(state.pet).toBe("ghost")
    expect(state.mood).toBe(DEFAULT_STATE.mood)
    expect(state.happiness).toBe(DEFAULT_STATE.happiness)
  })

  test("readState clamps out-of-range happiness in file", () => {
    const { writeFileSync } = require("node:fs")
    writeFileSync(statePath, JSON.stringify({ happiness: 999 }), "utf8")
    const state = readState(statePath)
    expect(state.happiness).toBe(HAPPINESS_MAX)

    writeFileSync(statePath, JSON.stringify({ happiness: -50 }), "utf8")
    const state2 = readState(statePath)
    expect(state2.happiness).toBe(HAPPINESS_MIN)
  })

  test("readState returns defaults for corrupt/non-JSON file", () => {
    const { writeFileSync } = require("node:fs")
    writeFileSync(statePath, "not-json!!", "utf8")
    const state = readState(statePath)
    expect(state.pet).toBe(DEFAULT_STATE.pet)
    expect(state.mood).toBe(DEFAULT_STATE.mood)
  })

  test("mutateState atomically applies transform and updates updated_at", () => {
    const before = Date.now()
    const result = mutateState(
      s => ({ ...s, mood: "excited", speech: "Wow!", speech_until: Date.now() + 1000 }),
      statePath
    )
    const after = Date.now()
    expect(result.mood).toBe("excited")
    expect(result.speech).toBe("Wow!")
    expect(result.updated_at).toBeGreaterThanOrEqual(before)
    expect(result.updated_at).toBeLessThanOrEqual(after)

    // Also confirm reading back from file gives same result
    const onDisk = readState(statePath)
    expect(onDisk.mood).toBe("excited")
  })

  test("mutateState clamps happiness via core/happiness.clamp", () => {
    const result = mutateState(
      s => ({ ...s, happiness: 200 }),
      statePath
    )
    expect(result.happiness).toBe(HAPPINESS_MAX)
  })
})

// ---- new pets registered ---------------------------------------------------

describe("new pets registered", () => {
  const NEW_PETS = ["dragon", "turtle", "panda", "dog"]

  test("all four new pets are in PET_NAMES and PET_ANIMATIONS", () => {
    expect(PET_NAMES.length).toBe(8)
    for (const pet of NEW_PETS) {
      expect(PET_NAMES).toContain(pet)
      expect(PET_ANIMATIONS[pet]).toBeTruthy()
    }
  })

  test("each new pet has all 7 PetState keys in PET_ANIMATIONS with non-empty AnimLayer[]", () => {
    for (const pet of NEW_PETS) {
      for (const s of STATES) {
        const layers = PET_ANIMATIONS[pet]?.states[s]
        expect(layers).toBeTruthy()
        expect(layers!.length).toBeGreaterThan(0)
      }
    }
  })

  test("each new pet has a truthy PET_ICONS entry", () => {
    for (const pet of NEW_PETS) {
      expect(PET_ICONS[pet]).toBeTruthy()
    }
  })

  test("each new pet has a truthy PET_GREETINGS entry", () => {
    for (const pet of NEW_PETS) {
      expect(PET_GREETINGS[pet]).toBeTruthy()
    }
  })

  test("each new pet has PET_PERSONALITY entries for all 7 states with non-empty string[]", () => {
    for (const pet of NEW_PETS) {
      for (const s of STATES) {
        const phrases = PET_PERSONALITY[pet]?.[s]
        expect(phrases).toBeTruthy()
        expect(phrases!.length).toBeGreaterThan(0)
      }
    }
  })
})
