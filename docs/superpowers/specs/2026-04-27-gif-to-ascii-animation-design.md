# Design: GIF-to-ASCII Animation Pipeline

**Date:** 2026-04-27
**Status:** Draft — awaiting review

## Overview

Replace hand-crafted ASCII animation frames in the campy pets plugin with GIF-derived ASCII frames. A build-time conversion pipeline transforms GIFs into JSON frame data. The plugin loads JSON at runtime and feeds frames into the existing AnimationEngine.

## Architecture

### Directory Layout

```
campy/
├── assets/
│   ├── gifs/                    # Source GIFs (hand-crafted or generated)
│   │   ├── cat-idle.gif
│   │   ├── cat-happy.gif
│   │   └── ... (all pet×state combinations)
│   └── ascii-frames/            # Generated JSON frame data
│       ├── cat.json
│       ├── hamster.json
│       ├── ghost.json
│       └── robot.json
├── scripts/
│   ├── generate-sprite-gif.js   # Programmatic GIF generator
│   └── gif-to-ascii.js          # GIF → ASCII converter CLI
├── .opencode/
│   └── plugins/pets.tsx         # Plugin (loads JSON, plays frames)
└── package.json                 # Dev deps + npm scripts
```

### Data Flow

1. **Dev**: Drop GIF in `assets/gifs/` or run `generate-sprite-gif.js` to create one
2. **Build**: Run `gif-to-ascii.js` — parses GIFs, converts each frame to ASCII, writes JSON
3. **Runtime**: Plugin imports JSON, feeds frames into existing `AnimationEngine`

## GIF-to-ASCII Conversion

### Pipeline Steps

1. **Parse GIF** — Use `gif-frames` or equivalent npm package to extract individual frames as image buffers. Package choice validated during implementation for Node.js compatibility.
2. **Downscale** — Resize each frame to target ASCII grid. Default dimensions match existing pet widths (cat: 14, hamster: 14, ghost: 12, robot: 18). Width scaled by ~2:1 to account for character aspect ratio (terminal characters are ~2× taller than wide). Per-pet dimensions configurable via `--width` and `--height` CLI flags.
3. **Grayscale** — Convert each pixel to luminance: `0.299*R + 0.587*G + 0.114*B`
4. **Character mapping** — Map luminance (0-255) to density ramp: ` .:-=+*#%@`
5. **Deduplication** — Skip frames identical to previous frame (GIFs often have duplicate frames for timing)
6. **Output JSON** — Write structured frames with duration metadata

### JSON Format

```json
{
  "idle": {
    "frames": [["  /\\_/\\  ", " / o o \\ ", ...], ["  /\\_/\\  ", " / - - \\ ", ...]],
    "durations": [500, 500]
  },
  "happy": {
    "frames": [...],
    "durations": [800, 800]
  }
}
```

### CLI Interface

```bash
node scripts/gif-to-ascii.js              # Convert all GIFs
node scripts/gif-to-ascii.js cat-idle     # Convert single GIF
node scripts/gif-to-ascii.js --width 30   # Custom width
node scripts/gif-to-ascii.js --ramp " .:-=+*#%@"  # Custom character ramp
```

### Programmatic GIF Generator

```bash
node scripts/generate-sprite-gif.js cat idle --frames 4 --fps 3
```

Creates simple animated sprites using canvas operations (bounce, blink, rotate) and exports GIF to `assets/gifs/`.

## Plugin Integration

### Changes to `pets.tsx`

1. **Frame loading** — Replace hardcoded `catFrames`, `catAnim`, `hamAnim`, `ghostAnim`, `robotAnim` with JSON imports from `assets/ascii-frames/`

2. **Animation format adapter** — Small function converts JSON format to internal `PetAnimations` type:
   ```ts
   function jsonToPetAnim(json: Record<string, FrameData>): PetAnimations {
     return {
       states: Object.fromEntries(
         Object.entries(json).map(([state, data]) => [
           state,
           [{
             id: "base",
             steps: data.frames.map((frame, i) => ({
               frame,
               duration: data.durations[i] ?? 500,
             })),
             loop: true,
           }],
         ])
       ),
     }
   }
   ```

3. **Transition animations removed** — State changes jump directly to target state's first frame. The existing transition system is removed as GIF-derived frames won't have matching transition sequences.

4. **Color system unchanged** — `STATE_COLORS` still applies to the `<text>` wrapper. ASCII itself is monochrome (density-based).

5. **UI cleanup** — Two elements removed from the sidebar to free up space:
   - **Pet name header** — The `<text fg="#bd93f9"><b>{PET_ICONS[petType()]} {petType()}</b></text>` row is removed. The state indicator (`{STATE_ICONS[currentState]} {currentState}`) remains.
   - **Happiness bar** — The `Happy: {bar} {happiness}%` line is removed entirely. The happiness system logic stays in the backend (commands still modify it), but it's no longer displayed.

6. **Backward compatibility** — All existing states, events, commands, speech bubbles, and pet switching remain unchanged.

### npm Scripts

```json
{
  "scripts": {
    "dev": "...",
    "generate:ascii": "node scripts/gif-to-ascii.js",
    "generate:sprite": "node scripts/generate-sprite-gif.js"
  }
}
```

## Error Handling

- **Missing GIF**: Skip conversion, log warning. If no JSON exists for a pet, fall back to a minimal default frame set (single idle frame).
- **Invalid GIF**: Log error, skip file. Do not crash the build.
- **Missing JSON at runtime**: Plugin logs error and displays a placeholder ASCII frame ("[no animation]").

## Dependencies

### Dev Dependencies (new)
- GIF parser (e.g., `gif-frames`, `omggif`, or `gifuct-js`) — validated for Node.js compatibility during implementation
- Pixel data extraction (e.g., `get-pixels` or manual buffer parsing)
- `gifencoder` — For programmatic GIF generation

### Runtime Dependencies (unchanged)
- No new runtime dependencies. JSON is imported as static data.

## Testing

- Run `gif-to-ascii.js` on test GIFs, verify JSON output structure
- Verify plugin loads JSON and animates correctly in OpenCode TUI
- Verify all 4 pets × 7 states produce valid frames
