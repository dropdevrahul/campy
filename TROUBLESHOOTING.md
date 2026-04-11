# 🐱 OpenCode Pets Plugin - Troubleshooting Guide

## Common Issues and Solutions

### Issue: Plugin shows as active but no pet appears

#### 🔍 Quick Diagnostics

Run these checks in order:

**1. Check Plugin is Actually Loaded**
```bash
# In OpenCode, run:
/theme
```
Look for "Plugins" section - you should see "opencode-pets" listed.

**2. Check Terminal Size**
```bash
# Check terminal dimensions
stty size
```
**Minimum required: 80 columns x 24 rows**

If terminal is too small, the pet panel won't render.

**3. Check Configuration**
Verify your `.opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
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

**4. Check File Path**
Ensure the plugin file exists:
```bash
ls -la .opencode/plugins/pets.tsx
```

#### 🛠️ Step-by-Step Fix

**Step 1: Test with Minimal Plugin**

Replace your config with the minimal version:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    "./plugins/pets-minimal.tsx"
  ],
  "plugin_enabled": {
    "opencode-pets-minimal": true
  }
}
```

This should show a simple box with a counter. If this works, the issue is with the main plugin's JSX.

**Step 2: Check Console Logs**

Use the debug version:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    "./plugins/pets-debug.tsx"
  ],
  "plugin_enabled": {
    "opencode-pets-debug": true
  }
}
```

Check OpenCode logs for "[PETS-DEBUG]" messages.

**Step 3: Verify JSX Pragma**

The first line MUST be:
```tsx
/** @jsxImportSource @opentui/solid */
```

Without this, JSX won't compile correctly.

**Step 4: Check Theme Access**

The plugin uses `look(ctx.theme.current)` which requires theme support. If your terminal doesn't support truecolor:

```bash
# Check truecolor support
echo $COLORTERM
# Should output: truecolor or 24bit
```

If not, set it:
```bash
export COLORTERM=truecolor
```

**Step 5: Sidebar Slot Order**

The plugin uses `order: 350` to place itself between LSP (300) and Todo (400). If sidebar ordering is different in your OpenCode version, try changing to:
- `order: 100` (first)
- `order: 500` (after todo)
- `order: 600` (at the end)

#### 🐛 Common Errors

**Error: "Cannot find module '@opentui/solid'"**
```
Solution: This is a peer dependency. OpenCode provides it internally.
Make sure you're using the correct JSX pragma comment.
```

**Error: "look is not defined"**
```
Solution: The `look()` function is from the smoke theme example.
Replace it with direct theme access:

const skin = ctx.theme?.current || {
  accent: "#bd93f9",
  text: "#f8f8f2", 
  border: "#44475a"
}
```

**Error: Plugin not showing at all**
```
1. Check opencode.json vs tui.json
   - Plugin goes in tui.json, NOT opencode.json
2. Ensure plugin path is correct relative to working directory
3. Try absolute path: "/full/path/.opencode/plugins/pets.tsx"
```

#### 🔧 Manual Testing

**Test 1: Direct JSX Rendering**
Create a test file to verify JSX works:

```tsx
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const TestPlugin: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content(ctx) {
        return (
          <box border>
            <text fg="#ff79c6">TEST PET</text>
          </box>
        )
      }
    }
  })
}

export default { id: "test", tui: TestPlugin }
```

If this doesn't show, JSX isn't compiling.

**Test 2: Console Output**
Add console logs to see if plugin loads:

```tsx
const PetsPlugin: TuiPlugin = async (api, options, meta) => {
  console.log("PET PLUGIN LOADED!")
  console.log("API:", api)
  console.log("Options:", options)
  
  api.slots.register({
    order: 350,
    slots: {
      sidebar_content(ctx, value) {
        console.log("RENDERING PET!")
        // ... render code
      }
    }
  })
}
```

Check OpenCode's console/log output for these messages.

#### 🎨 Visual Debugging

Add visual indicators to understand what's happening:

```tsx
api.slots.register({
  order: 350,
  slots: {
    sidebar_content(ctx, value) {
      console.log("Sidebar content slot called")
      
      // Debug: Show raw info
      return (
        <box border borderColor="#ff0000" padding={1}>
          <text fg="#ff79c6">🐱 PET DEBUG</text>
          <text>State: {currentState()}</text>
          <text>Happiness: {happiness()}</text>
          <text>Mood: {currentMood()}</text>
          <box height={1} width={10} backgroundColor="#00ff00">
            <text>TEST</text>
          </box>
        </box>
      )
    },
  },
})
```

If you see the red border and debug info, the slot is working but sprite rendering has issues.

#### 📊 Terminal Requirements

| Feature | Requirement | Check |
|---------|------------|-------|
| Terminal columns | ≥ 80 | `stty size` |
| Terminal rows | ≥ 24 | `stty size` |
| Truecolor | truecolor/24bit | `echo $COLORTERM` |
| Unicode | UTF-8 | `echo $LANG` |

#### 🔄 Reset Everything

If all else fails:

1. Clear OpenCode cache:
```bash
rm -rf ~/.cache/opencode/node_modules
```

2. Remove and reinstall plugin:
```bash
rm -rf .opencode/plugins/
# Re-copy plugin files
```

3. Reset config:
```bash
rm .opencode/tui.json
# Re-create with minimal config
```

4. Restart OpenCode completely

#### 🆘 Still Not Working?

Create a minimal reproduction:

```bash
# Create test directory
mkdir ~/opencode-pet-test
cd ~/opencode-pet-test

# Create minimal setup
mkdir -p .opencode/plugins
cat > .opencode/plugins/test.tsx << 'TESTEOF'
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const Test: TuiPlugin = async (api) => {
  api.slots.register({
    order: 100,
    slots: {
      sidebar_content() {
        return <box border><text>HELLO</text></box>
      }
    }
  })
}

export default { id: "test", tui: Test }
TESTEOF

cat > .opencode/tui.json << 'JSONEOF'
{"plugin": ["./plugins/test.tsx"], "plugin_enabled": {"test": true}}
JSONEOF

# Run test
opencode
```

If this minimal test works, slowly add back features from the main plugin until you find what breaks it.

#### 📞 Getting Help

If you're still stuck:

1. Check OpenCode version: `opencode --version`
2. Check if smoke plugin works (it's built-in)
3. Look for errors in OpenCode logs
4. Try in a fresh terminal without custom configs
5. Test with a simple cat first, then add complexity

#### ✅ Working Example

Here's a guaranteed working minimal config:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["./plugins/pets.tsx", {
      "pet": "cat",
      "name": "TestCat",
      "size": "small",
      "color": "auto",
      "position": "sidebar",
      "behavior": {
        "reactToEvents": false,
        "showMood": true,
        "animateIdle": true,
        "randomPlay": false
      },
      "animations": {
        "fps": 2,
        "enableAll": true
      }
    }]
  ],
  "plugin_enabled": {
    "opencode-pets": true
  }
}
```

This disables event reactions (which can cause issues) and uses slower animations for testing.
