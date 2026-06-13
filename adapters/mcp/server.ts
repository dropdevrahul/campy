// campy — Model Context Protocol (stdio) server.
//
// A dependency-free JSON-RPC 2.0 server over newline-delimited stdio. This is
// the adapter for agents whose native extension surface is MCP (Gemini CLI,
// Codex CLI, Cursor CLI). It does two things:
//   1. Watches the project directory and emits `file_edited` events into the
//      shared state file — so a `campy watch` pane / statusline animates as the
//      agent edits, even though MCP can't observe the host's own tools.
//   2. Exposes `campy_*` tools so the agent (or user) can show & interact with
//      the pet inline in chat.
//
// CRITICAL: stdout is the protocol channel. All logging MUST go to stderr.

import { createInterface } from "node:readline"
import { watch } from "node:fs"
import { basename } from "node:path"

import { readState } from "../../core/store"
import { applyInteraction, applySwitch } from "../../core/actions"
import { applyEvent } from "../../core/actions"
import { petCard } from "../../core/render"
import { PET_NAMES } from "../../core/pets"

const VERSION = "1.0.0"
const PROTOCOL_VERSION = "2025-06-18"

const log = (msg: string): void => { process.stderr.write(`[campy mcp] ${msg}\n`) }

type JsonRpcRequest = { jsonrpc?: string; id?: number | string | null; method?: string; params?: any }

const ok = (id: any, result: any) => ({ jsonrpc: "2.0", id, result })
const err = (id: any, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } })
const text = (s: string, isError = false) => ({ content: [{ type: "text", text: s }], ...(isError ? { isError: true } : {}) })

const TOOLS = [
  { name: "campy_status", description: "Show the campy pet's current mood, happiness, and ASCII art.", inputSchema: { type: "object", properties: {} } },
  { name: "campy_feed", description: "Feed the pet (+15 happiness).", inputSchema: { type: "object", properties: {} } },
  { name: "campy_play", description: "Play with the pet (+20 happiness).", inputSchema: { type: "object", properties: {} } },
  { name: "campy_pet", description: "Pet the pet (+10 happiness).", inputSchema: { type: "object", properties: {} } },
  {
    name: "campy_switch",
    description: `Switch the active pet. One of: ${PET_NAMES.join(", ")}.`,
    inputSchema: { type: "object", properties: { pet: { type: "string", enum: PET_NAMES } }, required: ["pet"] },
  },
]

const callTool = (name: string, args: Record<string, any>) => {
  switch (name) {
    case "campy_status": return text(petCard(readState()))
    case "campy_feed": return text(petCard(applyInteraction("feed")))
    case "campy_play": return text(petCard(applyInteraction("play")))
    case "campy_pet": return text(petCard(applyInteraction("pet")))
    case "campy_switch": {
      const pet = String(args?.pet ?? "")
      if (!PET_NAMES.includes(pet)) return text(`Unknown pet "${pet}". Try: ${PET_NAMES.join(", ")}`, true)
      return text(petCard(applySwitch(pet)))
    }
    default:
      return text(`Unknown tool: ${name}`, true)
  }
}

// Handle a single JSON-RPC message. Returns the response object, or null for
// notifications (messages without an id).
export const dispatch = (msg: JsonRpcRequest): object | null => {
  const { id, method, params } = msg
  const isNotification = id === undefined || id === null

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "campy", version: VERSION },
      })
    case "notifications/initialized":
      return null
    case "ping":
      return ok(id, {})
    case "tools/list":
      return ok(id, { tools: TOOLS })
    case "tools/call":
      try {
        return ok(id, callTool(params?.name, params?.arguments ?? {}))
      } catch (e: any) {
        return ok(id, text(`Error: ${e?.message ?? e}`, true))
      }
    default:
      if (isNotification) return null
      return err(id, -32601, `Method not found: ${method}`)
  }
}

const IGNORE = ["node_modules", "/.git", ".campy", "/dist/", "/.cache/"]
const shouldIgnore = (file: string): boolean => IGNORE.some(p => file.includes(p))

const startWatcher = (dir: string): void => {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: string | undefined
  try {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return
      const file = filename.toString()
      if (shouldIgnore(file)) return
      pending = basename(file)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        try { applyEvent("file_edited", { file: pending }) } catch (e: any) { log(`event failed: ${e?.message}`) }
      }, 400)
    })
    log(`watching ${dir} for edits`)
  } catch (e: any) {
    // Recursive watch isn't supported everywhere — tools still work without it.
    log(`file watching unavailable (${e?.message}); tools still active`)
  }
}

export const runMcpServer = (opts: { dir?: string } = {}): void => {
  const dir = opts.dir ?? process.cwd()
  startWatcher(dir)

  const rl = createInterface({ input: process.stdin })
  rl.on("line", (line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    let msg: JsonRpcRequest
    try {
      msg = JSON.parse(trimmed)
    } catch {
      log(`ignoring non-JSON line`)
      return
    }
    const resp = dispatch(msg)
    if (resp !== null) process.stdout.write(JSON.stringify(resp) + "\n")
  })
  log(`campy MCP server ready (stdio)`)
}
