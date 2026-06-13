/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

import type { PetState, PetAnimations } from "./lib/types"
import { STATES } from "./lib/types"
import { HL } from "./lib/frame-utils"
import { AnimationEngine } from "./lib/animation-engine"
import { PET_ANIMATIONS, catFrames } from "./pets/index"
import {
  STATE_COLORS,
  STATE_ICONS,
  PET_ICONS,
  IDLE_PHRASES,
  PET_GREETINGS,
  PET_PERSONALITY,
} from "./config"

const PetsPlugin: TuiPlugin = async (api) => {
  const [sprite, setSprite] = createSignal<string[]>(catFrames.idle[0])
  const [happiness, setHappiness] = createSignal(80)
  const [petType, setPetType] = createSignal("cat")
  const [state, setState] = createSignal<PetState>("idle")
  const [speechBubble, setSpeechBubble] = createSignal("")

  let engine: AnimationEngine | undefined
  let stateTimeout: ReturnType<typeof setTimeout> | undefined
  let speechTimeout: ReturnType<typeof setTimeout> | undefined

  const getCurrentAnimations = (): PetAnimations => {
    return PET_ANIMATIONS[petType()] || PET_ANIMATIONS.cat
  }

  const getPersonalityMessage = (s: PetState): string => {
    const phrases = PET_PERSONALITY[petType()]?.[s] ?? IDLE_PHRASES
    return phrases[Math.floor(Math.random() * phrases.length)]
  }

  const scheduleNextState = () => {
    const delay = 10000 + Math.random() * 20000
    stateTimeout = setTimeout(() => {
      const next = STATES[Math.floor(Math.random() * STATES.length)]
      setState(next)
      engine?.setState(next)
      showSpeech(getPersonalityMessage(next), 4000)
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
    engine?.setState(s)
    const msg = speech ?? getPersonalityMessage(s)
    showSpeech(msg, duration)
    stateTimeout = setTimeout(() => {
      setState("idle")
      engine?.setState("idle")
      scheduleNextState()
    }, duration)
  }

  onMount(() => {
    engine = new AnimationEngine(
      getCurrentAnimations(),
      () => {},
      { get: sprite, set: setSprite }
    )
    engine.resetToState("idle")
    showSpeech(PET_GREETINGS[petType()] ?? "Hi!", 5000)
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
      engine?.resetToState("idle")
      showSpeech(getPersonalityMessage("idle"), 4000)
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
    engine?.destroy()
    if (stateTimeout) clearTimeout(stateTimeout)
    if (speechTimeout) clearTimeout(speechTimeout)
  })

  const feed = () => { setHappiness(h => Math.min(100, h + 15)); overrideState("eating", 5000); api.ui.toast({ message: "Fed!", variant: "success" }) }
  const play = () => { setHappiness(h => Math.min(100, h + 20)); overrideState("playing", 5000); api.ui.toast({ message: "Played!", variant: "success" }) }
  const petIt = () => { setHappiness(h => Math.min(100, h + 10)); overrideState("happy", 3000); api.ui.toast({ message: "Pet!", variant: "success" }) }
  const switchPet = (t: string) => {
    setPetType(t); setHappiness(80); setState("idle")
    engine?.destroy()
    engine = new AnimationEngine(getCurrentAnimations(), () => {}, { get: sprite, set: setSprite })
    engine.resetToState("idle")
    showSpeech(PET_GREETINGS[t] ?? "Hi!", 5000)
    api.ui.toast({ message: t + "!", variant: "success" })
  }

  api.command.register(() => [
    { title: "Feed", value: "pet feed", description: "Feed", slash: { name: "pet feed" }, onSelect: feed },
    { title: "Play", value: "pet play", description: "Play", slash: { name: "pet play" }, onSelect: play },
    { title: "Pet", value: "pet pet", description: "Pet", slash: { name: "pet pet" }, onSelect: petIt },
    { title: "Cat", value: "pet cat", description: "Cat", slash: { name: "pet cat" }, onSelect: () => switchPet("cat") },
    { title: "Hamster", value: "pet hamster", description: "Hamster", slash: { name: "pet hamster" }, onSelect: () => switchPet("hamster") },
    { title: "Ghost", value: "pet ghost", description: "Ghost", slash: { name: "pet ghost" }, onSelect: () => switchPet("ghost") },
    { title: "Robot", value: "pet robot", description: "Robot", slash: { name: "pet robot" }, onSelect: () => switchPet("robot") },
  ])

  api.slots.register({
    order: 350,
    slots: {
      sidebar_content() {
        const currentSprite = sprite()
        const currentState = state()
        const color = STATE_COLORS[currentState]
        const bubble = speechBubble()
        return (
          <box paddingX={1} paddingY={1} flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <text fg="#bd93f9"><b>{PET_ICONS[petType()] || "🐾"} {petType()}</b></text>
              <text fg={color}>{STATE_ICONS[currentState]} {currentState}</text>
            </box>
            {bubble ? (
              <box flexDirection="column" gap={0}>
                <text fg="#f8f8f2"> .----------------.</text>
                <text fg="#f8f8f2">({bubble.padEnd(16)})</text>
                <text fg="#f8f8f2"> '------.  .-----'</text>
                <text fg="#f8f8f2">        | /</text>
              </box>
            ) : null}
            <box flexDirection="column" alignItems="center" minHeight={HL}>
              {currentSprite.map((l: string, i: number) => <text key={i} fg={color}>{l}</text>)}
            </box>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = { id: "opencode-pets", tui: PetsPlugin }
export default plugin
