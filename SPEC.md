# OpenCode Animated Pets Plugin - Specification

## 1. Project Overview

### Project Name
`opencode-pets`

### Project Type
OpenCode TUI Plugin - Interactive Animated Pets for Terminal

### Core Functionality
A delightful plugin that adds animated ASCII pets to the OpenCode terminal sidebar. Pets react to coding events (success, errors, idle time) and provide ambient companionship during coding sessions.

### Target Users
- Developers who want a fun, engaging coding experience
- Users who enjoy terminal aesthetics and customization
- Anyone who wants "desk pets" in their terminal

---

## 2. Technical Architecture

### Plugin Type
**TUI Plugin** - Uses OpenTUI (Solid.js-based terminal UI framework)

### File Structure
```
.opencode/
├── plugins/
│   └── pets.tsx              # Main plugin file
├── themes/
│   └── pets-theme.json       # Pet-specific theme colors
└── tui.json                  # Plugin configuration
```

### Dependencies
- `@opentui/solid` - Terminal UI rendering
- `@opentui/core` - UI primitives
- `solid-js` - Reactive animation engine

### Plugin Lifecycle
1. Plugin initializes with configuration options
2. Registers sidebar slot for pet display
3. Starts animation loop
4. Listens to OpenCode events for pet reactions
5. Cleans up on disposal

---

## 3. Pet System Design

### 3.1 Available Pets

#### Cat
```
  /\_____/\
 /  o   o  \
(  == ^ ==  )
 \  '-'  /
  |     |
  |     |
 (__)  (__)
```
- States: idle, happy, sad, sleeping, eating, playing
- Moods: happy, neutral, sad, excited

#### Dog
```
    /\    /\
   /  \../  \
  (    o__o    )
  (   /\___/\   )
   `--'    `--'
```
- States: idle, happy, sad, sleeping, begging, wagging
- Moods: happy, neutral, sad, excited

#### Hamster
```
 (\\/)  (\\/)
  ( ..)  ( ..)
   `--'`--'
```
- States: idle, happy, running, sleeping, eating
- Moods: happy, neutral, sad, energetic

#### Corgi
```
 /\^..^/\  
/  \    /  \
|  |    |  |
 \  \__/  /
  `----'
```
- States: idle, happy, sad, sitting, running
- Moods: happy, neutral, sad, excited

#### Ghost
```
   .-.
  (o o)
  | O |
  |   |
  '~~~'
```
- States: idle, floating, scared, happy
- Moods: playful, neutral, scared, happy

### 3.2 Pet States

| State | Trigger | Animation |
|-------|---------|-----------|
| idle | Default state | Gentle breathing animation |
| happy | Code compiled, task completed | Wagging tail, jumping |
| sad | Error occurred, build failed | Droopy ears, tears |
| sleeping | Idle for 5+ minutes | Zzz animation |
| eating | During tool execution | Nom nom animation |
| playing | Random intervals | Bouncing/jumping |
| excited | Session started, /new command | Bouncing rapidly |

### 3.3 Mood System
- Pets accumulate "happiness points" over time
- Positive events increase happiness
- Negative events decrease happiness
- Mood affects idle animation and expressions
- Happiness decays slowly over time

### 3.4 Animation System

#### Frame-based Animation
- Each pet state has multiple animation frames
- Frames cycle at configurable FPS (default: 4 FPS)
- Smooth transitions between states

#### Animation Properties
```typescript
interface AnimationConfig {
  fps: number;           // Frames per second (1-10)
  loop: boolean;          // Loop animation
  frames: string[];       // ASCII art frames
  transitionMs: number;   // Time between state changes
}
```

#### Example Animation Loop
```
State: happy
Frame 1: ( ^_^ )  →  Frame 2: ( ^ω^ )  →  Frame 3: ( ^_^ )  →  Frame 4: ( ^ω^ )
        ↑___________________________循环________________________↑
```

### 3.5 Pet Customization

#### Size Options
- `tiny`: Mini version (3-5 chars wide)
- `small`: Normal version (10-15 chars wide) - **default**
- `medium`: Large version (15-20 chars wide)
- `large`: XL version (25+ chars wide)

#### Color Options (ANSI)
- `auto`: Follows theme colors
- `white`, `gray`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`

#### Behavior Options
- `reactToEvents`: Enable event reactions (default: true)
- `showMood`: Display current mood (default: true)
- `animateIdle`: Enable idle animations (default: true)
- `randomPlay`: Random playtime (default: true)

---

## 4. UI Layout & Positioning

### 4.1 Sidebar Panel Structure

```
┌─────────────────────────────────┐
│  ≡ Context          [Toggle]   │  ← Sidebar Header (built-in)
├─────────────────────────────────┤
│                                 │
│  🐱 Pet Name          [⚙️]     │  ← Pet Title Bar
│  Mood: Happy         [🎨]      │
│  ─────────────────────────────  │
│                                 │
│       /\_____/\                │
│      /  o   o  \               │
│     (  == ^ ==   )             │  ← Animated Pet Display
│      \  '-'  /                 │
│       |     |                  │
│       |     |                  │
│      (__)  (__)                │
│                                 │
│  ─────────────────────────────  │
│  Happiness: ████████░░ 80%    │  ← Mood Indicator
│  ─────────────────────────────  │
│                                 │
│  [❤️] [🎮] [🍖] [💤]          │  ← Pet Actions
│                                 │
└─────────────────────────────────┘
```

### 4.2 Position & Size
- **Width**: 30% of sidebar (min 25 cols, max 50 cols)
- **Position**: Between LSP (300) and Todo (400) slots, order: 350
- **Padding**: 1 cell internal padding
- **Border**: Uses theme border color

### 4.3 Responsive Behavior
- **Large terminal (>120 cols)**: Full pet with all details
- **Medium terminal (80-120 cols)**: Compact pet, minimal details
- **Small terminal (<80 cols)**: Hidden (pets need space!)

---

## 5. User Interactions

### 5.1 Pet Actions

| Action | Icon | Trigger | Effect |
|--------|------|---------|--------|
| Feed | 🍖 | Click button | Increases happiness, plays eating animation |
| Play | 🎮 | Click button | Random mood boost, plays animation |
| Sleep | 💤 | Click button | Triggers sleeping state for 30 seconds |
| Pet | ❤️ | Click on pet | Triggers happy animation, +5 happiness |

### 5.2 Keyboard Shortcuts
- `p` - Toggle pet panel
- `P` - Open pet selector
- `+` - Feed pet
- `-` - Put pet to sleep

### 5.3 Interactive Behaviors
- **Hover**: Pet looks at cursor (if cursor position available)
- **Click on pet**: Triggers happy reaction
- **Right-click**: Opens pet menu (if supported by terminal)
- **Double-click**: Opens pet customization

---

## 6. Event System

### 6.1 OpenCode Events

| Event | Pet Reaction | Mood Change |
|-------|--------------|-------------|
| `session.created` | Excited bounce | +10 |
| `session.idle` | Gradually falls asleep | neutral |
| `session.status` (thinking) | Attentive, watching | +2 |
| `session.error` | Sad, tears | -20 |
| `tool.execute.after` (success) | Happy | +5 |
| `tool.execute.after` (error) | Sad | -10 |
| `file.edited` | Brief happy | +2 |
| `message.part.updated` | Attentive | neutral |

### 6.2 Time-based Events
- **Every 5 minutes**: Small happiness decay (-1)
- **Every 15 minutes**: Random playtime chance (if `randomPlay` enabled)
- **After 5 minutes idle**: Pet falls asleep
- **After 30 minutes idle**: Pet wakes up (if sleeping)

---

## 7. Configuration System

### 7.1 Plugin Configuration (tui.json)

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "tokyonight",
  "plugin": [
    [".opencode/plugins/pets.tsx", {
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
  ],
  "plugin_enabled": {
    "opencode-pets": true
  }
}
```

### 7.2 Configuration Options

#### Core Settings
- `pet`: Pet type (`cat`, `dog`, `hamster`, `corgi`, `ghost`)
- `name`: Custom pet name (string)
- `size`: Pet size (`tiny`, `small`, `medium`, `large`)
- `color`: Pet color (`auto`, ANSI color name)
- `position`: Display position (`sidebar`, `footer`, `hidden`)

#### Behavior Settings
- `behavior.reactToEvents`: React to OpenCode events (boolean)
- `behavior.showMood`: Display mood indicator (boolean)
- `behavior.animateIdle`: Animate when idle (boolean)
- `behavior.randomPlay`: Random playtime events (boolean)

#### Animation Settings
- `animations.fps`: Animation speed (1-10)
- `animations.enableAll`: Enable all animations (boolean)
- `animations.custom`: Custom animation overrides (object)

#### Advanced Settings
- `happiness.max`: Maximum happiness points (default: 100)
- `happiness.decayRate`: Happiness decay per 5 min (default: 1)
- `happiness.gainAmount`: Happiness gain on positive events (default: 5)
- `sleep.threshold`: Minutes before sleeping (default: 5)

### 7.3 Per-Pet Settings
```json
{
  "pets": {
    "cat": {
      "defaultName": "Whiskers",
      "favoriteToy": "yarn"
    },
    "dog": {
      "defaultName": "Buddy", 
      "favoriteTreat": "bone"
    }
  }
}
```

---

## 8. State Management

### 8.1 Pet State
```typescript
interface PetState {
  name: string;
  type: PetType;
  mood: Mood;
  state: PetState;
  happiness: number;
  lastInteraction: Date;
  lastFed: Date;
  isSleeping: boolean;
  customName?: string;
}
```

### 8.2 State Persistence
- Pet state saved to KV store every 30 seconds
- State restored on next session
- Happiness and custom name persist between sessions
- States reset on new pet selection

### 8.3 Reactive Updates
```typescript
// Example Solid.js reactive state
const [petState, setPetState] = createSignal<PetState>({
  name: "Whiskers",
  mood: "happy",
  state: "idle",
  happiness: 80,
  isSleeping: false
});
```

---

## 9. Theme Integration

### 9.1 Pet Theme Colors
```json
{
  "pets": {
    "happy": "#50fa7b",
    "neutral": "#f8f8f2",
    "sad": "#ff5555",
    "sleeping": "#6272a4",
    "frame": "#bd93f9"
  }
}
```

### 9.2 Theme Overrides
- Pet colors automatically adapt to dark/light mode
- Can be overridden in custom themes
- Respects terminal truecolor support

---

## 10. Performance Considerations

### 10.1 Animation Optimization
- Use `requestAnimationFrame` equivalent for smooth rendering
- Limit to 4-8 FPS to avoid terminal lag
- Pause animations when tab not visible
- Reduce animation complexity on slower terminals

### 10.2 Memory Management
- Cleanup intervals on plugin disposal
- Unsubscribe from events properly
- Limit state history size

### 10.3 Terminal Compatibility
- Support terminals without truecolor (fallback to 256 colors)
- Graceful degradation for old terminals
- Detect and adapt to terminal size changes

---

## 11. Error Handling

### 11.1 Plugin Errors
- Catch and log all errors gracefully
- Show error message in pet panel if critical
- Don't crash main OpenCode on pet errors
- Provide recovery options

### 11.2 Fallback Behavior
- If animation fails, show static pet
- If state restore fails, start with default state
- If theme colors missing, use defaults

---

## 12. Testing Strategy

### 12.1 Manual Testing
- Test all pet types
- Test all state transitions
- Test event reactions
- Test configuration changes
- Test terminal resize behavior
- Test keyboard shortcuts

### 12.2 Edge Cases
- Terminal too small for pet
- Theme colors missing
- Plugin reloading
- Multiple rapid state changes
- Long idle periods

---

## 13. Future Enhancements

### 13.1 Planned Features
- [ ] More pet types (fox, owl, dragon, etc.)
- [ ] Pet accessories (hats, collars, toys)
- [ ] Pet interactions (pets can interact with each other)
- [ ] Pet memories (remember good/bad coding sessions)
- [ ] Pet evolution (pet grows/changes over time)
- [ ] Sound effects (optional, terminal bell-based)
- [ ] Pet mini-games (feeding, playing)

### 13.2 Community Features
- Custom pet sprites
- Pet sharing/export
- Community pet presets
- Pet themes/cosmetics store

---

## 14. Implementation Priority

### Phase 1: Core (MVP)
- [ ] Basic plugin structure
- [ ] Cat pet with 3 states (idle, happy, sad)
- [ ] Sidebar panel display
- [ ] Basic animation system
- [ ] Configuration options

### Phase 2: Expansion
- [ ] Multiple pet types (dog, hamster, ghost)
- [ ] All states and animations
- [ ] Event integration
- [ ] Mood system
- [ ] State persistence

### Phase 3: Polish
- [ ] User interactions
- [ ] Keyboard shortcuts
- [ ] Theme integration
- [ ] Performance optimization
- [ ] Error handling

### Phase 4: Community
- [ ] Custom pet sprites
- [ ] Plugin documentation
- [ ] NPM package publishing
- [ ] Community showcase

---

## 15. References

- OpenCode Plugin Documentation: https://opencode.ai/docs/plugins
- OpenCode TUI Documentation: https://opencode.ai/docs/tui
- OpenCode Themes Documentation: https://opencode.ai/docs/themes
- OpenTUI Framework: @opentui/solid
- Solid.js Reactivity: https://www.solidjs.com/

---

## Appendix A: ASCII Art Reference

### Cat States (Small Size)
```
Idle:     /\_____/\
         /  o   o  \
        (  == ^ ==  )
         \  '-'  /
          |     |
          |     |
         (__)  (__)

Happy:    /\_____/\
         /  ^   ^  \
        (  == ω ==  )
         \  '-'  /
          | ♥  |
          |     |
         (__) (__)

Sad:      /\_____/\
         /  x   x  \
        (  == . ==  )
         \  --  /
          |     |
          |  o  |
         (__) (__)

Sleeping: /\_____/\
         /  -   -  \
        (  == u ==  )
         \  '-'  /
          |     |
          |     |
         (__) (__)
```

---

## Appendix B: Configuration Schema

Full JSON Schema for plugin configuration (for validation):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OpenCode Pets Plugin Configuration",
  "type": "object",
  "properties": {
    "pet": {
      "type": "string",
      "enum": ["cat", "dog", "hamster", "corgi", "ghost"],
      "default": "cat"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 20,
      "default": "Whiskers"
    },
    "size": {
      "type": "string",
      "enum": ["tiny", "small", "medium", "large"],
      "default": "small"
    },
    "color": {
      "type": "string",
      "enum": ["auto", "white", "gray", "red", "green", "yellow", "blue", "magenta", "cyan"],
      "default": "auto"
    },
    "position": {
      "type": "string",
      "enum": ["sidebar", "footer", "hidden"],
      "default": "sidebar"
    },
    "behavior": {
      "type": "object",
      "properties": {
        "reactToEvents": { "type": "boolean", "default": true },
        "showMood": { "type": "boolean", "default": true },
        "animateIdle": { "type": "boolean", "default": true },
        "randomPlay": { "type": "boolean", "default": true }
      },
      "default": {}
    },
    "animations": {
      "type": "object",
      "properties": {
        "fps": { "type": "number", "minimum": 1, "maximum": 10, "default": 4 },
        "enableAll": { "type": "boolean", "default": true }
      },
      "default": {}
    }
  },
  "default": {}
}
```

---

## Document History

- **Version**: 1.0
- **Created**: 2026-04-11
- **Last Updated**: 2026-04-11
- **Status**: Specification Complete

---

*This specification serves as the implementation guide for the OpenCode Animated Pets Plugin.*
