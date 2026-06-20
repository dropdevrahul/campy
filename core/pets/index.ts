import type { PetAnimations } from "../types"
import { catAnim, catFrames } from "./cat"
import { hamAnim } from "./hamster"
import { ghostAnim } from "./ghost"
import { robotAnim } from "./robot"
import { dragonAnim } from "./dragon"
import { turtleAnim } from "./turtle"
import { pandaAnim } from "./panda"
import { dogAnim } from "./dog"

export { catFrames }

export const PET_ANIMATIONS: Record<string, PetAnimations> = {
  cat: catAnim,
  hamster: hamAnim,
  ghost: ghostAnim,
  robot: robotAnim,
  dragon: dragonAnim,
  turtle: turtleAnim,
  panda: pandaAnim,
  dog: dogAnim,
}

export const PET_NAMES = Object.keys(PET_ANIMATIONS)

export const getAnimations = (pet: string): PetAnimations => PET_ANIMATIONS[pet] || catAnim
