import type { PetState, PetAnimations } from "../types"
import { pad } from "../frame-utils"

// A 2.5D, full-body turtle seen from a three-quarter top angle: a small head
// with eyes pokes out the top, a domed patterned carapace (rim lines + plates
// give the shell depth), front flippers on the sides, two back legs and a tail
// at the bottom. The idle state layers a blinking `eyes` track over a static
// `body`; every other state is a single 2-frame base layer. WIDTH = 16.

export const turtleAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [
          {
            frame: pad([
              "     ___        ",
              "   _/   \\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            duration: 4000,
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
              "     o o        ",
              "                ",
              "                ",
              "                ",
              "                ",
              "                ",
            ], 16),
            durationRange: [2000, 4000],
          },
          {
            frame: pad([
              "                ",
              "     - -        ",
              "                ",
              "                ",
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
              "     ___        ",
              "   _/^ ^\\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            durationRange: [1500, 2500],
          },
          {
            frame: pad([
              "   * ___ *      ",
              "   _/^ ^\\_      ",
              "  /  \\_/  \\     ",
              " |♥/ --- \\♥|    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            duration: 700,
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
              "     ___   z    ",
              "   _/- -\\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/   \\_\\     ",
            ], 16),
            durationRange: [2000, 3500],
          },
          {
            frame: pad([
              "     ___ z      ",
              "   _/- -\\_  Z   ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/   \\_\\     ",
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
              "     ___        ",
              "   _/o o\\_      ",
              "  / \\nom/ \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            duration: 400,
          },
          {
            frame: pad([
              "     ___        ",
              "   _/^ ^\\_      ",
              "  /  \\o/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
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
              "     ___        ",
              "   _/> <\\_      ",
              "  /  \\_/  \\     ",
              "~| / --- \\ |~   ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            duration: 500,
          },
          {
            frame: pad([
              "     ___        ",
              "   _/< >\\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              " ~\\ ----- /~    ",
              " //_/ v \\_\\\\    ",
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
              "  * _*_ *       ",
              "   _/* *\\_      ",
              "  /  \\!/  \\     ",
              " |♥/ --- \\♥|    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/ v \\_\\     ",
            ], 16),
            duration: 280,
          },
          {
            frame: pad([
              "     ___        ",
              "   _/^ ^\\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              " //_/ v \\_\\\\    ",
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
              "     ___        ",
              "   _/T T\\_      ",
              "  /  \\_/  \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/   \\_\\     ",
            ], 16),
            durationRange: [3000, 5000],
          },
          {
            frame: pad([
              "     ___        ",
              "   _/T T\\_      ",
              "  / ,\\_/, \\     ",
              " | / --- \\ |    ",
              " | |[+][+]| |   ",
              "  \\ ----- /     ",
              "  /_/   \\_\\     ",
            ], 16),
            duration: 1500,
          },
        ],
        loop: true,
      },
    ],
  },
}
