# Pets

campy ships four pets, each with its own sprite data, personality phrases, and animation style. All four share the same seven animation states and the same happiness system.

## Available pets

| Pet     | Emoji | Switch command          |
|---------|-------|-------------------------|
| Cat     | 🐱    | `campy switch cat`      |
| Hamster | 🐹    | `campy switch hamster`  |
| Ghost   | 👻    | `campy switch ghost`    |
| Robot   | 🤖    | `campy switch robot`    |

## Animation states

Every pet cycles through seven states:

| State     | When it appears                                  |
|-----------|--------------------------------------------------|
| `idle`    | Default — pet is relaxed and waiting             |
| `happy`   | After a positive interaction or event            |
| `sleeping`| After `campy sleep`, or during a long quiet stretch |
| `eating`  | When `campy feed` is called                      |
| `playing` | When `campy play` is called                      |
| `excited` | High-energy events (new session, big edit burst) |
| `sad`     | Errors, or when happiness drops low              |

## Animation model

Each state is a stack of independently timed animation layers. The body layer loops on one timer; the eyes layer loops on a separate, slower timer. `mergeLayers()` composites them per-row, with non-space characters in later layers overwriting earlier ones. This is what makes the blinking look natural — the eyes animate independently of the body.

| Pet     | Blinking style  |
|---------|-----------------|
| Cat     | Layered eyes    |
| Hamster | Frame-step      |
| Ghost   | Layered eyes    |
| Robot   | Layered eyes    |

## Adding a pet

To add a new pet, define a `PetAnimations` object in a new file under `core/pets/<name>.ts`, register it in `PET_ANIMATIONS` in `core/pets/index.ts`, and add entries to `PET_ICONS`, `PET_GREETINGS`, and `PET_PERSONALITY` in `core/theme.ts` and `core/personality.ts`. All frames must be run through `pad(lines, width)` to the standard height (`HL = 8` rows) — compositing breaks if frames differ in height.

## Switching pets

```bash
campy switch hamster   # switch to hamster
campy switch robot     # switch to robot
```

In OpenCode or Pi, use `/pet cat`, `/pet hamster`, etc. In Claude Code, use `/campy:switch <name>`. In MCP agents, call `campy_switch` with the pet name.

The switch is immediate and persists across sessions through the state file.
