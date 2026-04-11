/** @jsxImportSource @opentui/solid */
import { createSignal, onMount } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const PetsPlugin: TuiPlugin = async (api) => {
  const [frame, setFrame] = createSignal(0)
  const [happiness, setHappiness] = createSignal(80)
  const [petType, setPetType] = createSignal("cat")

  onMount(() => {
    setInterval(() => setFrame(f => f + 1), 300)
  })

  const feed = () => { setHappiness(h => Math.min(100, h + 15)); api.ui.toast({ message: "Fed!", variant: "success" }) }
  const play = () => { setHappiness(h => Math.min(100, h + 20)); api.ui.toast({ message: "Played!", variant: "success" }) }
  const petIt = () => { setHappiness(h => Math.min(100, h + 10)); api.ui.toast({ message: "Pet!", variant: "success" }) }
  const switchPet = (t: string) => { setPetType(t); setHappiness(80); api.ui.toast({ message: t + "!", variant: "success" }) }

  api.command.register(() => [
    { title: "Feed", value: "pet feed", description: "Feed", slash: { name: "pet feed" }, onSelect: feed },
    { title: "Play", value: "pet play", description: "Play", slash: { name: "pet play" }, onSelect: play },
    { title: "Pet", value: "pet pet", description: "Pet", slash: { name: "pet pet" }, onSelect: petIt },
    { title: "Cat", value: "pet cat", description: "Cat", slash: { name: "pet cat" }, onSelect: () => switchPet("cat") },
    { title: "Dog", value: "pet dog", description: "Dog", slash: { name: "pet dog" }, onSelect: () => switchPet("dog") },
    { title: "Hamster", value: "pet hamster", description: "Hamster", slash: { name: "pet hamster" }, onSelect: () => switchPet("hamster") },
    { title: "Ghost", value: "pet ghost", description: "Ghost", slash: { name: "pet ghost" }, onSelect: () => switchPet("ghost") },
    { title: "Corgi", value: "pet corgi", description: "Corgi", slash: { name: "pet corgi" }, onSelect: () => switchPet("corgi") },
  ])

  const cat: string[][] = [
    ["  /\\_____/\\  "," /  o   o  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "],
    ["  /\\_____/\\  "," /  -   -  \\ ","(  == ^ ==  )"," \\  '-'  /  "," (__)  (__) "],
    ["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  "," (__)  (__) "],
    ["  /\\_____/\\  "," /  ^   ^  \\ ","(  == ω ==  )"," \\  '-'  /  ","  | ♥ |    "," (__) (__)  "],
  ]
  const dog: string[][] = [
    ["   /\\    /\\   ","  /  \\../  \\  "," (    o__o    )"," (   /\\___/\\   )","  `--'    `--'  "],
    ["   /\\    /\\   ","  /  \\../  \\  "," (    -__o    )"," (   /\\___/\\   )","  `--'    `--'  "],
    ["   /\\    /\\   ","  /  \\../  \\  "," (    ω__o    )"," (   /\\___/\\   )","  `--'    `--'  ","   wag wag!  "],
  ]
  const ham: string[][] = [
    [" (\\\\/)  (\\\\/) ","  ( ..)  ( ..) ","   `--'`--'    ","    (   )    ","     ( )     "],
    [" (\\\\/)  (\\\\/) ","  ( -.)  ( -.) ","   `--'`--'    ","    (   )    ","     ( )     "],
    [" (\\\\/)  (\\\\/) ","  ( ^.)  ( ^.) ","   `--'`--'    ","    ( ♥ )    ","   run run! "],
  ]
  const ghost: string[][] = [
    ["   .-.     ","  (o o)    ","  | O |    ","  '~~~'    "],
    ["   .-.     ","  (- -)    ","  | O |    ","  '~~~'    ","   ~~~     "],
    ["   .-.     ","  (^ ^)    ","  | ω |    ","  '~~~'    ","   boo!    "],
  ]
  const corgi: string[][] = [
    ["  /\\^..^/\\  "," /  \\    /  \\ ","|  | \\  / |  |","  \\ \\__/  /  / ","   `------'   "],
    ["  /\\^..^/\\  "," /  \\    /  \\ ","|  | -  - |  |","  \\ \\__/  /  / ","   `------'   "],
    ["  /\\^..^/\\  "," /  \\ ω /  \\ ","|  |  ♥  |  |","  \\ \\__/  /  / ","   `------'   ","   happy!    "],
  ]

  const all: Record<string, string[][]> = { cat, dog, hamster: ham, ghost, corgi }

  api.slots.register({
    order: 350,
    slots: {
      sidebar_content() {
        const frames = all[petType()] || cat
        const idx = frame() % frames.length
        const sprite = frames[idx] || cat[0]
        const bar = "█".repeat(Math.floor(happiness() / 10)) + "░".repeat(10 - Math.floor(happiness() / 10))
        return (
          <box paddingX={1} paddingY={1} flexDirection="column" gap={1}>
            <text fg="#bd93f9"><b>🐱 {petType()}</b></text>
            <box flexDirection="column" alignItems="center">
              {sprite.map((l: string, i: number) => <text key={i} fg="#bd93f9">{l}</text>)}
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
