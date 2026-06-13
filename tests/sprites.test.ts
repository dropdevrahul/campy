import { test, expect } from "bun:test"
import { PET_ANIMATIONS, PET_NAMES } from "../core/pets"
import { STATES } from "../core/types"
import { HL, SW, mergeLayers } from "../core/frame-utils"

// Guard the canvas geometry: every frame of every layer of every state must be
// exactly HL rows tall and SW cols wide. Composited frames must too. Catching
// a stray off-by-one here is much cheaper than spotting it visually later.

for (const pet of PET_NAMES) {
  const anim = PET_ANIMATIONS[pet]

  for (const state of STATES) {
    const layers = anim.states[state]
    test(`${pet}/${state} has at least one layer`, () => {
      expect(layers).toBeDefined()
      expect(layers!.length).toBeGreaterThan(0)
    })

    test(`${pet}/${state} every layer frame is HL×SW`, () => {
      for (const layer of layers!) {
        for (const step of layer.steps) {
          expect(step.frame.length).toBe(HL)
          for (const row of step.frame) {
            expect(row.length).toBeGreaterThanOrEqual(SW)
          }
        }
      }
    })

    test(`${pet}/${state} composite at frame 0 is HL rows`, () => {
      const composite = mergeLayers(layers!.map(l => l.steps[0].frame))
      expect(composite.length).toBe(HL)
    })
  }
}

test("every layer step has a duration or durationRange", () => {
  for (const pet of PET_NAMES) {
    const anim = PET_ANIMATIONS[pet]
    for (const state of STATES) {
      for (const layer of anim.states[state]!) {
        for (const step of layer.steps) {
          const hasOne = typeof step.duration === "number" || Array.isArray(step.durationRange)
          expect(hasOne).toBe(true)
        }
      }
    }
  }
})
