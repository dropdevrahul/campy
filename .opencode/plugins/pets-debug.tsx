/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup, createEffect } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const DebugPetsPlugin: TuiPlugin = async (api, options = {}, meta) => {
  console.log("[PETS-DEBUG] Plugin initializing...")
  console.log("[PETS-DEBUG] Options:", options)
  console.log("[PETS-DEBUG] Meta:", meta)

  const [frame, setFrame] = createSignal(0)
  const [isVisible, setIsVisible] = createSignal(true)
  const [terminalWidth, setTerminalWidth] = createSignal(80)

  let animationInterval: ReturnType<typeof setInterval> | undefined

  // Simple cat sprite for testing
  const simpleCat = [
    "  /\\_____/\\  ",
    " /  o   o  \\ ",
    "(  == ^ ==  )",
    " \\  '-'  /  ",
    "  |     |   ",
    "  |     |   ",
    " (__)  (__) ",
  ]

  onMount(() => {
    console.log("[PETS-DEBUG] Component mounted")
    animationInterval = setInterval(() => {
      setFrame((f) => (f + 1) % 100)
    }, 500)
  })

  onCleanup(() => {
    console.log("[PETS-DEBUG] Component cleanup")
    if (animationInterval) clearInterval(animationInterval)
  })

  // Register sidebar slot
  console.log("[PETS-DEBUG] Registering sidebar slot...")
  
  api.slots.register({
    order: 350,
    slots: {
      sidebar_content(ctx, value) {
        console.log("[PETS-DEBUG] Rendering sidebar_content slot")
        console.log("[PETS-DEBUG] Context:", ctx)
        console.log("[PETS-DEBUG] Value:", value)
        
        const skin = ctx.theme?.current || { accent: "#ff79c6", text: "#f8f8f2", border: "#6272a4" }
        
        return (
          <box 
            border 
            borderColor={skin.accent || "#ff79c6"}
            padding={1} 
            flexDirection="column"
            gap={1}
          >
            <text fg={skin.accent || "#ff79c6"}><b>🐱 My Pet</b></text>
            <box flexDirection="column" alignItems="center">
              {simpleCat.map((line, idx) => (
                <text key={idx} fg={skin.text || "#f8f8f2"}>{line}</text>
              ))}
            </box>
            <text fg={skin.accent || "#ff79c6"}>Frame: {frame()}</text>
          </box>
        )
      },
    },
  })

  console.log("[PETS-DEBUG] Plugin initialized successfully")
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-pets-debug",
  tui: DebugPetsPlugin,
}

export default plugin
