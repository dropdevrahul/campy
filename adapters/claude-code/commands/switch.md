---
description: Switch your campy pet (cat, hamster, ghost, robot)
---

Switch to a different pet. Pass the pet name as the first argument.

Available pets: cat, hamster, ghost, robot

```bash
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
bun "$ROOT/cli/campy.ts" switch "$1"
```
