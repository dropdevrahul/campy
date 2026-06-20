import type { PetState, PetAnimations } from "../types"
import { pad } from "../frame-utils"

export const dogAnim: PetAnimations = {
  states: {
    idle: [
      {
        id: "body",
        steps: [
          {
            frame: pad([
              " /\\       /\\ ",
              "(  o-|-o  )  ",
              " \\  ---  /   ",
              "  | --- |    ",
              " /  ___  \\   ",
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
              "             ",
              "(  o-|-o  )  ",
              "             ",
              "             ",
              "             ",
            ], 16),
            durationRange: [2000, 4000],
          },
          {
            frame: pad([
              "             ",
              "(  --|-|--)  ",
              "             ",
              "             ",
              "             ",
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
              " /\\       /\\ ",
              "(  ^-|-^  )  ",
              " \\  ω    /   ",
              "  | --- |    ",
              " /  ___  \\   ",
            ], 16),
            durationRange: [1500, 2500],
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  ^-|-^  )  ",
              " \\  ω    /   ",
              "  | --- |    ",
              " / ~♥  ~ \\   ",
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
              " /\\       /\\ ",
              "(  --|-|--)  ",
              " \\  ___  /   ",
              "  | --- |    ",
              "    z z      ",
            ], 16),
            durationRange: [2000, 3500],
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  --|-|--)  ",
              " \\  ___  /   ",
              "  | --- |    ",
              "   Z   z     ",
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
              " /\\       /\\ ",
              "(  o-|-o  )  ",
              " \\  ω    /   ",
              "  |-nom- |   ",
              " /  ___  \\   ",
            ], 16),
            duration: 400,
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  ^-|-^  )  ",
              " \\  ω    /   ",
              "  |-nom- |   ",
              " /  ___  \\   ",
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
              " /\\       /\\ ",
              "(  >-|->  )  ",
              " \\  ω    /   ",
              " ~| --- |~   ",
              " /  ___  \\   ",
            ], 16),
            duration: 450,
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  <-|-<  )  ",
              " \\  ω    /   ",
              " ~| --- |~   ",
              " /  ___  \\   ",
            ], 16),
            duration: 450,
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
              "*/\\       /\\*",
              "(  *-|-*  )  ",
              " \\  !!   /   ",
              "  | --- |    ",
              " / ~♥  ~ \\   ",
            ], 16),
            duration: 280,
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  ^-|-^  )  ",
              " \\  ω    /   ",
              "  | --- |    ",
              " / ~♥  ~ \\   ",
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
              " /\\       /\\ ",
              "(  T-|-T  )  ",
              " \\  ___  /   ",
              "  | --- |    ",
              "  ;;  ;;     ",
            ], 16),
            durationRange: [3000, 5000],
          },
          {
            frame: pad([
              " /\\       /\\ ",
              "(  T-|-T  )  ",
              " \\  ___  /   ",
              "  | --- |    ",
              " ;;;   ;;;   ",
            ], 16),
            duration: 1500,
          },
        ],
        loop: true,
      },
    ],
  },
}
