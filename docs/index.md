# campy

**Animated ASCII terminal pets for CLI coding agents.**

campy brings a small animated companion to your terminal sidebar. Your pet reacts to what you're working on — it animates through moods, blinks, and drops speech bubbles when a file is edited, a command runs, or an error fires. When things go quiet, it settles into an idle state and waits patiently.

There are four pets to choose from (Cat, Hamster, Ghost, Robot), each with seven animation states and its own personality. A single `campy` binary handles everything; per-agent adapters wire it natively into Claude Code, OpenCode, Pi, Gemini CLI, Codex CLI, Cursor CLI, and Aider.

## What campy is

- A CLI tool (`campy`) that manages pet state through a shared state file (`~/.campy/state.json`)
- A set of per-agent adapters that hook into each agent's native extension surface
- A portable `core/` library that all adapters share — one source of truth for animations, state, and rendering

## What campy is not

campy doesn't modify your agent's context window or inject tokens into prompts. For Claude Code, hooks and the statusline are Bash scripts that run entirely outside the model. The pet reacts to events; it doesn't participate in conversations.

## Quick start

```bash
# Install (requires bun)
bun add -g github:dropdevrahul/campy

# Wire every agent you have installed
campy setup

# Run the pet in a side pane
campy watch
```

See [Installation](installation.md) for full setup instructions, or [Agents](agents.md) for per-agent wiring details.
