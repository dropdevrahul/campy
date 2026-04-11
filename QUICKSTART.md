# 🚀 Quick Start - OpenCode Pets

## Installation (One Command)

```bash
# Copy to your project
cp -r .opencode/ /path/to/your/project/
cd /path/to/your/project

# Run OpenCode
opencode
```

## Available Commands

### Basic Interactions
```
/pet feed       - Feed your pet (+15 happiness)
/pet play       - Play with your pet (+20 happiness)
/pet pet        - Pet your pet (+10 happiness)
/pet sleep      - Put pet to sleep
/pet wake       - Wake up pet
/pet status     - Check pet status
```

### Change Pet
```
/pet set cat      - Become a cat 🐱
/pet set dog      - Become a dog 🐕
/pet set hamster  - Become a hamster 🐹
/pet set corgi    - Become a corgi 🐶
/pet set ghost    - Become a ghost 👻
/pet list         - Show all pets
```

### Rename
```
/pet rename       - Open rename dialog
```

## Configuration

Edit `.opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["./plugins/pets.tsx", {
      "pet": "cat",
      "name": "Whiskers",
      "animations": {
        "fps": 4
      }
    }]
  ],
  "plugin_enabled": {
    "opencode-pets": true
  }
}
```

## Pet Types

| Command | Pet | Default Name |
|---------|-----|-------------|
| `/pet set cat` | 🐱 Cat | Whiskers |
| `/pet set dog` | 🐕 Dog | Buddy |
| `/pet set hamster` | 🐹 Hamster | Nibbles |
| `/pet set corgi` | 🐶 Corgi | Peanut |
| `/pet set ghost` | 👻 Ghost | Boo |

## Troubleshooting

**Plugin not showing?**
- Terminal must be 80+ columns wide
- Check `stty size`
- Restart OpenCode after config changes

**Commands not working?**
- Type `/pet` then press Tab for autocomplete
- Check that plugin is enabled in `tui.json`

**Animations slow?**
- Increase FPS in config: `"fps": 6`
- Valid range: 1-10
