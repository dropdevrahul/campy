# Installation

campy requires [bun](https://bun.sh). The CLI is a single TypeScript file with a `#!/usr/bin/env bun` shebang — no build step, no compilation.

```bash
# Install bun if you don't have it
curl -fsSL https://bun.sh/install | bash
```

campy isn't on the public npm registry yet, so you install it directly from GitHub.

## Option 1 — install from GitHub (recommended)

```bash
# via bun
bun add -g github:dropdevrahul/campy

# or via npm
npm install -g github:dropdevrahul/campy
```

This registers `campy` on your `$PATH`. Verify:

```bash
campy status
```

## Option 2 — clone and symlink

If you want to keep the source around to hack on it:

```bash
git clone https://github.com/dropdevrahul/campy.git ~/work/campy
cd ~/work/campy && bun install
chmod +x cli/campy.ts
ln -s "$PWD/cli/campy.ts" ~/.bun/bin/campy   # or any directory on $PATH
```

## Wire your agents

After installing the CLI, run the auto-setup to detect and wire every agent on your machine:

```bash
campy setup
```

This scans for `~/.claude`, `~/.gemini`, `~/.codex`, `~/.cursor`, `~/.pi`, `.opencode/`, and `.aider.conf.yml`, and wires each agent natively. To install for one agent specifically:

```bash
campy install claude-code   # | opencode | pi | gemini | codex | cursor | aider
```

## Show the pet

```bash
campy watch     # full-screen animated pet — run this in a side pane
campy attach    # auto-split a pane (tmux / zellij / wezterm / kitty)
```

`campy attach` detects your terminal multiplexer and opens a side pane automatically. If you're in a bare terminal with no multiplexer, run `campy watch` manually in a second pane.

## Verify the install

```bash
campy status    # prints current pet, mood, and happiness level
```

You should see output like:

```
pet: cat  state: idle  happiness: 75
```

If the command isn't found, make sure `~/.bun/bin` (or wherever you symlinked the binary) is on your `$PATH`.
