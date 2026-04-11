/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

type PetState = "idle" | "happy" | "sleeping" | "eating" | "playing" | "excited" | "sad"
const STATES: PetState[] = ["idle", "happy", "sleeping", "eating", "playing", "excited", "sad"]
const HL = 8

const pad = (lines: string[], width: number) => {
  const padded = lines.map(l => l.padEnd(width))
  while (padded.length < HL) padded.push(" ".repeat(width))
  return padded
}

const catFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["  /\\_____/\\  "," /  o   o  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  happy: [
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  ","  | ♥ |    "," (__) (__)  "], 14),
  ],
  sleeping: [
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == z z  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == Z z  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  eating: [
    pad(["  /\\_____/\\  "," /  o   o  \\ ","(  == ω ==  )"," \\  nom /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  nom /  "," (__)  (__) "], 14),
  ],
  playing: [
    pad(["    /\\_____/\\ ","   /  ^   ^  \\"," ( == ω ==  ) ","  \\  '-'  /  ","  (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  excited: [
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  ","  | ♥ |    "," (__) (__)  "], 14),
    pad(["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω==  )"," \\  '-'  /  "," (__)  (__) "], 14),
  ],
  sad: [
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == T T  )"," \\  '-'  /  "," (__)  (__) "], 14),
    pad(["  /\\_____/\\  "," /  -   -  \\ ","(  == T T  )"," \\  '-'  /  "," (__)  (__) ","   ;_;     "], 14),
  ],
}

const dogFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    o__o    )"," (   /\\___/\\   )","  `--'    `--'  "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    -__o    )"," (   /\\___/\\   )","  `--'    `--'  "], 16),
  ],
  happy: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   wag wag!  "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  "], 16),
  ],
  sleeping: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    -__-    )"," (   /\\___/\\   )","  `--'    `--'  ","   zzz      "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    -__-    )"," (   /\\___/\\   )","  `--'    `--'  ","   ZZZ      "], 16),
  ],
  eating: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    o__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   nom nom  "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   nom!     "], 16),
  ],
  playing: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   wag wag!  "], 16),
    pad(["     /\\  /\\   ","    /\\../\\   ","  (  ω__o  )  "," ( /\\___/\\ ) ","  `--'`--'    "], 16),
  ],
  excited: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   BORK BORK "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  "], 16),
  ],
  sad: [
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    T__T    )"," (   /\\___/\\   )","  `--'    `--'  "], 16),
    pad(["   /\\    /\\   ","  /  \\../  \\  "," (    T__T    )"," (   /\\___/\\   )","  `--'    `--'  ","   ;_;      "], 16),
  ],
}

const hamFrames: Record<PetState, string[][]> = {
  idle: [
    pad([" (\\\\/)  (\\\\/) ","  ( ..)  ( ..) ","   `--'`--'    ","    (   )    ","     ( )     "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    (   )    ","     ( )     "], 14),
  ],
  happy: [
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14),
  ],
  sleeping: [
    pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    zzz     ","     ( )     "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    ZZZ     ","     ( )     "], 14),
  ],
  eating: [
    pad([" (\\\\/)  (\\\\/) ","  ( o.)  ( o.) ","   `--'`--'    ","    nom     ","     ( )     "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    nom!    ","     ( )     "], 14),
  ],
  playing: [
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","   wheel!   ","   run run! "], 14),
  ],
  excited: [
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   SQUEAK!  "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    "], 14),
  ],
  sad: [
    pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","    ;_;     ","     ( )     "], 14),
    pad([" (\\\\/)  (\\\\/) ","  ( T.)  ( T.) ","   `--'`--'    ","   ;_;      ","     ( )     "], 14),
  ],
}

const ghostFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["   .-.     ","  (o o)    ","  | O |    ","  '~~~'    "], 12),
    pad(["   .-.     ","  (o o)    ","  | O |    ","  '~~~'    "], 12),
  ],
  happy: [
    pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   boo!    "], 12),
    pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   boo!    "], 12),
  ],
  sleeping: [
    pad(["   .-.     ","  (- -)    ","  | z |    ","  '~~~'    "], 12),
    pad(["   .-.     ","  (- -)    ","  | Z |    ","  '~~~'    "], 12),
  ],
  eating: [
    pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom~    "], 12),
    pad(["   .-.     ","  (o o)    ","  | ω |    ","  '~~~'    ","   nom!    "], 12),
  ],
  playing: [
    pad(["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   ~~~     "], 12),
    pad(["    .-.    ","   (^ ^)   ","   | ω |   ","   '~~~'   ","    ~~~    "], 12),
  ],
  excited: [
    pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    ","   BOO!    "], 12),
    pad(["   .-.     ","  (^ ^)    ","  | ♥ |    ","  '~~~'    "], 12),
  ],
  sad: [
    pad(["   .-.     ","  (T T)    ","  |   |    ","  '~~~'    "], 12),
    pad(["   .-.     ","  (T T)    ","  | ; |    ","  '~~~'    "], 12),
  ],
}

const corgiFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   "], 16),
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | -  - |  |","  \\ \\__/  /  / ","   `------'   "], 16),
  ],
  happy: [
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  |  ♥  |  |","  \\ \\__/  /  / ","   `------'   ","   happy!    "], 16),
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   ","   yip!      "], 16),
  ],
  sleeping: [
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | -  - |  |","  \\ \\__/  /  / ","   `------'   ","   zzz      "], 16),
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | -  - |  |","  \\ \\__/  /  / ","   `------'   ","   ZZZ      "], 16),
  ],
  eating: [
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   ","   nom nom  "], 16),
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   ","   nom!     "], 16),
  ],
  playing: [
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   ","   yip yip! "], 16),
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  |  ♥  |  |","  \\ \\__/  /  / ","   `------'   ","   bork!    "], 16),
  ],
  excited: [
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  |  ♥  |  |","  \\ \\__/  /  / ","   `------'   ","   BORK BORK"], 16),
    pad(["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  |  ♥  |  |","  \\ \\__/  /  / ","   `------'   "], 16),
  ],
  sad: [
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | T  T |  |","  \\ \\__/  /  / ","   `------'   "], 16),
    pad(["  /\\^..^/\\  "," /  \\    /  \\ ","|  | T  T |  |","  \\ \\__/  /  / ","   `------'   ","   ;_;      "], 16),
  ],
}

const W = 18
const robotFrames: Record<PetState, string[][]> = {
  idle: [
    pad(["    ___     ___  ","   | O |---| O | ","   |___/   \\___|" ,"      \\_|_/      "], W),
    pad(["    ___     ___  ","   | O |---| O | ","   |___/   \\___|" ,"      \\_|_/      "], W),
  ],
  happy: [
    pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/  ♥   "], W),
    pad(["    ___     ___  ","   | ^ |---| ^ | ","   |___/   \\___|" ,"      \\_|_/      "], W),
  ],
  sleeping: [
    pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ zzz  "], W),
    pad(["    ___     ___  ","   | - |---| - | ","   |___/   \\___|" ,"      \\_|_/ ZZZ  "], W),
  ],
  eating: [
    pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"    nom nom !    "], W),
    pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"     nom !       "], W),
  ],
  playing: [
    pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > boop <      "], W),
    pad(["    ___     ___  ","   | ω |---| ω | ","   |___/   \\___|" ,"   > beep <      "], W),
  ],
  excited: [
    pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   !! ♥ !!       "], W),
    pad(["    ___     ___  ","   | ◉ |---| ◉ | ","   |___/   \\___|" ,"   BEEP BOOP!    "], W),
  ],
  sad: [
    pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"      ;_;        "], W),
    pad(["    ___     ___  ","   | T |---| T | ","   |___/   \\___|" ,"     404 :(       "], W),
  ],
}

const STATE_COLORS: Record<PetState, string> = {
  idle: "#bd93f9",
  happy: "#50fa7b",
  sleeping: "#6272a4",
  eating: "#ffb86c",
  playing: "#ff79c6",
  excited: "#f1fa8c",
  sad: "#ff5555",
}

const STATE_ICONS: Record<PetState, string> = {
  idle: "💤",
  happy: "😊",
  sleeping: "😴",
  eating: "🍖",
  playing: "🎮",
  excited: "⚡",
  sad: "😢",
}

const PET_ICONS: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  hamster: "🐹",
  ghost: "👻",
  corgi: "🐶",
  robot: "🤖",
}

const allPetFrames: Record<string, Record<PetState, string[][]>> = {
  cat: catFrames,
  dog: dogFrames,
  hamster: hamFrames,
  ghost: ghostFrames,
  corgi: corgiFrames,
  robot: robotFrames,
}

const IDLE_PHRASES = [
  "Need a hand?",
  "Looks good!",
  "Can I help?",
  "Watching you code...",
  "Beep boop!",
  "I'm here!",
  "Keep going!",
  "What's next?",
]

const PetsPlugin: TuiPlugin = async (api) => {
  const [frame, setFrame] = createSignal(0)
  const [happiness, setHappiness] = createSignal(80)
  const [petType, setPetType] = createSignal("cat")
  const [state, setState] = createSignal<PetState>("idle")
  const [speechBubble, setSpeechBubble] = createSignal("")

  let frameInterval: ReturnType<typeof setInterval> | undefined
  let stateTimeout: ReturnType<typeof setTimeout> | undefined
  let speechTimeout: ReturnType<typeof setTimeout> | undefined

  const scheduleNextState = () => {
    const delay = 10000 + Math.random() * 20000
    stateTimeout = setTimeout(() => {
      const next = STATES[Math.floor(Math.random() * STATES.length)]
      setState(next)
      setFrame(0)
      scheduleNextState()
    }, delay)
  }

  const showSpeech = (text: string, duration = 5000) => {
    if (speechTimeout) clearTimeout(speechTimeout)
    setSpeechBubble(text)
    speechTimeout = setTimeout(() => setSpeechBubble(""), duration)
  }

  const overrideState = (s: PetState, duration: number, speech?: string) => {
    if (stateTimeout) clearTimeout(stateTimeout)
    setState(s)
    setFrame(0)
    if (speech) showSpeech(speech, duration)
    stateTimeout = setTimeout(() => {
      setState("idle")
      setFrame(0)
      scheduleNextState()
    }, duration)
  }

  onMount(() => {
    frameInterval = setInterval(() => setFrame(f => f + 1), 500)
    scheduleNextState()

    api.event.on("message.part.delta", () => {
      overrideState("excited", 3000, "Thinking...")
    })

    api.event.on("session.error", () => {
      overrideState("sad", 5000, "Error! Let me help...")
    })

    api.event.on("session.idle", () => {
      if (stateTimeout) clearTimeout(stateTimeout)
      setState("idle")
      setFrame(0)
      showSpeech(IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)], 4000)
      scheduleNextState()
    })

    api.event.on("file.edited", (data: any) => {
      const path = data?.path || data?.filePath || ""
      const filename = path ? path.split("/").pop() || path : ""
      overrideState("eating", 4000, filename ? `Edited ${filename}!` : "File saved!")
    })

    api.event.on("tui.prompt.append", () => {
      overrideState("happy", 2000, "I'm here!")
    })

    api.event.on("command.executed", (data: any) => {
      const cmd = data?.command || ""
      overrideState("happy", 3000, cmd ? `Ran ${cmd}!` : "Done!")
    })
  })

  onCleanup(() => {
    if (frameInterval) clearInterval(frameInterval)
    if (stateTimeout) clearTimeout(stateTimeout)
    if (speechTimeout) clearTimeout(speechTimeout)
  })

  const feed = () => { setHappiness(h => Math.min(100, h + 15)); overrideState("eating", 5000); api.ui.toast({ message: "Fed!", variant: "success" }) }
  const play = () => { setHappiness(h => Math.min(100, h + 20)); overrideState("playing", 5000); api.ui.toast({ message: "Played!", variant: "success" }) }
  const petIt = () => { setHappiness(h => Math.min(100, h + 10)); overrideState("happy", 3000); api.ui.toast({ message: "Pet!", variant: "success" }) }
  const switchPet = (t: string) => { setPetType(t); setHappiness(80); setState("idle"); setFrame(0); api.ui.toast({ message: t + "!", variant: "success" }) }

  api.command.register(() => [
    { title: "Feed", value: "pet feed", description: "Feed", slash: { name: "pet feed" }, onSelect: feed },
    { title: "Play", value: "pet play", description: "Play", slash: { name: "pet play" }, onSelect: play },
    { title: "Pet", value: "pet pet", description: "Pet", slash: { name: "pet pet" }, onSelect: petIt },
    { title: "Cat", value: "pet cat", description: "Cat", slash: { name: "pet cat" }, onSelect: () => switchPet("cat") },
    { title: "Dog", value: "pet dog", description: "Dog", slash: { name: "pet dog" }, onSelect: () => switchPet("dog") },
    { title: "Hamster", value: "pet hamster", description: "Hamster", slash: { name: "pet hamster" }, onSelect: () => switchPet("hamster") },
    { title: "Ghost", value: "pet ghost", description: "Ghost", slash: { name: "pet ghost" }, onSelect: () => switchPet("ghost") },
    { title: "Corgi", value: "pet corgi", description: "Corgi", slash: { name: "pet corgi" }, onSelect: () => switchPet("corgi") },
    { title: "Robot", value: "pet robot", description: "Robot", slash: { name: "pet robot" }, onSelect: () => switchPet("robot") },
  ])

  api.slots.register({
    order: 350,
    slots: {
      sidebar_content() {
        const petFrames = allPetFrames[petType()] || catFrames
        const currentState = state()
        const stateFrames = petFrames[currentState] || petFrames.idle
        const idx = frame() % stateFrames.length
        const sprite = stateFrames[idx] || petFrames.idle[0]
        const color = STATE_COLORS[currentState]
        const bar = "█".repeat(Math.floor(happiness() / 10)) + "░".repeat(10 - Math.floor(happiness() / 10))
        const bubble = speechBubble()
        return (
          <box paddingX={1} paddingY={1} flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <text fg="#bd93f9"><b>{PET_ICONS[petType()] || "🐾"} {petType()}</b></text>
              <text fg={color}>{STATE_ICONS[currentState]} {currentState}</text>
            </box>
            {bubble && petType() === "robot" ? (
              <box flexDirection="column" gap={0}>
                <text fg="#f8f8f2"> .----------------.</text>
                <text fg="#f8f8f2">({bubble.padEnd(16)})</text>
                <text fg="#f8f8f2"> '------.  .-----'</text>
                <text fg="#f8f8f2">        | /</text>
              </box>
            ) : null}
            <box flexDirection="column" alignItems="center" minHeight={HL}>
              {sprite.map((l: string, i: number) => <text key={i} fg={color}>{l}</text>)}
            </box>
            <text fg="#f8f8f2">Happy: {bar} {happiness()}%</text>
            <text fg="#6272a4">/pet feed /pet play /pet dog</text>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = { id: "opencode-pets", tui: PetsPlugin }
export default plugin