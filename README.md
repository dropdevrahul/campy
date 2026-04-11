# 🐱 OpenCode Pets - Animated Terminal Pets Plugin

Bring delightful ASCII pets to your OpenCode terminal! This plugin adds animated pets to your sidebar that react to your coding session.

![Demo](https://img.shields.io/badge/OpenCode-Plugin-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ Features

- 🎨 **5 Adorable Pet Types**: Cat, Dog, Hamster, Corgi, and Ghost
- 😊 **Reactive Emotions**: Pets react to your coding session (happy on success, sad on errors)
- 🎭 **7 Different States**: Idle, happy, sad, sleeping, eating, playing, excited
- 💝 **Happiness System**: Feed, play, and interact with your pet
- 🎬 **Smooth Animations**: Configurable frame rate (1-10 FPS)
- 🎨 **Theme Support**: Integrates with OpenCode themes
- 🎯 **Event Integration**: Reacts to session events, tool executions, and more

## 🚀 Installation

### Quick Start

1. Copy the `.opencode/plugins/pets.tsx` file to your project's `.opencode/plugins/` directory

2. Add the plugin to your `.opencode/tui.json`:

```json
{
  "plugin": [
    ["./plugins/pets.tsx", {
      "pet": "cat",
      "name": "Whiskers"
    }]
  ],
  "plugin_enabled": {
    "opencode-pets": true
  }
}
```

3. Restart OpenCode and your pet will appear in the sidebar!

### Configuration Options

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["./plugins/pets.tsx", {
      "pet": "cat",
      "name": "Whiskers",
      "size": "small",
      "color": "auto",
      "position": "sidebar",
      "behavior": {
        "reactToEvents": true,
        "showMood": true,
        "animateIdle": true,
        "randomPlay": true
      },
      "animations": {
        "fps": 4,
        "enableAll": true
      }
    }]
  ]
}
```

### Option Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pet` | `string` | `"cat"` | Pet type: `"cat"`, `"dog"`, `"hamster"`, `"corgi"`, `"ghost"` |
| `name` | `string` | Pet default | Custom name for your pet |
| `size` | `string` | `"small"` | Pet size: `"tiny"`, `"small"`, `"medium"`, `"large"` |
| `color` | `string` | `"auto"` | Pet color: `"auto"` or ANSI color names |
| `position` | `string` | `"sidebar"` | Display position: `"sidebar"`, `"footer"`, `"hidden"` |
| `behavior.reactToEvents` | `boolean` | `true` | React to OpenCode events |
| `behavior.showMood` | `boolean` | `true` | Display mood indicator |
| `behavior.animateIdle` | `boolean` | `true` | Animate when idle |
| `behavior.randomPlay` | `boolean` | `true` | Random playtime events |
| `animations.fps` | `number` | `4` | Animation speed (1-10) |
| `animations.enableAll` | `boolean` | `true` | Enable all animations |

## 🐾 Available Pets

### Cat (🐱)
- **Default Name**: Whiskers
- **Personality**: Curious and independent
- **States**: 7 unique animations

### Dog (🐕)
- **Default Name**: Buddy
- **Personality**: Loyal and enthusiastic
- **States**: Wagging tail, happy bounces

### Hamster (🐹)
- **Default Name**: Nibbles
- **Personality**: Energetic and cute
- **States**: Running wheel, nom nom

### Corgi (🐶)
- **Default Name**: Peanut
- **Personality**: Playful and adorable
- **States**: Waddle, sploot, happy dance

### Ghost (👻)
- **Default Name**: Boo
- **Personality**: Spooky but friendly
- **States**: Floating, boo!, disappearing

## 🎮 Pet Behaviors

### States

| State | Trigger | Description |
|-------|---------|-------------|
| **Idle** | Default | Gentle breathing animation |
| **Happy** | Success, good code | Cheerful expressions, wagging |
| **Sad** | Errors, failures | Droopy ears, tears |
| **Sleeping** | 5min idle | Zzz animation |
| **Eating** | Tool execution | Nom nom animation |
| **Playing** | Random/fed | Bouncing/jumping |
| **Excited** | Session start | Rapid bouncing |

### Happiness System

- **Range**: 0-100 points
- **Decay**: -1 point every 5 minutes
- **Gain**: +5 points on successful tool execution
- **Loss**: -10 points on errors
- **Moods**:
  - 🟢 **Happy** (70-100): Cheerful, energetic
  - 🟡 **Neutral** (40-69): Calm, content
  - 🔴 **Sad** (0-39): Needs attention!

### Event Reactions

| Event | Reaction | Happiness Change |
|-------|----------|------------------|
| Session created | Excited bounce | +10 |
| Tool success | Happy | +5 |
| Tool error | Sad | -10 |
| File edited | Brief happy | +2 |
| Session error | Very sad | -20 |

## 🎨 Theme Integration

The plugin automatically adapts to your OpenCode theme. Pet colors use theme accent colors for consistency.

### Custom Pet Theme

Add to your theme file:

```json
{
  "pets": {
    "happy": "#50fa7b",
    "neutral": "#f8f8f2",
    "sad": "#ff5555",
    "sleeping": "#6272a4",
    "excited": "#ff79c6"
  }
}
```

## 🎯 User Interactions

### Actions
- **❤️ Pet**: Click to increase happiness
- **🎮 Play**: Trigger playtime animation
- **🍖 Feed**: Give your pet a treat
- **💤 Sleep**: Put your pet to bed

### Keyboard Shortcuts
- `p` - Toggle pet panel
- `P` - Open pet selector
- `+` - Feed pet
- `-` - Put pet to sleep

## 📁 File Structure

```
.opencode/
├── plugins/
│   └── pets.tsx              # Main plugin file
├── themes/
│   └── pets-theme.json       # Pet theme colors
└── tui.json                  # Plugin configuration
```

## 🔧 Development

### Plugin Architecture

The plugin uses:
- **OpenTUI/Solid**: Terminal UI framework with Solid.js reactivity
- **Signal-based state**: Reactive happiness, mood, and state management
- **Animation loop**: Frame-based animation system
- **Event system**: Hooks into OpenCode events for reactive behaviors

### Key Components

```typescript
// Pet state management
const [currentState, setCurrentState] = createSignal<PetState>("idle")
const [happiness, setHappiness] = createSignal(80)
const [currentMood, setCurrentMood] = createSignal<Mood>("neutral")

// Event handlers
api.event.on("session.created", () => adjustHappiness(10))
api.event.on("tool.execute.after", (event) => {
  if (event.properties?.success) adjustHappiness(5)
})

// Sidebar slot registration
api.slots.register({
  order: 350,  // Between LSP (300) and Todo (400)
  slots: {
    sidebar_content(ctx, value) { /* Render pet UI */ }
  }
})
```

## 🐛 Troubleshooting

### Pet not showing
- Check that the plugin is enabled in `tui.json`
- Ensure terminal is at least 80 columns wide
- Restart OpenCode after configuration changes

### Animations too slow/fast
- Adjust `animations.fps` in configuration (1-10)
- Default is 4 FPS for optimal performance

### Terminal compatibility
- Requires truecolor support for full color experience
- Set `COLORTERM=truecolor` if colors look off
- Works with modern terminals (iTerm2, Alacritty, Kitty, etc.)

## 🤝 Contributing

Contributions welcome! Ideas for future enhancements:
- More pet types (fox, owl, dragon, etc.)
- Pet accessories (hats, collars, toys)
- Pet interactions with each other
- Pet memories and evolution
- Custom pet sprite uploads

## 📄 License

MIT License - Feel free to use, modify, and share!

## 🙏 Credits

Built with love for the OpenCode community by developers who believe coding should be fun!

---

**Happy coding with your new terminal pet! 🎉**
