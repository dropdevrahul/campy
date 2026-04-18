# campy - Animated Terminal Pets Plugin for OpenCode & Claude Code

Bring ASCII pets to your terminal sidebar! Campy adds animated pets that cycle through frames, react to coding events, and show Clippy-style speech bubbles.

## Features

- **4 Pet Types**: Cat, Hamster, Ghost, and Robot
- **7 Animation States**: idle, happy, sleeping, eating, playing, excited, sad — with multi-step animations and blinking
- **Speech Bubbles**: All pets show contextual messages like Clippy — "Edited app.tsx!", "Thinking...", "Need a hand?"
- **Happiness Counter**: Feed, play with, or pet your companion to raise happiness
- **Event Reactions**: Pets react to tool use, file edits, errors, and idle states
- **Slash Commands**: `/pet feed`, `/pet play`, `/pet robot`, etc.
- **Claude Code Plugin**: Standalone ghost-pet plugin for Claude Code with hooks

## Installation

### OpenCode

1. Copy the `.opencode/` directory into your project:

   ```bash
   cp -r .opencode/ /path/to/your/project/
   ```

2. Restart OpenCode and the pet will appear in the sidebar.

### Claude Code

1. Copy the `ghost-pet/` directory to your project or install as a plugin:

   ```bash
   cp -r ghost-pet/ /path/to/your/project/ghost-pet
   ```

2. Run Claude Code with the plugin:

   ```bash
   claude --plugin-dir ./ghost-pet
   ```

3. Use slash commands to interact:
   ```
   /ghost-pet:ghost       — Check on your ghost
   /ghost-pet:ghost-feed  — Feed your ghost (+15 happiness)
   /ghost-pet:ghost-play  — Play with your ghost (+20 happiness)
   /ghost-pet:ghost-pet   — Pet your ghost (+10 happiness)
   ```

The ghost pet automatically reacts via hooks:
- Successful tool use → ghost gets happy
- Tool failure → ghost gets sad

## Configuration

Edit `.opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "opencode",
  "plugin": [
    ["./plugins/pets.tsx", {
      "name": "Whiskers",
      "animations": {
        "fps": 3
      }
    }]
  ]
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `"Whiskers"` | Custom name for your pet |
| `animations.fps` | `number` | `3` | Animation frame rate |

## Slash Commands

Type any of these in the OpenCode prompt:

| Command | Effect |
|---------|--------|
| `/pet feed` | Feed your pet (+15 happiness) |
| `/pet play` | Play with your pet (+20 happiness) |
| `/pet pet` | Pet your pet (+10 happiness) |
| `/pet cat` | Switch to cat |
| `/pet hamster` | Switch to hamster |
| `/pet ghost` | Switch to ghost |
| `/pet robot` | Switch to robot |

## Available Pets

| Pet | States | Blinking | Emoji | Speech |
|-----|--------|----------|-------|--------|
| Cat | 7 states | Yes (layered eyes) | 🐱 | Yes |
| Hamster | 7 states | Yes (frame-step) | 🐹 | Yes |
| Ghost | 7 states | Yes (layered eyes) | 👻 | Yes |
| Robot | 7 states | Yes (layered eyes) | 🤖 | Yes |

## Speech Bubbles

All pets show Clippy-style speech bubbles on events:

| Event | Bubble Text |
|-------|-------------|
| `file.edited` | `"Edited {filename}!"` |
| `session.error` | `"Error! Let me help..."` |
| `message.part.delta` | `"Thinking..."` |
| `command.executed` | `"Ran {command}!"` |
| `session.idle` | Random Clippy-ism |
| `tui.prompt.append` | `"I'm here!"` |

Idle phrases: "Need a hand?", "Looks good!", "Can I help?", "Watching you code...", "Beep boop!", "I'm here!", "Keep going!", "What's next?"

## File Structure

```
.opencode/
├── plugins/
│   └── pets.tsx              # Main OpenCode plugin (4 pets)
└── tui.json                  # Plugin configuration

ghost-pet/
├── .claude-plugin/
│   └── plugin.json            # Claude Code plugin manifest
├── commands/
│   ├── ghost.md              # /ghost-pet:ghost
│   ├── ghost-feed.md          # /ghost-pet:ghost-feed
│   ├── ghost-play.md          # /ghost-pet:ghost-play
│   └── ghost-pet.md           # /ghost-pet:ghost-pet
├── ghost-pet.sh              # Core: state machine + ASCII renderer
└── hooks/
    ├── post-tool-use.sh       # +2 happiness on success
    └── post-tool-use-failure.sh # -5 happiness on failure
```

## License

MIT