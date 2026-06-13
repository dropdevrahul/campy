import type { PetAnimations } from "../types"
import { pad } from "../frame-utils"

export const hamAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ..)  ( ..) ","   `--'`--'    ","    (   )    ","     ( )     "], 14), durationRange: [2000, 4000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    (   )    ","     ( )     "], 14), duration: 150 },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    zzz     ","     ( )     "], 14), durationRange: [2000, 3000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    ZZZ     ","     ( )     "], 14), duration: 1500 },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14), durationRange: [1500, 3000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14), duration: 800 },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( o.)  ( o.) ","   `--'`--'    ","    nom     ","     ( )     "], 14), duration: 400 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    nom!    ","     ( )     "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14), duration: 500 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","   wheel!   ","   run run! "], 14), duration: 500 },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   SQUEAK!  "], 14), duration: 300 },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14), duration: 300 },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","    ;_;     ","     ( )     "], 14), durationRange: [4000, 6000] },
          { frame: pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","   ;_;      ","     ( )     "], 14), duration: 2000 },
        ],
        loop: true,
      },
    ],
  },
}
