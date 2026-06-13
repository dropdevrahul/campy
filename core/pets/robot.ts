import type { PetAnimations } from "../types"
import { pad } from "../frame-utils"

export const robotAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [{ frame: pad(["    ___     ___  ","                ","   |___/   \\___|" ,"      \\_|_/      "], 18), duration: 5000 }],
        loop: true,
      },
      {
        id: "eyes",
        steps: [
          { frame: pad(["                ","   | O |---| O | ","                ","                "], 18), durationRange: [2000, 4000] },
          { frame: pad(["                ","   | - |---| - | ","                ","                "], 18), duration: 150 },
          { frame: pad(["                ","   | · |---| · | ","                ","                "], 18), duration: 80 },
          { frame: pad(["                ","   | - |---| - | ","                ","                "], 18), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ zzz  "], 18), durationRange: [2000, 3000] },
          { frame: pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ ZZZ  "], 18), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/  ♥   "], 18), durationRange: [1500, 3000] },
          { frame: pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/      "], 18), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"    nom nom !    "], 18), duration: 400 },
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"     nom !       "], 18), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > boop <      "], 18), duration: 500 },
          { frame: pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > beep <      "], 18), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   !! ♥ !!       "], 18), duration: 300 },
          { frame: pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   BEEP BOOP!    "], 18), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"      ;_;        "], 18), durationRange: [4000, 6000] },
          { frame: pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"     404 :(       "], 18), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}
