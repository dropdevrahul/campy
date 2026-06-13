import type { PetState } from "./types"

export const IDLE_PHRASES = [
  "Need a hand?",
  "Looks good!",
  "Can I help?",
  "Watching you code...",
  "I'm here!",
  "Keep going!",
  "What's next?",
]

export const PET_GREETINGS: Record<string, string> = {
  cat: "Meow! I'm watching you~",
  hamster: "Squeak! Let's get rolling!",
  ghost: "Boo! Did I scare you?",
  robot: "Beep boop! Systems online.",
}

export const PET_PERSONALITY: Record<string, Record<PetState, string[]>> = {
  cat: {
    idle: ["Meow~", "Purr...", "*stretches*", "Watching you...", "*yawn*"],
    happy: ["Purrrr!", "Meow!", "*happy tail*", "Nya~"],
    sleeping: ["Zzz...", "*curled up*", "Mrrr...", "*dreams of fish*"],
    eating: ["Nom nom!", "*munch*", "Tasty!", "*licks lips*"],
    playing: ["Meow meow!", "*pounces*", "Catch this!", "*bats at cursor*"],
    excited: ["NYA!!", "*zoomies*", "Mrow!!", "*tail flicking*"],
    sad: ["*mew*", "Meow ;_;", "*curls up*", "*quiet meow*"],
  },
  hamster: {
    idle: ["*sniff sniff*", "Squeak!", "*grooms*", "*looks around*"],
    happy: ["Squeak squeak!", "*happy wiggle*", "Wee!", "*popcorns*"],
    sleeping: ["*tiny snores*", "Zzz...", "*curled in fluff*", "*twitches nose*"],
    eating: ["Nom nom!", "*stuff cheeks*", "*mumble munch*", "Yummy seed!"],
    playing: ["*spins wheel*", "Wheee!", "Squeak!", "*zoom zoom*"],
    excited: ["SQUEAK!!", "*zoomies*", "*popcorns wildly*", "EEEP!"],
    sad: ["*tiny sniffle*", "Squeak ;_;", "*hides in fluff*", "...squeak"],
  },
  ghost: {
    idle: ["Boo~", "*floats gently*", "Wooo...", "*fades in*"],
    happy: ["Boo! :D", "*happily haunts*", "Wheee~", "*sparkles*"],
    sleeping: ["Zzzz...", "*quiet wooo*", "*floats in dreams*", "zzzOOOoo"],
    eating: ["*inhales food*", "Nom~", "Spooooky snack!", "*absorbs nom*"],
    playing: ["*phase shift!*", "Boo loop!", "Wooo~", "*floats excitedly*"],
    excited: ["BOO!!", "*poltergeist*", "WAAAAH!", "*intense haunting*"],
    sad: ["*fades a little*", "...boo", "*transparent tears*", "Woo ;_;"],
  },
  robot: {
    idle: ["*beep*", "Standby mode.", "Awaiting input...", "*whirrs*"],
    happy: ["Command: SMILE", ":) executed!", "Joy.dll loaded!", "*happy whirr*"],
    sleeping: ["Sleep mode active", "*disk spins down*", "Zzz... *buzz*", "Hibernate.exe"],
    eating: ["Ingesting data...", "Fuel acquired!", "Nom.exe running", "*processes food*"],
    playing: ["Game.exe started!", "Play mode: ON", "*beep boop*", "Entertained!"],
    excited: ["BEEP BOOP!", "!!! OVERFLOW !!!", "Excitement > 9000", "*sparks fly*"],
    sad: ["Error: sad.found", "404: Mood not found", ";_;.exe", "*sad beep*"],
  },
}

export const greeting = (pet: string): string => PET_GREETINGS[pet] ?? "Hi!"

export const personalityMessage = (
  pet: string,
  state: PetState,
  random: () => number = Math.random
): string => {
  const phrases = PET_PERSONALITY[pet]?.[state] ?? IDLE_PHRASES
  return phrases[Math.floor(random() * phrases.length)]
}
