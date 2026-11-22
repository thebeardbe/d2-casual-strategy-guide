import { describe, expect, it } from 'vitest'
import { wrapLabel } from './label'

function words(text: string): string[] {
  return text.split(' ').filter(Boolean)
}

describe('wrapLabel', () => {
  it('keeps a short single-word label on one line', () => {
    expect(wrapLabel('Tristram')).toEqual(['Tristram'])
  })

  it('keeps a short multi-word label on one line', () => {
    expect(wrapLabel('Jail L1')).toEqual(['Jail L1'])
    expect(wrapLabel('Cave L2')).toEqual(['Cave L2'])
  })

  it('splits long labels into at most three lines', () => {
    const longLabels = [
      'Underground Passage Level 2',
      'Monastery Gate Outer Cloister',
      'Tower Cellar Levels One To Four',
    ]
    for (const label of longLabels) {
      const lines = wrapLabel(label)
      expect(lines.length, label).toBeGreaterThan(1)
      expect(lines.length, label).toBeLessThanOrEqual(3)
    }
  })

  it('never loses or reorders words', () => {
    for (const label of ['Den of Evil', 'Underground Passage Level 2', 'Monastery Gate Outer Cloister']) {
      expect(wrapLabel(label).join(' ').split(' ')).toEqual(words(label))
    }
  })

  it('balances a two-line result instead of leaving one word alone', () => {
    // Greedy wrapping would produce ["Catacombs Level", "Three"].
    expect(wrapLabel('Catacombs Level Three')).toEqual(['Catacombs', 'Level Three'])
  })

  it('does not leave a single-word second line for two-word labels that fit one line', () => {
    expect(wrapLabel('Blood Moor')).toHaveLength(1)
  })

  it('respects a custom maxChars and still returns every word', () => {
    const lines = wrapLabel('Den of Evil Quest', 6)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.length).toBeLessThanOrEqual(4)
    expect(lines.join(' ').split(' ')).toEqual(words('Den of Evil Quest'))
  })
})
