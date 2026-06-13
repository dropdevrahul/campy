export const HL = 8

export const pad = (lines: string[], width: number) => {
  const padded = lines.map(l => l.padEnd(width))
  while (padded.length < HL) padded.push(" ".repeat(width))
  return padded
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
