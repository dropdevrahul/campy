# Contributing to campy

Thanks for the interest! campy is small and friendly — PRs welcome for new pets, new agent adapters, animation polish, and bug fixes.

## Quick start

```bash
git clone https://github.com/dropdevrahul/campy.git
cd campy
bun install
bun test           # 38 tests
bun run typecheck  # tsc --noEmit
```

Run the pet locally:

```bash
bun cli/campy.ts watch
bun cli/campy.ts statusline
bun cli/campy.ts status
```

## Project layout

See `CLAUDE.md` for the full architecture tour. The short version:

| Directory | What lives there |
|---|---|
| `core/`          | Portable pet logic (animation, store, runtime, render). No host-specific code. |
| `cli/campy.ts`   | The `campy` binary. |
| `adapters/`      | One subdirectory per host (claude-code, pi, mcp, gemini). |
| `.opencode/plugins/` | Thin shims re-exporting from `core/`. |
| `tests/`         | `bun:test` unit tests. |
| `assets/`        | GIFs + generated ASCII frame JSON. |

## Adding a new pet

1. Create `core/pets/<name>.ts` exporting a `PetAnimations` object — use `core/pets/cat.ts` as the reference.
2. Register in `core/pets/index.ts` (`PET_ANIMATIONS` map).
3. Add entries to `PET_ICONS`, `PET_COLORS`, `PET_GREETINGS`, `PET_PERSONALITY` in `core/theme.ts` and `core/personality.ts`.
4. Run `bun test` and add a smoke test if behavior is non-trivial.
5. Verify in OpenCode (`npm run dev`) and the CLI (`bun cli/campy.ts switch <name> && bun cli/campy.ts watch`).

## Adding a new agent adapter

1. Add the agent id to `AgentId` and a detection rule in `core/detect.ts`.
2. Add an installer in `cli/campy.ts` (use existing installers as templates — keep them idempotent).
3. Add the adapter under `adapters/<agent>/` — either an MCP-style server (see `adapters/mcp/`), short-lived hooks (see `adapters/claude-code/`), or an in-process extension (see `adapters/pi/`).
4. Document the install path in `README.md` and `CLAUDE.md`.

## Style notes

- TypeScript strict mode. No `any` unless wrapping an external surface (e.g. host-agent types we don't own).
- Prefer adding to `core/` over duplicating logic in an adapter.
- Keep commits small and focused — `feat:`, `fix:`, `docs:`, `test:`, `chore:` prefixes (loose Conventional Commits — not enforced).
- No comments unless the *why* is non-obvious.

## Tests

`bun test` runs all of `tests/`. Add tests for new event reactions, store mutations, agent detection, or MCP dispatch. UI animation is verified manually — note that in your PR description.

## Reporting bugs

Use the bug template at <https://github.com/dropdevrahul/campy/issues/new/choose>. The most useful things to include: output of `campy status`, contents of `~/.campy/state.json`, and which agent + terminal you're using.

## Code of conduct

Be kind. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
