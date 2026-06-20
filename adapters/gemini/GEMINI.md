# campy

A small animated ASCII pet lives alongside this session via the `campy` MCP server.

The pet reacts automatically as files change in the project. You also have these
tools to show and interact with it:

- `campy_status` — show the pet's current mood, happiness, and ASCII art
- `campy_feed` / `campy_play` / `campy_pet` — interactions that raise happiness
- `campy_switch` — switch pet (cat, hamster, ghost, robot, dragon, turtle, panda, dog)

When the user greets the pet, asks how it's doing, or asks you to feed/play with
it, call the matching tool and show the returned ASCII art. Keep it lighthearted;
don't call these tools unprompted during normal coding work.

For a continuously animated pet, the user can run `campy attach` (or `campy watch`)
in a side terminal pane.
