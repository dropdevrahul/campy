// Minimal local typings for the subset of the Pi coding-agent extension API
// that this adapter uses. The real types ship with `@earendil-works/pi-coding-agent`;
// these keep the adapter type-checkable without the package installed.
// See: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md

export type PiNotifyLevel = "info" | "warning" | "error"

export interface PiUI {
  setWidget(id: string, lines: string[]): void
  notify(message: string, level?: PiNotifyLevel): void
}

export interface PiContext {
  ui: PiUI
  cwd: string
  isIdle?(): boolean
}

export interface PiCommandContext extends PiContext {}

export interface PiCommandOptions {
  description: string
  handler: (args: string, ctx: PiCommandContext) => void | Promise<void>
  getArgumentCompletions?: (prefix: string) => { value: string; label: string }[]
}

// Pi event objects are loosely shaped; this adapter probes fields defensively.
export type PiEvent = Record<string, any>

export interface ExtensionAPI {
  on(event: string, handler: (event: PiEvent, ctx: PiContext) => void | Promise<void>): void
  registerCommand(name: string, options: PiCommandOptions): void
}
