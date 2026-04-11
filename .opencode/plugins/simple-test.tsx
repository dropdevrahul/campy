/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const SimpleTest: TuiPlugin = async (api) => {
  console.log("SIMPLE TEST: Plugin loading...")
  
  api.slots.register({
    order: 99,
    slots: {
      sidebar_content() {
        console.log("SIMPLE TEST: Rendering slot")
        return (
          <box border padding={1}>
            <text fg="#ff79c6">🐱 SIMPLE TEST PET</text>
            <text>If you see this, JSX is working!</text>
          </box>
        )
      }
    }
  })
  
  console.log("SIMPLE TEST: Plugin loaded")
}

const plugin: TuiPluginModule & { id: string } = {
  id: "simple-test",
  tui: SimpleTest,
}

export default plugin
