// Sprite canvas geometry. Every frame is padded to HL rows and SW cols so
// layers compose cleanly and the runtime can rely on fixed bounds.
export const HL = 12
export const SW = 22

export const pad = (lines: string[], width: number = SW) => {
  const padded = lines.map(l => l.padEnd(width))
  while (padded.length < HL) padded.push(" ".repeat(width))
  return padded
}

// Pad with the body block sitting in a specific row band. Useful when a layer
// only paints a few rows (e.g. an aura band at the top, or just the eyes).
export const padAt = (lines: string[], topRow: number, width: number = SW) => {
  const out: string[] = []
  for (let r = 0; r < HL; r++) {
    if (r >= topRow && r - topRow < lines.length) out.push(lines[r - topRow].padEnd(width))
    else out.push(" ".repeat(width))
  }
  return out
}

export const mergeLayers = (layers: string[][]): string[] => {
  if (layers.length === 0) return []
  if (layers.length === 1) return layers[0]
  const height = Math.max(...layers.map(l => l.length))
  const width = Math.max(...layers.map(l => l[0]?.length ?? 0))
  const result: string[] = []
  for (let row = 0; row < height; row++) {
    let line = " ".repeat(width)
    for (const layer of layers) {
      const sourceRow = layer[row] ?? ""
      for (let col = 0; col < sourceRow.length; col++) {
        if (sourceRow[col] !== " ") {
          line = line.substring(0, col) + sourceRow[col] + line.substring(col + 1)
        }
      }
    }
    result.push(line)
  }
  return result
}
