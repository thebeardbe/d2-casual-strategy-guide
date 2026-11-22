/**
 * Break a chart label into balanced lines so nodes keep the reference chart's
 * two- and three-line look instead of one long line.
 */
export function wrapLabel(text: string, maxChars = 15): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars || !current) {
      current = candidate
      continue
    }
    lines.push(current)
    current = word
  }
  if (current) lines.push(current)

  // Balance two-line labels so "Underground" / "Passage L1" beats
  // "Underground Passage" / "L1".
  if (lines.length === 2) {
    const [first, second] = lines
    const merged = `${first} ${second}`
    const splitAt = balancedSplit(merged)
    if (splitAt > 0) {
      return [merged.slice(0, splitAt).trim(), merged.slice(splitAt).trim()]
    }
  }
  return lines
}

function balancedSplit(text: string): number {
  const middle = text.length / 2
  let bestIndex = -1
  let bestDistance = Number.POSITIVE_INFINITY
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== ' ') continue
    const distance = Math.abs(index - middle)
    if (distance < bestDistance) {
      bestIndex = index
      bestDistance = distance
    }
  }
  return bestIndex
}
