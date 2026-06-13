// campy — Pi coding-agent adapter.
//
// Pi (earendil-works/pi) is a TUI coding agent with a rich extension API. Unlike
// most CLI agents it has a native multi-line widget surface (`ctx.ui.setWidget`),
// so the pet renders at full fidelity in-process — exactly like the OpenCode
// sidebar — driven by the shared core PetRuntime.
//
// Install with: campy install pi   (writes ~/.pi/agent/extensions/campy.ts)
// Docs: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md

import { PetRuntime, type PetView } from "../../core/runtime"
import { PET_NAMES } from "../../core/pets"
import { petLines } from "../../core/render"
import type { CanonicalEvent, EventPayload } from "../../core/events"
import { writeState, readState } from "../../core/store"
import type { ExtensionAPI, PiContext, PiEvent } from "./pi-types"

const WIDGET_ID = "campy"

// Pi's built-in file-mutating tools vs. shell tool, so we can pick the right event.
const FILE_TOOLS = new Set(["write", "edit", "apply_patch", "multi_edit"])
const SHELL_TOOLS = new Set(["bash", "shell", "exec"])

const toolName = (e: PiEvent): string =>
  String(e.tool ?? e.toolName ?? e.name ?? e.tool_name ?? "").toLowerCase()

const toolArgs = (e: PiEvent): Record<string, any> =>
  (e.args ?? e.arguments ?? e.params ?? e.input ?? {}) as Record<string, any>

const isErrorResult = (e: PiEvent): boolean =>
  Boolean(e.isError ?? e.error ?? e.is_error ?? e.result?.isError ?? e.result?.error)

export default function campyPiExtension(pi: ExtensionAPI): void {
  let ctx: PiContext | undefined

  const runtime = new PetRuntime({
    pet: readState().pet,
    onRender: (view: PetView) => {
      ctx?.ui.setWidget(WIDGET_ID, petLines(view))
      // Best-effort mirror to the state file so a statusline / `campy watch`
      // pane elsewhere stays in sync. Never let persistence break the TUI.
      try {
        writeState({
          pet: view.pet,
          mood: view.state,
          happiness: view.happiness,
          speech: view.speech,
          speech_until: view.speech ? Date.now() + 4000 : 0,
          updated_at: Date.now(),
        })
      } catch { /* ignore */ }
    },
  })

  const emit = (event: CanonicalEvent, payload: EventPayload = {}) => runtime.handleEvent(event, payload)

  // ---- lifecycle & events ----------------------------------------------

  pi.on("session_start", (_e, c) => {
    ctx = c
    runtime.start()
    emit("attached")
  })

  pi.on("tool_execution_start", (_e, c) => { ctx = c; emit("thinking") })

  pi.on("tool_execution_end", (e, c) => {
    ctx = c
    if (isErrorResult(e)) { emit("error"); return }
    const name = toolName(e)
    const args = toolArgs(e)
    if (FILE_TOOLS.has(name)) emit("file_edited", { file: args.path ?? args.file ?? args.filename })
    else if (SHELL_TOOLS.has(name)) emit("command_run", { cmd: String(args.command ?? args.cmd ?? "").split(/\s+/)[0] })
  })

  // Some Pi versions surface failures via `tool_result` instead.
  pi.on("tool_result", (e, c) => { ctx = c; if (isErrorResult(e)) emit("error") })

  // Agent finished all tool calls for this turn → settle back to idle.
  pi.on("agent_end", (_e, c) => { ctx = c; emit("idle") })

  pi.on("session_shutdown", () => runtime.destroy())

  // ---- slash commands ---------------------------------------------------

  const notify = (c: PiContext, msg: string) => c.ui.notify(msg, "info")

  pi.registerCommand("campy:feed", {
    description: "Feed your pet (+15 happiness)",
    handler: (_a, c) => { ctx = c; runtime.feed(); notify(c, "Fed your pet!") },
  })
  pi.registerCommand("campy:play", {
    description: "Play with your pet (+20 happiness)",
    handler: (_a, c) => { ctx = c; runtime.play(); notify(c, "Played!") },
  })
  pi.registerCommand("campy:pet", {
    description: "Pet your pet (+10 happiness)",
    handler: (_a, c) => { ctx = c; runtime.pet(); notify(c, "Pet!") },
  })
  pi.registerCommand("campy:sleep", {
    description: "Put your pet to sleep",
    handler: (_a, c) => { ctx = c; runtime.sleep() },
  })
  pi.registerCommand("campy:wake", {
    description: "Wake your pet",
    handler: (_a, c) => { ctx = c; runtime.wake() },
  })
  pi.registerCommand("campy:switch", {
    description: `Switch pet (${PET_NAMES.join(", ")})`,
    handler: (args, c) => {
      ctx = c
      const pet = args.trim()
      if (!PET_NAMES.includes(pet)) { c.ui.notify(`Unknown pet: ${pet}`, "error"); return }
      runtime.switchPet(pet)
    },
    getArgumentCompletions: (prefix) =>
      PET_NAMES.filter(p => p.startsWith(prefix)).map(p => ({ value: p, label: p })),
  })
}
