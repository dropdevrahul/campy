# Agents

campy supports seven agents. Each one is wired through its own native extension surface so the pet shows up where you're actually looking while you code.

## Supported agents

| Agent       | Surface                          | Install command                 |
|-------------|----------------------------------|---------------------------------|
| Claude Code | statusline + reactive hooks      | `campy install claude-code`     |
| OpenCode    | native sidebar widget            | `campy install opencode`        |
| Pi          | native sidebar widget            | `campy install pi`              |
| Gemini CLI  | MCP tools (inline ASCII card)    | `campy install gemini`          |
| Codex CLI   | MCP tools (inline ASCII card)    | `campy install codex`           |
| Cursor CLI  | MCP tools (inline ASCII card)    | `campy install cursor`          |
| Aider       | `.git/hooks/post-commit`         | `campy install aider`           |

For agents without a built-in render surface, `campy attach` spawns a side pane in your terminal multiplexer.

## Claude Code

Claude Code is wired via the plugin marketplace. The adapter installs two reactive hooks (`PostToolUse` and `Stop`) and a `SessionStart` hook, plus a statusline script. Hooks are Bash scripts that run outside the model — they call the campy CLI to mutate pet state. The statusline renders the current pet inline.

```bash
campy install claude-code
```

!!! note "Zero-token operation"
    Hooks and the statusline never touch the model. Slash commands (`/campy:feed`, etc.) cost a small prompt only when you invoke them explicitly.

Available slash commands: `/campy:feed`, `/campy:play`, `/campy:pet`, `/campy:switch <pet>`.

## OpenCode and Pi

OpenCode and Pi both support in-process TUI widgets. campy ships a native sidebar plugin that registers at `order: 350` in the sidebar slot and reacts to OpenCode events (`file.edited`, `command.executed`, `session.error`, `session.idle`, `message.part.delta`, `tui.prompt.append`).

```bash
campy install opencode
campy install pi
```

Slash commands use the `/pet` prefix: `/pet feed`, `/pet play`, `/pet cat`, etc.

## Gemini CLI, Codex CLI, Cursor CLI

These agents support MCP (Model Context Protocol). campy runs a stdio MCP server that watches the project directory for file edits, fires `file_edited` events automatically, and exposes five tools:

| Tool             | Effect                         |
|------------------|--------------------------------|
| `campy_feed`     | Feed the pet (+15 happiness)   |
| `campy_play`     | Play with the pet (+20)        |
| `campy_pet`      | Pet the pet (+10)              |
| `campy_switch`   | Switch to a different pet      |
| `campy_status`   | Get current state as ASCII card |

```bash
campy install gemini   # writes ~/.gemini/extensions/campy/
campy install codex    # adds [mcp_servers.campy] to ~/.codex/config.toml
campy install cursor   # updates ~/.cursor/mcp.json
```

The MCP server is started with `campy mcp`.

## Aider

Aider is wired via a `post-commit` git hook that fires `file_edited` events after each commit.

```bash
campy install aider
```

Since Aider has no built-in widget surface, run `campy attach` or `campy watch` in a side pane to see the pet.
