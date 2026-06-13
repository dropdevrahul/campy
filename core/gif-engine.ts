import type { FrameData } from "./types"

export class GifEngine {
  private idx = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private destroyed = false
  private signal: { get: () => string[]; set: (v: string[]) => void }
  private frames: FrameData

  constructor(frames: FrameData, signal: { get: () => string[]; set: (v: string[]) => void }) {
    this.frames = frames
    this.signal = signal
  }

  start(): void {
    if (this.destroyed || this.frames.frames.length === 0) return
    this.idx = 0
    this.schedule()
  }

  private schedule(): void {
    if (this.destroyed) return
    this.signal.set(this.frames.frames[this.idx])
    this.timer = setTimeout(() => {
      this.idx = (this.idx + 1) % this.frames.frames.length
      this.schedule()
    }, this.frames.durations[this.idx] || 200)
  }

  destroy(): void {
    this.destroyed = true
    if (this.timer) { clearTimeout(this.timer); this.timer = null }
  }
}
