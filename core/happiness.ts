export const HAPPINESS_MIN = 0
export const HAPPINESS_MAX = 100
export const DEFAULT_HAPPINESS = 80

export const clamp = (value: number, min = HAPPINESS_MIN, max = HAPPINESS_MAX): number =>
  Math.max(min, Math.min(max, value))

// Happiness gained from direct interactions (matches the OpenCode plugin & README).
export const INTERACTION_DELTA = {
  feed: 15,
  play: 20,
  pet: 10,
} as const

export type Interaction = keyof typeof INTERACTION_DELTA

// Rendered happiness meter, e.g. "████████░░ 80%".
export const meterBar = (value: number, width = 10): string => {
  const filled = Math.round(clamp(value) * width / HAPPINESS_MAX)
  return "█".repeat(filled) + "░".repeat(width - filled)
}
