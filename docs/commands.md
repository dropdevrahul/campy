# Commands

campy exposes commands through the CLI and through each agent's native slash-command or tool surface.

## CLI commands

The `campy` binary covers the full lifecycle: installing adapters, running the pet, sending events, and querying state.

```bash
campy watch              # full-screen animated pet (run in a side pane)
campy attach             # spawn a side pane (tmux / zellij / wezterm / kitty)
campy statusline         # print one status line and exit
campy status             # one-shot state dump (pet, mood, happiness)

campy setup              # detect installed agents and wire each natively
campy install <agent>    # pi | claude-code | opencode | gemini | codex | cursor | aider

campy feed               # feed the pet (+15 happiness)
campy play               # play with the pet (+20 happiness)
campy pet                # pet the pet (+10 happiness)
campy sleep              # put the pet to sleep
campy wake               # wake the pet

campy switch <name>      # switch to cat | hamster | ghost | robot
campy event <type>       # fire a canonical event (see below)
campy mcp                # run the MCP stdio server
```

## Slash commands

The prefix depends on which agent you're using.

### OpenCode / Pi

```
/pet feed
/pet play
/pet pet
/pet sleep
/pet wake
/pet status
/pet switch <name>
```

### Claude Code

```
/campy:feed
/campy:play
/campy:pet
/campy:switch <name>
```

### MCP agents (Gemini CLI, Codex CLI, Cursor CLI)

Call these as MCP tools:

```
campy_feed
campy_play
campy_pet
campy_switch
campy_status
```

## Happiness system

Each interaction changes the pet's happiness level (0–100):

| Command  | Happiness delta |
|----------|-----------------|
| `feed`   | +15             |
| `play`   | +20             |
| `pet`    | +10             |

Happiness gradually decreases over time. Keep it above 50 to keep your pet in a cheerful mood.

## Events

Events are fired automatically by hooks, but you can also fire them manually:

```bash
campy event file_edited --file path/to/file.ts
campy event command_run --cmd npm
campy event error
campy event idle
```

Canonical event types: `file_edited`, `command_run`, `error`, `idle`, `session_start`, `session_end`.
