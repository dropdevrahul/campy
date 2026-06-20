---
description: Switch your campy pet (cat, hamster, ghost, robot, dragon, turtle, panda, dog)
---

Switch to a different pet. Pass the pet name as the first argument.

Available pets: cat, hamster, ghost, robot, dragon, turtle, panda, dog

```bash
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
bun "$ROOT/cli/campy.ts" switch "$1"
```
