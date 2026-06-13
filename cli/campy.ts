#!/usr/bin/env bun
import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, chmodSync } from "node:fs"
import { spawnSync } from "node:child_process"

import { PetRuntime, type PetView } from "../core/runtime"
import { PET_NAMES } from "../core/pets"
import { ansiFg, ANSI_RESET } from "../core/theme"
import { meterBar, INTERACTION_DELTA } from "../core/happiness"
import { speechBubble, statusLine } from "../core/render"
import { isCanonicalEvent } from "../core/events"
import { readState, statePath } from "../core/store"
import {
  applyEvent,
  applyInteraction,
  applySleep,
  applyWake,
  applySwitch,
} from "../core/actions"
import { detectAgents, type AgentId } from "../core/detect"
import { runMcpServer } from "../adapters/mcp/server"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const CLI = join(REPO_ROOT, "cli", "campy.ts")

// ---- arg parsing --------------------------------------------------------

const argv = process.argv.slice(2)
const cmd = argv[0] ?? "status"
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const positional = argv.slice(1).filter(a => !a.startsWith("--"))

// The command generated configs use to launch campy as an MCP server / watcher.
const campyCmd = (): { command: string; args: string[] } => ({ command: "bun", args: [CLI] })
const has = (bin: string): boolean => spawnSync("sh", ["-c", `command -v ${bin}`], { stdio: "ignore" }).status === 0

// ---- watcher (long-lived renderer) --------------------------------------

const watch = (): void => {
  let store = readState()
  let lastSeen = store.updated_at
  let storeHappiness = store.happiness

  const draw = (view: PetView): void => {
    const color = ansiFg(view.color)
    const out: string[] = []
    out.push(`${view.petIcon} ${view.pet}   ${view.stateIcon} ${view.state}   ${meterBar(storeHappiness)} ${storeHappiness}%`)
    out.push("")
    out.push(...(view.speech ? speechBubble(view.speech) : ["", "", "", ""]))
    out.push("")
    for (const l of view.sprite) out.push(color + l + ANSI_RESET)
    process.stdout.write("\x1b[2J\x1b[H" + out.join("\r\n") + "\r\n")
  }

  const rt = new PetRuntime({ pet: store.pet, happiness: store.happiness, onRender: draw })

  process.stdout.write("\x1b[?1049h\x1b[?25l")
  const cleanup = () => {
    rt.destroy()
    process.stdout.write("\x1b[?25h\x1b[?1049l")
    process.exit(0)
  }
  process.on("SIGINT", cleanup)
  process.on("SIGTERM", cleanup)

  rt.start()

  // poll the state file for changes written by hooks / interactions / MCP
  setInterval(() => {
    store = readState()
    if (store.updated_at === lastSeen) return
    lastSeen = store.updated_at
    storeHappiness = store.happiness

    if (store.pet !== rt.currentPet) { rt.switchPet(store.pet); return }

    const remaining = Math.max(800, store.speech_until - Date.now())
    if (store.mood === "idle") rt.wake()
    else rt.overrideState(store.mood, remaining, store.speech || undefined)
  }, 250)
}

// ---- side-pane renderer -------------------------------------------------

const attach = (): void => {
  const watchCmd = `bun ${JSON.stringify(CLI)} watch`
  const spawn = (file: string, args: string[]) => spawnSync(file, args, { stdio: "inherit" })
  if (process.env.TMUX && has("tmux")) { spawn("tmux", ["split-window", "-h", watchCmd]); console.log("✓ Spawned campy in a tmux pane"); return }
  if (process.env.ZELLIJ && has("zellij")) { spawn("zellij", ["action", "new-pane", "--", "bash", "-c", watchCmd]); console.log("✓ Spawned campy in a zellij pane"); return }
  if (has("wezterm")) { spawn("wezterm", ["cli", "split-pane", "--", "bash", "-c", watchCmd]); console.log("✓ Spawned campy in a wezterm pane"); return }
  if (has("kitten")) { spawn("kitten", ["@", "launch", "--type=window", "bash", "-c", watchCmd]); console.log("✓ Spawned campy in a kitty window"); return }
  console.log("No supported multiplexer detected (tmux / zellij / wezterm / kitty).")
  console.log(`Run this in another pane:\n  ${watchCmd}`)
}

// ---- install scaffolding ------------------------------------------------

const HOME = process.env.HOME || "."

const installPi = (): void => {
  const dir = process.env.PI_EXTENSIONS_DIR || join(HOME, ".pi", "agent", "extensions")
  mkdirSync(dir, { recursive: true })
  const target = join(dir, "campy.ts")
  const adapter = join(REPO_ROOT, "adapters", "pi", "index.ts")
  writeFileSync(target, `// Installed by \`campy install pi\`. Re-exports the campy Pi adapter.\nexport { default } from ${JSON.stringify(adapter)}\n`, "utf8")
  console.log(`✓ Installed Pi extension → ${target}`)
  console.log(`  Restart pi; the pet appears as a widget. Commands: /campy:feed /campy:play /campy:pet /campy:switch`)
}

const installClaudeCode = (): void => {
  const hooks = join(REPO_ROOT, "adapters", "claude-code", "hooks")
  const statusbin = join(REPO_ROOT, "adapters", "claude-code", "statusline.sh")
  const plugin = join(REPO_ROOT, "adapters", "claude-code")
  console.log("Native (marketplace):  /plugin marketplace add dropdevrahul/campy   then   /plugin install campy")
  console.log("Or load locally:        claude --plugin-dir " + plugin)
  console.log("\nManual settings.json (.claude/settings.json):\n")
  console.log(JSON.stringify({
    statusLine: { type: "command", command: `bash ${statusbin}` },
    hooks: {
      SessionStart: [{ hooks: [{ type: "command", command: `bash ${join(hooks, "session-start.sh")}` }] }],
      PreToolUse: [{ matcher: "*", hooks: [{ type: "command", command: `bash ${join(hooks, "pre-tool-use.sh")}` }] }],
      PostToolUse: [{ matcher: "*", hooks: [{ type: "command", command: `bash ${join(hooks, "post-tool-use.sh")}` }] }],
      Stop: [{ hooks: [{ type: "command", command: `bash ${join(hooks, "stop.sh")}` }] }],
    },
  }, null, 2))
  console.log(`\nThen render in a side pane:  campy attach`)
}

const installGemini = (): void => {
  const dir = join(HOME, ".gemini", "extensions", "campy")
  mkdirSync(dir, { recursive: true })
  const { command, args } = campyCmd()
  const ext = { name: "campy", version: "1.0.0", contextFileName: "GEMINI.md", mcpServers: { campy: { command, args: [...args, "mcp"] } } }
  writeFileSync(join(dir, "gemini-extension.json"), JSON.stringify(ext, null, 2) + "\n")
  const ctxSrc = join(REPO_ROOT, "adapters", "gemini", "GEMINI.md")
  if (existsSync(ctxSrc)) copyFileSync(ctxSrc, join(dir, "GEMINI.md"))
  console.log(`✓ Installed Gemini extension → ${dir}`)
  console.log(`  Restart gemini. Render with:  campy attach`)
}

const installCodex = (): void => {
  const dir = join(HOME, ".codex")
  mkdirSync(dir, { recursive: true })
  const file = join(dir, "config.toml")
  const toml = existsSync(file) ? readFileSync(file, "utf8") : ""
  if (toml.includes("[mcp_servers.campy]")) { console.log(`✓ Codex already has [mcp_servers.campy] in ${file}`); return }
  const { command, args } = campyCmd()
  const block = `\n[mcp_servers.campy]\ncommand = ${JSON.stringify(command)}\nargs = ${JSON.stringify([...args, "mcp"])}\n`
  writeFileSync(file, toml + block)
  console.log(`✓ Added [mcp_servers.campy] → ${file}`)
  console.log(`  Render with:  campy attach`)
}

const installCursor = (): void => {
  const dir = join(HOME, ".cursor")
  mkdirSync(dir, { recursive: true })
  const file = join(dir, "mcp.json")
  let cfg: any = {}
  if (existsSync(file)) { try { cfg = JSON.parse(readFileSync(file, "utf8")) } catch { cfg = {} } }
  cfg.mcpServers = cfg.mcpServers || {}
  const { command, args } = campyCmd()
  cfg.mcpServers.campy = { command, args: [...args, "mcp"] }
  writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n")
  console.log(`✓ Added campy MCP server → ${file}`)
  console.log(`  Render with:  campy attach`)
}

const installAider = (): void => {
  const cwd = process.cwd()
  if (!existsSync(join(cwd, ".git"))) { console.log("Not a git repo — run inside your project (aider auto-commits to git)."); return }
  const hooksDir = join(cwd, ".git", "hooks")
  mkdirSync(hooksDir, { recursive: true })
  const file = join(hooksDir, "post-commit")
  const hookLine = `command -v bun >/dev/null 2>&1 && bun ${JSON.stringify(CLI)} event file_edited >/dev/null 2>&1 || true`
  let content: string
  if (existsSync(file)) {
    content = readFileSync(file, "utf8")
    if (content.includes("event file_edited")) { console.log(`✓ Aider post-commit hook already installed`); return }
    content = content.replace(/\n*$/, "\n") + hookLine + "\n"
  } else {
    content = `#!/usr/bin/env bash\n${hookLine}\n`
  }
  writeFileSync(file, content)
  chmodSync(file, 0o755)
  console.log(`✓ Installed git post-commit hook → ${file}`)
  console.log(`  Render with:  campy attach`)
}

const installOpenCode = (): void => {
  console.log("OpenCode: add the plugin to your opencode.json / .opencode/tui.json:")
  console.log(`  "plugin": [${JSON.stringify(join(REPO_ROOT, ".opencode", "plugins", "pets.tsx"))}]`)
  console.log("  (this repo's .opencode/ already wires it; npm distribution is future work)")
}

const INSTALLERS: Record<AgentId, () => void> = {
  "claude-code": installClaudeCode,
  opencode: installOpenCode,
  pi: installPi,
  gemini: installGemini,
  codex: installCodex,
  cursor: installCursor,
  aider: installAider,
}
const INSTALL_TARGETS = Object.keys(INSTALLERS).join(" | ")

const setup = (): void => {
  const found = detectAgents({ home: HOME, cwd: process.cwd() })
  if (found.length === 0) {
    console.log("No known agents detected (looked for ~/.claude, ~/.pi, ~/.gemini, ~/.codex, ~/.cursor, .opencode/, aider).")
    console.log(`Install one explicitly:  campy install <${INSTALL_TARGETS}>`)
    return
  }
  console.log(`Detected: ${found.join(", ")}\n`)
  for (const id of found) {
    console.log(`── ${id} ──`)
    INSTALLERS[id]()
    console.log("")
  }
  console.log(`Then run the pet in a side pane:  campy attach`)
}

// ---- main ---------------------------------------------------------------

const printStatus = (): void => {
  const s = readState()
  console.log(statusLine(s))
  console.log(`(pet=${s.pet} mood=${s.mood} happiness=${s.happiness}% — state file: ${statePath()})`)
}

const usage = (): void => {
  console.log(`campy — animated terminal pets for CLI coding agents

Usage: campy <command> [options]

  watch                       Long-lived animated renderer (run in a side pane)
  attach                      Spawn a watch pane in tmux / zellij / wezterm / kitty
  statusline                  Print one status line and exit
  mcp [--dir d]               Run the MCP server (stdio) for Gemini/Codex/Cursor
  event <name> [--file f] [--cmd c]
                              Apply a canonical event (${["thinking","file_edited","command_run","error","attached","idle"].join(", ")})
  feed | play | pet           Interact (happiness +${INTERACTION_DELTA.feed}/+${INTERACTION_DELTA.play}/+${INTERACTION_DELTA.pet})
  sleep | wake                Put the pet to sleep / wake it
  switch <pet>                Switch pet (${PET_NAMES.join(", ")})
  status                      Show current pet state
  setup                       Detect installed agents and wire each natively
  install <agent>             Scaffold one agent (${INSTALL_TARGETS})

State file: ${statePath()}  (override with CAMPY_STATE)`)
}

switch (cmd) {
  case "watch": watch(); break
  case "attach": attach(); break
  case "statusline": console.log(statusLine(readState())); break
  case "mcp": runMcpServer({ dir: flag("dir") }); break
  case "event": {
    const name = positional[0]
    if (!name || !isCanonicalEvent(name)) { console.error(`Unknown event: ${name}`); process.exit(1) }
    applyEvent(name, { file: flag("file"), cmd: flag("cmd") })
    break
  }
  case "feed": applyInteraction("feed"); printStatus(); break
  case "play": applyInteraction("play"); printStatus(); break
  case "pet": applyInteraction("pet"); printStatus(); break
  case "sleep": applySleep(); printStatus(); break
  case "wake": applyWake(); printStatus(); break
  case "switch": {
    const pet = positional[0]
    if (!pet || !PET_NAMES.includes(pet)) { console.error(`Unknown pet: ${pet}. Try: ${PET_NAMES.join(", ")}`); process.exit(1) }
    applySwitch(pet); printStatus(); break
  }
  case "status": printStatus(); break
  case "setup": setup(); break
  case "install": {
    const target = positional[0] as AgentId | undefined
    if (target && target in INSTALLERS) INSTALLERS[target]()
    else { console.error(`Usage: campy install <${INSTALL_TARGETS}>`); process.exit(1) }
    break
  }
  case "help": case "--help": case "-h": usage(); break
  default:
    console.error(`Unknown command: ${cmd}\n`); usage(); process.exit(1)
}
