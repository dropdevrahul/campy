#!/usr/bin/env bun
import { PET_ANIMATIONS, PET_NAMES } from "../core/pets"
import { STATES } from "../core/types"
import { mergeLayers } from "../core/frame-utils"

// Render the first-frame composite of every (pet × state) so we can eyeball
// the silhouette without spinning up the animation engine.

for (const pet of PET_NAMES) {
  const anim = PET_ANIMATIONS[pet]
  for (const state of STATES) {
    const layers = anim.states[state]
    if (!layers) continue
    const composite = mergeLayers(layers.map(l => l.steps[0].frame))
    process.stdout.write(`\n== ${pet} / ${state} ==\n`)
    process.stdout.write(composite.join("\n") + "\n")
  }
}
