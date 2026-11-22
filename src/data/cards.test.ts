import { describe, expect, it } from 'vitest'
import cards from '../../tools/cards.json'
import { availableActs } from './acts'

interface Card {
  id: string
  act?: number
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

  it('only lists ids that exist as areas in an available act', () => {
    const areaIds = new Set(availableActs.flatMap((act) => act.areas.map((area) => area.id)))
    for (const card of manifest) {
      expect(areaIds.has(card.id), `card id ${JSON.stringify(card.id)}`).toBe(true)
    }
  })

  it('labels every card with the act its area belongs to', () => {
    const actOfArea = new Map(
      availableActs.flatMap((act) => act.areas.map((area) => [area.id, act.number] as const)),
    )
    for (const card of manifest) {
      expect(card.act, `card ${card.id} act`).toBe(actOfArea.get(card.id))
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
