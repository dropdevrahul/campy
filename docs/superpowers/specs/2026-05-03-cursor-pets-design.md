# Design: Cursor IDE Pets Extension

**Date:** 2026-05-03  
**Status:** Draft — awaiting review

## Overview

Port the campy ASCII pets plugin to Cursor IDE as a VS Code extension. Cursor is built on VS Code and uses the VS Code Extension API, so this is a standard VS Code extension that renders animated ASCII pets (cat, hamster, ghost, robot) in a sidebar WebView panel. The extension loads animation frame data from the existing `assets/ascii-frames/*.json` files, runs the same multi-layer animation engine, displays speech bubbles, and reacts to coding events (file saves, diagnostics, terminal execution).

### Feature Parity

| Feature | OpenCode Plugin | Cursor Extension | Approach |
|---------|----------------|------------------|----------|
| Animated ASCII pets | Solid.js sidebar | WebView sidebar | `<pre>` tag + setInterval |
| 7 pet states | ✓ | ✓ | Same frame data, rewritten AnimationEngine |
| Speech bubbles | ✓ | ✓ | CSS-styled speech bubble in WebView |
| Event reactions | 6 OpenCode events | 4 VS Code events | Map to equivalent VS Code API |
| Happiness system | ✓ | ✓ | Same scoring, persisted via `context.globalState` |
| Slash commands | 9 commands | 9 commands | Registered via `vscode.commands` |
| Pet switching | ✓ | ✓ | Command → postMessage to WebView |
| 4 pet types | ✓ | ✓ | Load `cat/hamster/ghost/robot.json` |

### What's Different

- **Rendering**: OpenCode uses Solid.js + custom `<box>`/`<text>` components; Cursor uses an HTML WebView with vanilla JS or a lightweight framework (Preact ~3 KB). The WebView is a sandboxed iframe.
- **Event API**: OpenCode `api.event.on(...)` → VS Code `vscode.workspace.onDidSaveTextDocument(...)`, etc.
- **Sidebar panel**: Registered as a `WebviewView` via `package.json#contributes.views` so it appears in Cursor's sidebar.
- **Commands**: Registered via `package.json#contributes.commands` rather than a dynamic `api.command.register` call.
- **Persistence**: Happiness and pet type saved to `ExtensionContext.globalState` instead of Solid.js signals.

## Architecture

### Extension Activation & Lifecycle

```
Cursor boots
  → package.json#activationEvents: ["onView:campyPets.petPanel"]
  → extension.ts#activate() runs
    → Loads frame JSON from bundled assets/
    → Registers WebviewViewProvider for "campyPets.petPanel"
    → Registers all commands (pet.feed, pet.play, etc.)
    → Registers event listeners (onDidSaveTextDocument, onDidChangeDiagnostics, etc.)
  → User opens sidebar → WebView created → HTML loaded → AnimationEngine starts
```

### Component Diagram

```
┌───────────────────────────────────────────────────────────┐
│  Cursor Extension Host (Node.js)                          │
│                                                           │
│  extension.ts                                             │
│  ├── activate(context)                                    │
│  │   ├── loadFrameData(assets/ascii-frames/*.json)        │
│  │   ├── registerWebviewViewProvider('campyPets.petPanel')│
│  │   │   └── PetPanelProvider                             │
│  │   ├── registerCommand('pet.feed', ...)                 │
│  │   ├── registerCommand('pet.play', ...)                 │
│  │   ├── registerCommand('pet.cat', ...)   ← 9 commands   │
│  │   ├── listenToEvents()                                 │
│  │   │   ├── onDidSaveTextDocument → send 'file-saved'    │
│  │   │   ├── onDidChangeDiagnostics → send 'error'        │
│  │   │   ├── window.onDidWriteTerminalData → send 'cmd'   │
│  │   │   └── onDidChangeTextDocument → send 'editing'     │
│  │   └── context.subscriptions.push(...)                  │
│  └── deactivate()                                         │
│                                                           │
│  src/                                                     │
│  ├── provider.ts      — WebviewViewProvider impl           │
│  ├── engine.ts        — AnimationEngine (port)             │
│  ├── animations.ts    — Hardcoded pet animations (same as plugin) │
│  ├── frames.ts        — Frame data loader + types         │
│  └── constants.ts     — Colors, phrases, defaults         │
│                                                           │
│  media/                                                   │
│  ├── webview.html     — Shipped with extension            │
│  ├── webview.js       — WebView runtime (AnimationEngine) │
│  └── webview.css      — Styling for pets panel            │
└───────────────────────────────────────────────────────────┘
         │  postMessage (JSON)  │
         ▼                      ▼
┌───────────────────────────────────────────────────────────┐
│  WebView (sandboxed iframe)                               │
│                                                           │
│  <div id="pet-panel">                                     │
│    <div id="speech-bubble">Edited file.ts!</div>          │
│    <pre id="pet-art"><span style="color:#bd93f9">        │
│   /\_/\                                          </span>  │
│  ( o.o )                                         ...     │
│   > ^ <                                                  │
│    </pre>                                                 │
│    <div id="status">🐱 cat  happy  😊</div>               │
│  </div>                                                   │
│                                                           │
│  Receives: set-pet, set-state, show-speech, set-happiness  │
│  Sends:    pet-ready (on init)                             │
└───────────────────────────────────────────────────────────┘
```

### WebViewProvider Pattern

Use `WebviewViewProvider` (not `WebviewPanel`) so the pet panel appears as a persistent sidebar view:

```typescript
// provider.ts
class PetPanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [/* media/ directory */],
    };
    webviewView.webview.html = this._getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(msg => this._handleMessage(msg));
  }

  postMessage(msg: PetMessage) {
    this._view?.webview.postMessage(msg);
  }
}
```

## WebView Rendering

### HTML Structure

The WebView hosts a single HTML page with minimal CSS and vanilla JS (no npm deps, no build step — or optionally Preact via CDN for reactive state). The rendering surface is a `<pre>` tag with monospace font. Each line of the ASCII sprite is a `<span>` or plain text row colored via inline `color` style.

```html
<pre id="pet-art" style="
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.2;
  white-space: pre;
  margin: 0;
  padding: 8px;
"></pre>
```

### Color Application

Use `PET_COLORS` (per-state colors from the existing plugin):

```typescript
const PET_COLORS: Record<PetState, string> = {
  idle:     "#bd93f9",  // purple
  happy:    "#50fa7b",  // green
  sleeping: "#6272a4",  // dim blue
  eating:   "#ffb86c",  // orange
  playing:  "#ff79c6",  // pink
  excited:  "#f1fa8c",  // yellow
  sad:      "#ff5555",  // red
};
```

Each frame render wraps ASCII lines in a single `<span style="color: ${color}">` block:

```javascript
function renderFrame(frames, color) {
  const html = frames.map(line => escapeHtml(line)).join('\n');
  petArt.innerHTML = `<span style="color:${color}">${html}</span>`;
}
```

### Speech Bubble

Rendered as a CSS-styled `<div>` above the pet. Speech bubble appears/disappears based on messages from the extension:

```css
.speech-bubble {
  position: relative;
  background: #f8f8f2;
  color: #282a36;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  max-width: 220px;
  opacity: 0;
  transition: opacity 0.3s;
}
.speech-bubble.visible { opacity: 1; }
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #f8f8f2;
}
```

### Animation Loop

The WebView-side `AnimationEngine` runs via `setInterval`/`requestAnimationFrame`:

```
1. Extension posts: { type: 'set-state', state: 'happy' }
2. WebView receives → AnimationEngine.switchState('happy')
3. Engine composites layers, picks current frame
4. Render via requestAnimationFrame (target 3 FPS)
5. Engine auto-cycles states via random timeout (10-30s)
6. Each frame rendered with matching color from PET_COLORS
```

## Data Flow

### Frame Data Format

The same JSON format from `assets/ascii-frames/*.json`:

```json
{
  "idle": {
    "frames": [
      ["  /\\_/\\  ", " ( o.o ) ", "  > ^ <  "],
      ["  /\\_/\\  ", " ( -.- ) ", "  > ^ <  "]
    ],
    "durations": [2000, 150]
  },
  "happy": { "frames": [...], "durations": [...] }
}
```

These JSON files are bundled into the extension (imported as TypeScript objects or loaded at runtime via `fs.readFileSync`). They total ~40 KB across all 4 pets.

### Extension → WebView Messages

All messages use `webview.postMessage(msg)` with a typed message protocol:

```typescript
type ExtensionMessage =
  | { type: 'init'; payload: { pet: string; state: PetState; happiness: number; frames: PetFrameData; animations: PetAnimations } }
  | { type: 'set-state'; payload: { state: PetState; speech?: string; duration?: number } }
  | { type: 'set-pet'; payload: { pet: string; frames: PetFrameData; animations: PetAnimations } }
  | { type: 'set-happiness'; payload: { happiness: number } }
  | { type: 'show-speech'; payload: { text: string; duration: number } };
```

On `init`, the extension sends the full frame data and hardcoded animation definitions to the WebView. The WebView stores them and runs the animation engine locally — no further frame data round-trips needed.

### WebView → Extension Messages

```typescript
type WebViewMessage =
  | { type: 'ready' }
  | { type: 'log'; payload: { level: string; text: string } };
```

### State Persistence

Happiness score and selected pet type persist via `ExtensionContext.globalState`:

```typescript
// On activate
const savedPet = context.globalState.get<string>('campyPet', 'cat');
const savedHappiness = context.globalState.get<number>('campyHappiness', 80);

// On change
context.globalState.update('campyPet', petType);
context.globalState.update('campyHappiness', happiness);
```

This survives Cursor restarts and extension reloads.

## Event Reactions

Map OpenCode events to VS Code API equivalents:

| OpenCode Event | VS Code API | Trigger | Pet Reaction |
|---------------|-------------|---------|--------------|
| `file.edited` | `workspace.onDidSaveTextDocument` | File saved | State: eating + "Edited {filename}!" |
| `session.error` | `languages.onDidChangeDiagnostics` | Error diagnostic appears | State: sad + "Error! Let me help..." |
| `command.executed` | `window.onDidWriteTerminalData` | Terminal output detected | State: happy + "Ran task!" |
| `message.part.delta` | — | _(Cursor AI streaming)_ | State: excited + "Thinking..." |
| `session.idle` | `setTimeout` in WebView | No activity for ~30s | State: idle + random phrase |
| `tui.prompt.append` | — | _(no equivalent)_ | — |

### Implementation Notes

**File Save** — fires on `onDidSaveTextDocument`. Debounce 500ms to handle rapid saves.

```typescript
vscode.workspace.onDidSaveTextDocument(doc => {
  const filename = doc.fileName.split('/').pop() || doc.fileName;
  sendToWebView({ type: 'override-state', payload: { state: 'eating', duration: 4000, speech: `Edited ${filename}!` } });
  changeHappiness(2);
});
```

**Diagnostics** — fires on `onDidChangeDiagnostics`. Only trigger on new errors (not warnings or info).

```typescript
vscode.languages.onDidChangeDiagnostics(event => {
  const hasNewError = event.uris.some(uri => {
    const diags = vscode.languages.getDiagnostics(uri);
    return diags.some(d => d.severity === vscode.DiagnosticSeverity.Error);
  });
  if (hasNewError) {
    sendToWebView({ type: 'override-state', payload: { state: 'sad', duration: 5000, speech: 'Error! Let me help...' } });
    changeHappiness(-5);
  }
});
```

**Terminal Output** — fires on `window.onDidWriteTerminalData`. Trigger happy state when a command finishes (detect prompt character `$` or `>`):

```typescript
vscode.window.onDidWriteTerminalData(e => {
  if (e.data.includes('$ ') || e.data.includes('> ')) {
    sendToWebView({ type: 'set-state', payload: { state: 'happy', speech: 'Done!' } });
    changeHappiness(3);
  }
});
```

**Idle Detection** — handled in the WebView JavaScript. If no message received from extension for 30 seconds, auto-transition to idle state. The extension resets a timestamp on each activity postMessage.

**Cursor AI Events** (optional) — Cursor may expose AI streaming events through its own API. If unavailable, skip the `message.part.delta` equivalent. A future iteration could detect `onDidChangeTextDocument` activity in a Cursor Chat file.

## Commands

Registered in `package.json#contributes.commands` and implemented in `extension.ts`:

```json
{
  "contributes": {
    "commands": [
      { "command": "campyPets.feed",    "title": "Campy: Feed Pet" },
      { "command": "campyPets.play",    "title": "Campy: Play with Pet" },
      { "command": "campyPets.pet",     "title": "Campy: Pet Pet" },
      { "command": "campyPets.sleep",   "title": "Campy: Put Pet to Sleep" },
      { "command": "campyPets.wake",    "title": "Campy: Wake Pet" },
      { "command": "campyPets.status",  "title": "Campy: Pet Status" },
      { "command": "campyPets.switchCat",     "title": "Campy: Switch to Cat" },
      { "command": "campyPets.switchHamster", "title": "Campy: Switch to Hamster" },
      { "command": "campyPets.switchGhost",   "title": "Campy: Switch to Ghost" },
      { "command": "campyPets.switchRobot",   "title": "Campy: Switch to Robot" }
    ]
  }
}
```

Command palette shows them as `Campy: Feed Pet`, `Campy: Play with Pet`, etc.

### Command Behaviors

| Command | Happiness | State | Duration | Speech |
|---------|-----------|-------|----------|--------|
| feed | +15 | eating | 5000ms | "Nom nom!" |
| play | +20 | playing | 5000ms | "Wheee!" |
| pet | +10 | happy | 3000ms | "Purr..." |
| sleep | — | sleeping | indefinite | "Zzz..." |
| wake | — | idle | — | "I'm awake!" |
| status | — | — | — | Toast: "🐱 cat | happy | 80%" |
| switch pet | reset to 80 | idle | — | Greeting phrase |

### Status Bar Item

Optionally contribute a status bar item showing the current pet emoji and happiness:

```
🐱 80% ──────
```

Registered via `vscode.window.createStatusBarItem` in `activate()`. Clicking it reveals the pet panel.

## File Structure

```
cursor-pets/
├── .vscode/
│   ├── launch.json              # Debug config for extension host
│   └── tasks.json               # Build tasks
├── assets/
│   └── ascii-frames/            # Copied from campy/assets/ascii-frames/
│       ├── cat.json              # 8 frames, ~4 KB
│       ├── hamster.json          # 1 frame, ~0.5 KB
│       ├── ghost.json            # 5 frames, ~2 KB
│       └── robot.json            # 61 frames, ~15 KB
├── media/
│   ├── webview.html              # WebView HTML shell
│   ├── webview.js                # WebView runtime (AnimationEngine port)
│   └── webview.css               # Pet panel styling
├── src/
│   ├── extension.ts              # activate/deactivate entry point
│   ├── provider.ts               # WebviewViewProvider implementation
│   ├── animations.ts             # Hardcoded pet animation definitions
│   ├── constants.ts              # PET_COLORS, phrases, personality text
│   ├── engine.ts                 # AnimationEngine (Node.js side — unused in WebView but available for testing)
│   ├── frames.ts                 # Frame data loader: reads assets/*.json
│   └── types.ts                  # TypeScript types (PetState, Message, etc.)
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript config
├── .vscodeignore                 # Files to exclude from VSIX
└── README.md                     # Extension documentation
```

### Key Files Detail

**package.json** - Extension manifest:

```json
{
  "name": "cursor-pets",
  "displayName": "Campy — ASCII Pets for Cursor",
  "version": "1.0.0",
  "publisher": "campy",
  "engines": { "vscode": "^1.82.0" },
  "activationEvents": ["onView:campyPets.petPanel"],
  "main": "./out/extension.js",
  "contributes": {
    "views": {
      "campyPets": [
        {
          "id": "campyPets.petPanel",
          "name": "Campy Pets",
          "type": "webview",
          "icon": "$(hubot)"
        }
      ]
    },
    "commands": [
      { "command": "campyPets.feed", "title": "Campy: Feed Pet" },
      { "command": "campyPets.play", "title": "Campy: Play with Pet" },
      { "command": "campyPets.pet", "title": "Campy: Pet Pet" },
      { "command": "campyPets.sleep", "title": "Campy: Put Pet to Sleep" },
      { "command": "campyPets.wake", "title": "Campy: Wake Pet" },
      { "command": "campyPets.status", "title": "Campy: Pet Status" },
      { "command": "campyPets.switchCat", "title": "Campy: Switch to Cat" },
      { "command": "campyPets.switchHamster", "title": "Campy: Switch to Hamster" },
      { "command": "campyPets.switchGhost", "title": "Campy: Switch to Ghost" },
      { "command": "campyPets.switchRobot", "title": "Campy: Switch to Robot" }
    ]
  },
  "scripts": {
    "vscode:prepublish": "tsc -p ./",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.82.0",
    "typescript": "^5.3.0"
  }
}
```

**extension.ts** - Activation entry:

```typescript
import * as vscode from 'vscode';
import { PetPanelProvider } from './provider';
import { loadFrameData } from './frames';
import { COMMANDS } from './constants';

export function activate(context: vscode.ExtensionContext) {
  // Load frame data at startup
  const frames = loadFrameData(context.extensionPath);

  // Register webview provider
  const provider = new PetPanelProvider(context.extensionUri, frames, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('campyPets.petPanel', provider)
  );

  // Register commands
  for (const cmd of COMMANDS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(cmd.id, () => provider.handleCommand(cmd.id))
    );
  }

  // Event listeners
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc =>
      provider.onFileSaved(doc)
    ),
    vscode.languages.onDidChangeDiagnostics(e =>
      provider.onDiagnostics(e)
    ),
    vscode.window.onDidWriteTerminalData(e =>
      provider.onTerminalOutput(e)
    )
  );

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left, 100
  );
  statusBarItem.command = 'campyPets.petPanel.focus';
  statusBarItem.text = `$(hubot) ${provider.statusText}`;
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
```

**webview.js** — The WebView-side AnimationEngine. A self-contained JS file with no external dependencies:

```javascript
// webview.js — runs inside the WebView iframe
(function() {
  const vscode = acquireVsCodeApi();

  let currentPet = 'cat';
  let currentState = 'idle';
  let happiness = 80;
  let engine = null;
  let frameData = {};
  let animData = {};
  let idleTimer = null;

  // AnimationEngine — same compositing logic as the OpenCode plugin
  class AnimationEngine {
    constructor(animations, onRender) { /* ... */ }
    resetToState(state) { /* composite layers, render */ }
    setState(state) { /* trigger transition anim */ }
    destroy() { /* clear timers */ }
  }

  function renderFrame(lines, color) {
    const html = lines.map(l => escapeHtml(l)).join('\n');
    document.getElementById('pet-art').innerHTML =
      `<span style="color:${color}">${html}</span>`;
  }

  function showSpeech(text, duration) {
    const bubble = document.getElementById('speech-bubble');
    bubble.textContent = text;
    bubble.classList.add('visible');
    clearTimeout(bubble._timeout);
    bubble._timeout = setTimeout(() => bubble.classList.remove('visible'), duration);
  }

  window.addEventListener('message', event => {
    const msg = event.data;
    switch (msg.type) {
      case 'init':
        currentPet = msg.payload.pet;
        happiness = msg.payload.happiness;
        frameData = msg.payload.frames;
        animData = msg.payload.animations;
        engine = new AnimationEngine(animData[currentPet], renderFrame);
        engine.resetToState('idle');
        updateStatusBar();
        break;
      case 'set-state':
        engine?.setState(msg.payload.state);
        if (msg.payload.speech) showSpeech(msg.payload.speech, msg.payload.duration || 4000);
        break;
      case 'set-happiness':
        happiness = msg.payload.happiness;
        updateStatusBar();
        break;
      case 'show-speech':
        showSpeech(msg.payload.text, msg.payload.duration);
        break;
    }
  });

  vscode.postMessage({ type: 'ready' });
})();
```

### Color Theme Support

The WebView respects the current VS Code color theme. CSS variables from `body.vscode-dark` / `body.vscode-light` set background/text colors. The pet ASCII colors use the fixed `PET_COLORS` palette (which are Dracula-theme-friendly and work on both light and dark backgrounds).

## Dependencies

### Runtime (bundled)

- **@types/vscode** (dev only) — Type definitions for VS Code Extension API
- **typescript** (dev only) — Compiles `src/` → `out/`
- **No runtime npm dependencies** — the extension uses only the VS Code API (`vscode` module)

### Conceptual Dependencies

- **VS Code Extension API** (`vscode` module):
  - `window.registerWebviewViewProvider` — sidebar WebView panel
  - `workspace.onDidSaveTextDocument` — file save events
  - `languages.onDidChangeDiagnostics` — error detection
  - `window.onDidWriteTerminalData` — terminal output
  - `commands.registerCommand` — command palette commands
  - `ExtensionContext.globalState` — persistence
- **WebView API**:
  - `acquireVsCodeApi()` — message passing bridge
  - `postMessage` / `onmessage` — extension↔webview communication

### VSIX Packaging

The extension ships as a `.vsix` file containing:
- `out/extension.js` (compiled TypeScript)
- `assets/ascii-frames/*.json` (frame data)
- `media/webview.html`, `media/webview.js`, `media/webview.css`
- `package.json`, `README.md`

Total package size estimated at ~35 KB (gzipped). No node_modules shipped.
