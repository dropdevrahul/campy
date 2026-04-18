# campy - OpenCode Pets Plugin

## Project Overview

**campy** is an animated terminal pets plugin for OpenCode and Claude Code featuring 4 ASCII pet types that react to coding events.

| Aspect | Details |
|--------|---------|
| Type | OpenCode TUI Plugin (Solid.js) |
| Main File | `.opencode/plugins/pets.tsx` |
| Config | `.opencode/tui.json` |


## Available Pets

| Pet | States | Emoji |
|-----|--------|-------|
| Cat | idle, happy, sad, sleeping, eating, playing, excited | 🐱 |
| Hamster | 7 states | 🐹 |
| Ghost | 7 states | 👻 |
| Robot | 7 states | 🤖 |

## File Structure

```
.opencode/
├── plugins/pets.tsx       # Main plugin (4 pets)
├── tui.json               # Configuration
├── themes/pets-theme.json # Theme colors
└── tui.dog.json, tui.ghost.json  # Alternative configs

ghost-pet/                 # Claude Code plugin
├── commands/              # /ghost-pet:* commands
└── hooks/                 # Event hooks

docs/superpowers/          # Design specs & plans
```

## Commands

OpenCode slash commands available:

```
/pet feed     - Feed pet (+15 happiness)
/pet play     - Play with pet (+20 happiness)
/pet pet      - Pet pet (+10 happiness)
/pet sleep    - Put pet to sleep
/pet wake     - Wake pet
/pet status   - Check mood & happiness
/pet cat      - Switch to cat
/pet hamster  - Switch to hamster
/pet ghost    - Switch to ghost
/pet robot    - Switch to robot
```

## Configuration

Edit `.opencode/tui.json`:

```json
{
  "plugin": ["./plugins/pets.tsx", {
    "name": "Whiskers",
    "animations": { "fps": 3 }
  }]
}
```

## Development

```bash
npm run dev    # Start plugin dev server
```

## Documentation

- `README.md` - Full feature overview
- `SPEC.md` - Technical specification (622 lines)
- `COMMANDS.md` - Commands & interactions
- `QUICKSTART.md` - Getting started
- `TROUBLESHOOTING.md` - Common issues

