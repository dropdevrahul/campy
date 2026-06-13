import { existsSync } from "node:fs"
import { join } from "node:path"

export type AgentId = "claude-code" | "opencode" | "pi" | "gemini" | "codex" | "cursor" | "aider"

const ORDER: AgentId[] = ["claude-code", "opencode", "pi", "gemini", "codex", "cursor", "aider"]

// Pure, testable detection: which agents look installed/used, based on the
// presence of their well-known config directories. `campy setup` uses this to
// wire each detected agent the native way.
export const detectAgents = (opts: { home: string; cwd: string }): AgentId[] => {
  const { home, cwd } = opts
  const present: Record<AgentId, boolean> = {
    "claude-code": existsSync(join(home, ".claude")),
    opencode: existsSync(join(cwd, ".opencode")) || existsSync(join(home, ".config", "opencode")),
    pi: existsSync(join(home, ".pi")),
    gemini: existsSync(join(home, ".gemini")),
    codex: existsSync(join(home, ".codex")),
    cursor: existsSync(join(home, ".cursor")),
    aider: existsSync(join(home, ".aider.conf.yml")) || existsSync(join(cwd, ".aider.conf.yml")),
  }
  return ORDER.filter(id => present[id])
}
