import type { PetState, AnimLayer } from "../types"
import { padAt, SW } from "../frame-utils"

// Particle/aura layers that sit *above* the pet body. Each state gets its own
// signature effect so mood changes read instantly: sparkles for happy, drifting
// z's for sleeping, hearts for petted/excited, crumbs for eating, droplets for
// sad. Idle gets a rare twinkle so it never feels totally static.

const auraRow = (top: string, mid: string): string[] => [top, mid]

const auraLayer = (id: string, frames: string[][], duration: number, loop = true): AnimLayer => ({
  id,
  steps: frames.map(f => ({ frame: padAt(f, 0, SW), duration })),
  loop,
})

// Generate a band of particles that drift horizontally so the eye sees motion.
const driftFrames = (chars: string[], cols: number[]): string[][] => {
  const frames: string[][] = []
  const w = SW
  const positions = cols
  // Two-row animation: each "frame" shifts particles slightly so the band
  // feels alive without dominating the pet.
  for (let phase = 0; phase < 4; phase++) {
    let top = " ".repeat(w).split("")
    let mid = " ".repeat(w).split("")
    positions.forEach((c, i) => {
      const ch = chars[(i + phase) % chars.length]
      const row = (phase + i) % 2 === 0 ? top : mid
      const col = (c + phase) % w
      row[col] = ch
    })
    frames.push(auraRow(top.join(""), mid.join("")))
  }
  return frames
}

export const auraFor = (state: PetState): AnimLayer | null => {
  switch (state) {
    case "happy":
      return auraLayer("aura-happy", driftFrames(["✦", "·", "✧", "·"], [3, 9, 15, 19]), 350)
    case "excited":
      return auraLayer("aura-excited", driftFrames(["♥", "*", "♥", "*"], [4, 8, 12, 16, 20]), 250)
    case "sleeping":
      return auraLayer("aura-sleep", [
        padAt(["  z              Z    ", "      Z      z       "], 0, SW),
        padAt(["    Z              z  ", "  z      Z           "], 0, SW),
        padAt(["       z      Z       ", "    Z       z       Z"], 0, SW),
      ], 800)
    case "eating":
      return auraLayer("aura-eat", driftFrames(["·", "˙", "·", "˙"], [7, 11, 13, 17]), 200)
    case "sad":
      return auraLayer("aura-sad", [
        padAt(["   '   '    '   '     ", "  '   '       '       "], 0, SW),
        padAt(["       '   '    '     ", "    '       '    '    "], 0, SW),
      ], 600)
    case "playing":
      return auraLayer("aura-play", driftFrames(["*", "✦", "·", "*"], [2, 8, 14, 20]), 200)
    case "idle":
    default:
      // A single very-rare twinkle so the head-space doesn't sit dead.
      return auraLayer("aura-idle", [
        padAt(["                      ", "                      "], 0, SW),
        padAt(["          ·           ", "                      "], 0, SW),
        padAt(["                      ", "                      "], 0, SW),
      ], 1800)
  }
}

// A subtle ground shadow that pulses with the body's idle breathing. Sits at
// the bottom of the canvas (HL-1).
export const groundShadow = (id = "shadow"): AnimLayer => ({
  id,
  steps: [
    { frame: padAt(["     ▁▁▁▁▁▁▁▁▁▁▁▁     "], 11, SW), duration: 1400 },
    { frame: padAt(["      ▁▁▁▁▁▁▁▁▁▁      "], 11, SW), duration: 1400 },
  ],
  loop: true,
})
