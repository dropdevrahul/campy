# campy - Animated Terminal Pets Plugin for OpenCode

Bring ASCII pets to your OpenCode terminal sidebar! Campy adds animated pets that cycle through frames and respond to your interactions.

## Features

- **5 Pet Types**: Cat, Dog, Hamster, Corgi, and Ghost
- **Animation Frames**: Each pet has multiple frames that cycle automatically
- **Happiness Counter**: Feed, play with, or pet your companion to raise happiness
- **Slash Commands**: `/pet feed`, `/pet play`, `/pet cat`, etc.
- **Sidebar Display**: Pets render in the OpenCode sidebar

## Installation

1. Copy the `.opencode/` directory into your project:

   ```bash
   cp -r .opencode/ /path/to/your/project/
   ```

2. Restart OpenCode and the pet will appear in the sidebar.

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
| `/pet dog` | Switch to dog |
| `/pet hamster` | Switch to hamster |
| `/pet ghost` | Switch to ghost |
| `/pet corgi` | Switch to corgi |

## Available Pets

| Pet | Default Frames |
|-----|----------------|
| Cat | 4 animation frames |
| Dog | 3 animation frames |
| Hamster | 3 animation frames |
| Ghost | 3 animation frames |
| Corgi | 3 animation frames |

## File Structure

```
.opencode/
├── plugins/
│   └── pets.tsx              # Main plugin
├── themes/
│   └── pets-theme.json       # Pet theme colors
└── tui.json                  # Plugin configuration
```

## Roadmap

These features are planned but not yet implemented:

- [ ] Reactive emotional states (happy on success, sad on errors)
- [ ] Size/color/position configuration options
- [ ] Clickable UI buttons in sidebar
- [ ] Keyboard shortcuts (p, P, +, -)
- [ ] Event integration (session, tool, file events)
- [ ] Automatic happiness decay over time
- [ ] Theme integration via pets-theme.json
- [ ] State persistence between sessions

## License

MIT