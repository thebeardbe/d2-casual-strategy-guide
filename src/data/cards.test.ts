import { describe, expect, it } from 'vitest'
import cards from '../../tools/cards.json'
import { act1 } from './act1'

interface Card {
  id: string
  cardType?: string | string[]
  window: [number, number]
  allowLow?: boolean
  force?: number
}

/**
 * Read with a normal JSON import: `resolveJsonModule` is on in tsconfig.app,
 * and the file lives outside `src`, so this avoids pulling in Node's fs types
 * (tsconfig.app only loads `vite/client`). Vite/vitest handle the relative JSON
 * path outside the source root without any extra config.
 */
const manifest = cards as unknown as Card[]

describe('tools/cards.json manifest', () => {
  it('has at least one card', () => {
    expect(manifest.length).toBeGreaterThan(0)
  })

  it('only lists ids that exist as Act I areas', () => {
    const areaIds = new Set(act1.areas.map((area) => area.id))
    for (const card of manifest) {
      expect(areaIds.has(card.id), `card id ${JSON.stringify(card.id)}`).toBe(true)
    }
  })

  it('lists no card twice', () => {
    const ids = manifest.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses cardType, not the old type field', () => {
    for (const card of manifest) {
      expect(card.cardType, `${card.id} cardType`).toBeTruthy()
      expect('type' in card, `${card.id} still has a type field`).toBe(false)
    }
  })

  it('gives every card a pair of increasing integer seconds', () => {
    for (const card of manifest) {
      expect(Array.isArray(card.window), `${card.id} window is an array`).toBe(true)
      expect(card.window, `${card.id} window length`).toHaveLength(2)
      const [start, end] = card.window
      expect(Number.isInteger(start), `${card.id} window start ${start}`).toBe(true)
      expect(Number.isInteger(end), `${card.id} window end ${end}`).toBe(true)
      expect(start, `${card.id} window start`).toBeGreaterThanOrEqual(0)
      expect(start, `${card.id} window must increase`).toBeLessThan(end)
    }
  })

  it('only uses allowLow on cards that carry a cardType', () => {
    const lowConfidence = manifest.filter((card) => card.allowLow)
    // Act I currently needs the override for Pit L2; if that changes, the loop
    // below still guards every remaining card that opts in.
    expect(lowConfidence.length).toBeGreaterThan(0)
    for (const card of lowConfidence) {
      expect(card.cardType, `${card.id} allowLow without cardType`).toBeTruthy()
    }
  })
})
