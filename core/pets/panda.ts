import type { PetState, PetAnimations } from "../types"
import { pad } from "../frame-utils"

// A round, cute panda head: two soft round ears on top, a rounded face outline
// (`.--.` / `'--'` corners with curved `( )` and `/ \` sides), dark eye-patches
// `(o)`, a little `ω` nose and a `\__/` smile. The idle state layers a blinking
// `eyes` track over a static `body`; every other state is a single 2-frame base
// layer. WIDTH = 16.

export const pandaAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /( )  ( )\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              "  '------'      ",
            ], 16),
            duration: 4500,
          },
        ],
        loop: true,
      },
      {
        id: "eyes",
        steps: [
          {
            frame: pad([
              "                ",
              "                ",
              "                ",
              "   o    o       ",
              "                ",
              "                ",
              "                ",
            ], 16),
            durationRange: [2000, 4000],
          },
          {
            frame: pad([
              "                ",
              "                ",
              "                ",
              "   -    -       ",
              "                ",
              "                ",
              "                ",
            ], 16),
            duration: 130,
          },
        ],
        loop: true,
      },
    ],
    happy: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(^)  (^)\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              "  '--♥♥--'      ",
            ], 16),
            durationRange: [1500, 2500],
          },
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              " *.------.*     ",
              " /(^)  (^)\\     ",
              "|    ω    |     ",
              " \\ \\____/ /     ",
              "  '--♥♥--'      ",
            ], 16),
            duration: 600,
          },
        ],
        loop: true,
      },
    ],
    sleeping: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __  z  ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(-)  (-)\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              "  '------'      ",
            ], 16),
            durationRange: [2000, 3500],
          },
          {
            frame: pad([
              "   __    __ z   ",
              "  (  )  (  )  Z ",
              "  .------.      ",
              " /(-)  (-)\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              "  '------'      ",
            ], 16),
            duration: 1200,
          },
        ],
        loop: true,
      },
    ],
    eating: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(o)  (o)\\     ",
              "|   nom   |     ",
              " \\  \\__/  /     ",
              "  '------'      ",
            ], 16),
            duration: 400,
          },
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(^)  (^)\\     ",
              "|   nom   |     ",
              " \\  \\oo/  /     ",
              "  '------'      ",
            ], 16),
            duration: 350,
          },
        ],
        loop: true,
      },
    ],
    playing: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(>)  (<)\\     ",
              "|    ω    |     ",
              "~\\  \\__/  /~    ",
              "  '------'      ",
            ], 16),
            duration: 500,
          },
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(<)  (>)\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              " ~'------'~     ",
            ], 16),
            duration: 500,
          },
        ],
        loop: true,
      },
    ],
    excited: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              " *(  )  (  )*   ",
              "  .------.      ",
              " /(*)  (*)\\     ",
              "|    !!   |     ",
              " \\  \\__/  /     ",
              "  '--♥♥--'      ",
            ], 16),
            duration: 280,
          },
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(^)  (^)\\     ",
              "|    ω    |     ",
              " \\  \\__/  /     ",
              "  '--♥♥--'      ",
            ], 16),
            duration: 280,
          },
        ],
        loop: true,
      },
    ],
    sad: [
      {
        id: "base",
        steps: [
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(T)  (T)\\     ",
              "|    ω    |     ",
              " \\  /‾‾\\  /     ",
              "  '------'      ",
            ], 16),
            durationRange: [3000, 5000],
          },
          {
            frame: pad([
              "   __    __     ",
              "  (  )  (  )    ",
              "  .------.      ",
              " /(T)  (T)\\     ",
              "| , ω , |       ",
              " \\  /‾‾\\  /     ",
              "  '------'      ",
            ], 16),
            duration: 1500,
          },
        ],
        loop: true,
      },
    ],
  },
}
