# Contributing

Thanks for your interest in contributing to campy. Please read the documents at the root of the repo before opening a pull request.

## Guidelines

- [CONTRIBUTING.md](https://github.com/dropdevrahul/campy/blob/main/CONTRIBUTING.md) — how to set up the project, coding conventions, and the pull request process
- [CODE_OF_CONDUCT.md](https://github.com/dropdevrahul/campy/blob/main/CODE_OF_CONDUCT.md) — expected behavior in the community

## Development setup

```bash
git clone https://github.com/dropdevrahul/campy.git
cd campy
bun install
```

Run the tests:

```bash
bun test
```

Typecheck:

```bash
npm run typecheck
```

Run the CLI directly:

```bash
bun cli/campy.ts status
bun cli/campy.ts watch
```

## Project structure

See [Architecture](architecture.md) for how the codebase is organized. The short version: make changes in `core/` and the adapters pick them up automatically through re-export shims.

## Adding a pet

1. Define a `PetAnimations` object in `core/pets/<name>.ts`
2. Register it in `PET_ANIMATIONS` in `core/pets/index.ts`
3. Add entries to `PET_ICONS` and `PET_COLORS` in `core/theme.ts`
4. Add `PET_GREETINGS` and `PET_PERSONALITY` entries in `core/personality.ts`
5. All frames must be padded to `HL` (8) rows using `pad()` from `core/frame-utils.ts`

## Reporting issues

Open an issue on [GitHub](https://github.com/dropdevrahul/campy/issues). Include your OS, bun version, and which agent you're using.
