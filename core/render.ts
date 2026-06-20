import type { PetState } from "./types"
import type { PetView } from "./runtime"
import { ansiFg, ANSI_RESET, PET_ICONS, STATE_ICONS } from "./theme"
import { meterBar } from "./happiness"
import { getAnimations } from "./pets"
import { mergeLayers } from "./frame-utils"
import type { PetStoreState } from "./store"
import { speechActive } from "./store"

// A tiny single-line face per pet, used by statuslines where a full sprite
// won't fit. Two frames give cheap motion when the host re-renders often.
const MINI_FACE: Record<string, [string, string]> = {
  cat: ["(=^･ω･^=)", "(=^･ｪ･^=)"],
  hamster: ["(\\_/)", "(='.'=)"],
  ghost: ["(^-^)ノ⌒", "(～^-^)～"],
  robot: ["[o_o]", "[-_-]"],
  dragon: ["(/\\o o/\\)", "(/\\^ ^/\\)"],
  turtle: ["(@ o o @)", "(@ - - @)"],
  panda: ["(@^.^@)", "(@^ω^@)"],
  dog: ["(o-|-o)", "(^-|-^)"],
}

export const miniFace = (pet: string, frame = 0): string => {
  const faces = MINI_FACE[pet] ?? MINI_FACE.cat
  return faces[frame % faces.length]
}

// A multi-line speech bubble matching the OpenCode sidebar style.
export const speechBubble = (text: string): string[] => [
  " .----------------.",
  `(${text.padEnd(16)})`,
  " '------.  .-----'",
  "        | /",
]

// Compose the full pet block (status row + optional speech + sprite) for a TUI
// widget or a terminal pane. `color` adds 24-bit ANSI when the surface supports it.
export const petLines = (view: PetView, opts: { color?: boolean } = {}): string[] => {
  const color = opts.color ? ansiFg(view.color) : ""
  const reset = opts.color ? ANSI_RESET : ""
  const lines: string[] = []
  lines.push(`${view.petIcon} ${view.pet}   ${view.stateIcon} ${view.state}`)
  if (view.speech) lines.push(...speechBubble(view.speech))
  for (const l of view.sprite) lines.push(`${color}${l}${reset}`)
  return lines
}

// One compact status line for statusline-based hosts (Claude Code, Gemini CLI…).
export const statusLine = (state: PetStoreState, now = Date.now()): string => {
  const petIcon = PET_ICONS[state.pet] || "🐾"
  const moodIcon = STATE_ICONS[state.mood as PetState] || "💤"
  const frame = Math.floor(now / 500) % 2
  const face = miniFace(state.pet, frame)
  const bar = meterBar(state.happiness, 8)
  const tail = speechActive(state, now) ? `  💬 ${state.speech}` : ""
  return `${petIcon} ${state.mood} ${moodIcon}  ${face}  ${bar} ${state.happiness}%${tail}`
}

// A single still frame for a pet/state — the first step of each layer, composited.
// Used where there's no animation loop (e.g. MCP tool results rendered into chat).
export const staticSprite = (pet: string, state: PetState): string[] => {
  const layers = getAnimations(pet).states[state]
  if (!layers || layers.length === 0) return []
  return mergeLayers(layers.map(l => l.steps[0]?.frame ?? []))
}

// A full text "card" (status line + speech + still sprite) for non-animated
// surfaces such as an MCP tool result the agent prints inline.
export const petCard = (state: PetStoreState, now = Date.now()): string => {
  const petIcon = PET_ICONS[state.pet] || "🐾"
  const moodIcon = STATE_ICONS[state.mood as PetState] || "💤"
  const head = `${petIcon} ${state.pet}   ${moodIcon} ${state.mood}   ${meterBar(state.happiness)} ${state.happiness}%`
  const sprite = staticSprite(state.pet, state.mood as PetState)
  const body = speechActive(state, now) ? [...speechBubble(state.speech), "", ...sprite] : sprite
  return [head, "", ...body].join("\n")
}
