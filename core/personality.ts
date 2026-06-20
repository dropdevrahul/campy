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
  dragon: "ROAR! Your code shall be legendary!",
  turtle: "Slow and steady wins the race!",
  panda: "*munches bamboo* Hi there!",
  dog: "Woof! My glasses help me review your code!",
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
  dragon: {
    idle: ["*scales shimmer*", "Watching over your code...", "*breathes smoke*", "Guarding your files~"],
    happy: ["ROAAR! ♥", "*joyful flames*", "Your code is fire!", "*happy roar*"],
    sleeping: ["Zzz... *smoke puff*", "*dreams of treasure*", "Mrrr... zz", "*curled around code*"],
    eating: ["*chomps enthusiastically*", "ROAR nom nom!", "*devours snack*", "Delicious!"],
    playing: ["*breathes playful fire*", "RAWR! :D", "*swoops around*", "Catch me if you can!"],
    excited: ["ROOOOAAR!!", "*fire burst*", "THE CODE IS LEGENDARY!", "*thrashes excitedly*"],
    sad: ["*sad smoke puff*", "...roar", "*drooping horns*", "*quiet whimper*"],
  },
  turtle: {
    idle: ["*head pokes out*", "Taking it slow...", "*blinks slowly*", "Patience is key~"],
    happy: ["*happy shell wiggle*", "Wheee~", "Life is good!", "*peeks out happily*"],
    sleeping: ["*retreats into shell*", "Zzz...", "*snug in shell*", "*slow breathing*"],
    eating: ["*munches lettuce*", "Nom nom nom~", "*happy chomp*", "So tasty!"],
    playing: ["*spins in shell*", "Wheee!", "*slow zoom*", "Watch me go!"],
    excited: ["*shell rattles*", "BEST DAY EVER!", "*pokes head way out*", "Woohoo!"],
    sad: ["*hides in shell*", "...peek", "*retreats slowly*", "*quiet sniffle*"],
  },
  panda: {
    idle: ["*munches bamboo*", "Nom nom...", "*rolls around*", "Comfy here~"],
    happy: ["*happy bounce*", "Bamboo! ♥", "*rolls joyfully*", "Wheee~"],
    sleeping: ["Zzz...", "*curled up fluffy*", "*bamboo dreams*", "Mrrr..."],
    eating: ["*intense bamboo focus*", "NOM NOM NOM", "*munching loudly*", "So good!"],
    playing: ["*somersaults!*", "Weeee!", "*tumbles cutely*", "Watch this!"],
    excited: ["PANDA PAAAANICS!", "*zoomies!*", "TOO MUCH BAMBOO!", "*rolls wildly*"],
    sad: ["*sits quietly*", "...bamboo", "*droopy ears*", "*sighs softly*"],
  },
  dog: {
    idle: ["*adjusts glasses*", "Hmm, interesting code...", "*sniffs debugger*", "Woof."],
    happy: ["WOOF WOOF! ♥", "*tail wags furiously*", "BEST CODE EVER!", "*excited bork*"],
    sleeping: ["Zzz... *snore*", "*glasses askew*", "*doggy dreams*", "Woof... zz"],
    eating: ["NOM NOM NOM!", "*wolfs down treat*", "Woof! Tasty!", "*happy eating*"],
    playing: ["*fetch mode: ON*", "BORK BORK!", "*zooms around*", "Woof! Woof!"],
    excited: ["BORK BORK BORK!!", "*absolutely losing it*", "WOOOOOOF!", "*zoomies*"],
    sad: ["*whimper*", "...woof", "*tail between legs*", "*sad puppy eyes*"],
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
