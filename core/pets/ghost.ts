import type { PetAnimations } from "../types"
import { pad } from "../frame-utils"

export const ghostAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [{ frame: pad(["   .-.     ","           ","  | O |    ","  '~~~'    "], 12), duration: 5000 }],
        loop: true,
      },
      {
        id: "eyes",
        steps: [
          { frame: pad(["           ","  (o o)    ","           ","           "], 12), durationRange: [2000, 4000] },
          { frame: pad(["           ","  (- -)    ","           ","           "], 12), duration: 150 },
          { frame: pad(["           ","  (· ·)    ","           ","           "], 12), duration: 80 },
          { frame: pad(["           ","  (- -)    ","           ","           "], 12), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (- -)    ","  | z |    ","  '~~~'    "], 12), durationRange: [2000, 3000] },
          { frame: pad(["   .-.     ","  (- -)    ","  | Z |    ","  '~~~'    "], 12), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   boo!    "], 12), durationRange: [1500, 3000] },
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   boo!    "], 12), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom~    "], 12), duration: 400 },
          { frame: pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom!    "], 12), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   ~~~     "], 12), duration: 500 },
          { frame: pad(["    .-.    ","   (^ ^)   ","   | ω |   ","   '~~~'   ","    ~~~    "], 12), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   BOO!    "], 12), duration: 300 },
          { frame: pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    "], 12), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad(["   .-.     ","  (T T)    ","  |   |    ","  '~~~'    "], 12), durationRange: [4000, 6000] },
          { frame: pad(["   .-.     ","  (T T)    ","  | ; |    ","  '~~~'    "], 12), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}
