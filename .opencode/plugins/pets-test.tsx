/** @jsxImportSource @opentui/solid */
import { createSignal, onMount, onCleanup } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const TestPlugin: TuiPlugin = async (api, options: any = {}, meta) => {
  console.log("[PETS-TEST] ============================")
  console.log("[PETS-TEST] Plugin loading...")
  console.log("[PETS-TEST] Options received:", JSON.stringify(options))
  console.log("[PETS-TEST] Animations config:", options.animations)
  console.log("[PETS-TEST] FPS value:", options.animations?.fps)
  console.log("[PETS-TEST] ============================")

  const [frame, setFrame] = createSignal(0)
  let interval: any

  onMount(() => {
    const fps = options.animations?.fps || 2
    console.log("[PETS-TEST] Starting animation at", fps, "FPS")
    interval = setInterval(() => {
      setFrame(f => f + 1)
    }, 1000 / fps)
  })

  onCleanup(() => {
    if (interval) clearInterval(interval)
  })

  // Register command
  api.command.register(() => {
    console.log("[PETS-TEST] Registering /pet command")
    return [
      {
        name: "/pet",
        description: "Test pet command",
        execute: () => {
          console.log("[PETS-TEST] /pet command executed!")
          api.toast.show({ message: "Pet command works! 🎉", variant: "success" })
        },
      },
    ]
  })

  // Register sidebar
  console.log("[PETS-TEST] Registering sidebar slot...")
  api.slots.register({
    order: 350,
    slots: {
      sidebar_content() {
        console.log("[PETS-TEST] Rendering sidebar, frame:", frame())
        return (
          <box border borderColor="#ff79c6" padding={1} flexDirection="column" gap={1}>
            <text fg="#ff79c6"><b>🐱 TEST PET</b></text>
            <text fg="#f8f8f2">Frame: {frame()}</text>
            <text fg="#f8f8f2">FPS: {options.animations?.fps || 2}</text>
            <text fg="#bd93f9">Click or use /pet</text>
          </box>
        )
      },
    },
  })

  console.log("[PETS-TEST] Plugin loaded successfully!")
}

const plugin: TuiPluginModule & { id: string } = {
  id: "pets-test",
  tui: TestPlugin,
}

export default plugin
