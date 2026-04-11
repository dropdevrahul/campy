/** @jsxImportSource @opentui/solid */
import { createSignal, onMount } from "solid-js"
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const MinimalPetsPlugin: TuiPlugin = async (api) => {
  const [count, setCount] = createSignal(0)

  onMount(() => {
    setInterval(() => setCount(c => c + 1), 1000)
  })

  api.slots.register({
    order: 350,
    slots: {
      sidebar_content(ctx) {
        return (
          <box border padding={1}>
            <text>🐱 Pet Panel</text>
            <text>Count: {count()}</text>
            <text>Terminal: {ctx.terminal?.width || "unknown"}x{ctx.terminal?.height || "unknown"}</text>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-pets-minimal",
  tui: MinimalPetsPlugin,
}

export default plugin
