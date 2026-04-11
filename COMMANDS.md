# 🎮 OpenCode Pets - Commands & Interactions

## Slash Commands

All pet interactions are available through the `/pet` command:

### Available Commands

```
/pet feed      - Feed your pet (+15 happiness, eating animation)
/pet play      - Play with your pet (+20 happiness, playing animation)  
/pet pet       - Pet your pet (+10 happiness, happy animation)
/pet sleep     - Put your pet to sleep (sleeping animation)
/pet wake      - Wake up your pet
/pet status    - Check pet's mood and happiness
```

### Usage Examples

```bash
# Feed your pet
/pet feed
🍖 Whiskers is eating!

# Play together
/pet play  
🎮 Whiskers is playing!

# Check status
/pet status
ℹ️ Whiskers - Mood: Happy, Happiness: 85%
```

## 🖱️ Clickable UI

The pet panel has clickable buttons:
- **[❤️ Pet]** - Pet your pet
- **[🎮 Play]** - Play with your pet
- **[🍖 Feed]** - Feed your pet  
- **[💤 Sleep]** / **[☀️ Wake]** - Sleep/Wake toggle

## 🎬 Animations

### Available States
- **idle** - Gentle breathing (default)
- **happy** - Smiling, sometimes bouncing
- **sad** - Droopy, crying
- **eating** - Nom nom animation
- **playing** - Jumping/bouncing
- **excited** - Rapid bouncing
- **sleeping** - Zzz animation

### Animation Features
- **Auto-cycling**: Each state cycles through frames automatically
- **Frame-based**: Smooth transitions between animation frames
- **Configurable FPS**: Set in config (default: 2 FPS)
- **Contextual effects**:
  - Happy/Excited: Bouncing motion
  - Sleeping: Growing "zzz" text
  - Eating: Heart symbols

## 🎭 Happiness System

| Action | Happiness Change | Duration |
|--------|-----------------|----------|
| Pet | +10 | 2 sec happy |
| Feed | +15 | 2 sec eating |
| Play | +20 | 3 sec playing |
| Tool success | +5 | 1.5 sec happy |
| Tool error | -10 | 3 sec sad |
| Session error | -20 | 4 sec sad |
| New session | +10 | 2 sec excited |

### Happiness Levels
- **80-100%**: 😊 Happy (green)
- **40-79%**: 😐 Neutral (white)
- **0-39%**: 😢 Sad (red)

## 🛠️ Configuration

### Enable/Disable Commands
In your `.opencode/tui.json`:

```json
{
  "plugin": [
    ["./plugins/pets.tsx", {
      "behavior": {
        "reactToEvents": true,  // Auto-react to coding events
        "enableCommands": true   // Enable /pet commands
      }
    }]
  ]
}
```

### Animation Speed
```json
{
  "animations": {
    "fps": 4  // Frames per second (1-10)
  }
}
```

Higher FPS = faster animations

## 🎯 Pro Tips

1. **Quick Interaction**: Click the action buttons in the sidebar
2. **Keyboard**: Type `/pet` and use Tab to autocomplete
3. **Auto-reactions**: Your pet reacts automatically to:
   - ✅ Code compiling successfully
   - ❌ Build errors
   - 🆕 New sessions

4. **Keep Happy**: Pets lose 1 happiness every 5 minutes idle
5. **Sleep Mode**: Sleeping pets don't react to events (good for focus time)

## 🔧 Troubleshooting

**Commands not appearing?**
- Make sure plugin is enabled in `tui.json`
- Restart OpenCode after config changes
- Check console for errors

**Animations not working?**
- Check `animations.fps` is set (try 2-4)
- Make sure terminal supports the characters
- Try different pet types

**Click not working?**
- Some terminals don't support mouse clicks
- Use keyboard commands instead: `/pet feed`, `/pet play`, etc.
