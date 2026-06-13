/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

import catJson from "../../assets/ascii-frames/cat.json"
import ghostJson from "../../assets/ascii-frames/ghost.json"
import robotJson from "../../assets/ascii-frames/robot.json"

import type { FrameData } from "./lib/types"
import { GifEngine } from "./lib/gif-engine"
import { PET_COLORS } from "./config"

const petData: Record<string, FrameData> = {
  cat: catJson,
  ghost: ghostJson,
  robot: robotJson,
}

const GifPetsPlugin: TuiPlugin = async (api) => {
  const [sprite, setSprite] = createSignal<string[]>(["[no gif loaded]"])
  const [pet, setPet] = createSignal("cat")
  const [visible, setVisible] = createSignal(false)

  let engine: GifEngine | undefined

  const load = (p: string) => {
    engine?.destroy()
    const data = petData[p] ?? petData.cat
    engine = new GifEngine(data, { get: sprite, set: setSprite })
    engine.start()
  }

  const show = (p: string) => {
    setPet(p)
    setVisible(true)
    load(p)
    api.ui.toast({ message: "GIF Player on: " + p, variant: "success" })
  }

  const hide = () => {
    setVisible(false)
    engine?.destroy()
    api.ui.toast({ message: "GIF Player off", variant: "info" })
  }

  const showHelp = () => {
    api.ui.toast({ message: "Add .gif to assets/gifs/ then run: node scripts/gif-to-ascii.js", variant: "info" })
  }

  onMount(() => { load("cat") })
  onCleanup(() => { engine?.destroy() })

  api.command.register(() => [
    { title: "GIF On",  value: "gif on",  description: "Show GIF player", slash: { name: "gif on" }, onSelect: () => show("cat") },
    { title: "GIF Off", value: "gif off", description: "Hide GIF player", slash: { name: "gif off" }, onSelect: hide },
    { title: "GIF Cat",  value: "gif cat",  description: "Play cat GIF",    slash: { name: "gif cat" },  onSelect: () => show("cat") },
    { title: "GIF Ghost",value: "gif ghost",description: "Play ghost GIF",  slash: { name: "gif ghost" },onSelect: () => show("ghost") },
    { title: "GIF Robot",value: "gif robot",description: "Play robot GIF",  slash: { name: "gif robot" },onSelect: () => show("robot") },
    { title: "GIF Help", value: "gif help", description: "How to add a GIF", slash: { name: "gif help" }, onSelect: showHelp },
  ])

  api.slots.register({
    order: 360,
    slots: {
      sidebar_content() {
        if (!visible()) return null
        return (
          <box paddingX={1} paddingY={1} flexDirection="column" gap={1}>
            <text fg="#6272a4"><b>GIF Player</b></text>
            <box flexDirection="column" alignItems="center">
              {sprite().map((l: string, i: number) => <text key={i} fg={PET_COLORS[pet()] ?? "#bd93f9"}>{l}</text>)}
            </box>
            <text fg="#6272a4">/gif help /gif off</text>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = { id: "opencode-gif-pets", tui: GifPetsPlugin }
export default plugin
