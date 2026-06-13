import type { PetState } from "./types"

export const STATE_COLORS: Record<PetState, string> = {
  idle: "#bd93f9",
  happy: "#50fa7b",
  sleeping: "#6272a4",
  eating: "#ffb86c",
  playing: "#ff79c6",
  excited: "#f1fa8c",
  sad: "#ff5555",
}

export const STATE_ICONS: Record<PetState, string> = {
  idle: "💤",
  happy: "😊",
  sleeping: "😴",
  eating: "🍖",
  playing: "🎮",
  excited: "⚡",
  sad: "😢",
}

export const PET_ICONS: Record<string, string> = {
  cat: "🐱",
  hamster: "🐹",
  ghost: "👻",
  robot: "🤖",
}

// Per-pet accent colors used by the GIF player.
export const PET_COLORS: Record<string, string> = {
  cat: "#bd93f9",
  ghost: "#f1fa8c",
  robot: "#50fa7b",
}

// 24-bit ANSI foreground escape for a "#rrggbb" hex color, for terminal surfaces.
export const ansiFg = (hex: string): string => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return ""
  const n = parseInt(m[1], 16)
  return `\x1b[38;2;${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}m`
}

export const ANSI_RESET = "\x1b[0m"
