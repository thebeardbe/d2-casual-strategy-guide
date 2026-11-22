import { describe, expect, it } from 'vitest'
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  DIRECTION_VECTORS,
  isDirectional,
  rotate,
  turnPhrase,
  type Direction,
} from './directions'
import type { Turn } from '../types'

const NON_DIRECTIONAL: Turn[] = ['fixed', 'alternating', 'random']

const ALL_DIRECTIONS: Direction[] = [...DIRECTIONS]

describe('DIRECTIONS', () => {
  it('lists the four diagonals in counter-clockwise order', () => {
    expect(DIRECTIONS).toEqual(['NE', 'NW', 'SW', 'SE'])
  })

  it('gives every direction a long label and a drawing vector', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(DIRECTION_LABELS[direction]).toBeTruthy()
      expect(DIRECTION_VECTORS[direction]).toBeDefined()
    }
  })
})

describe('rotate counter-clockwise', () => {
  it('turns the entrance a quarter turn to the visual left', () => {
    // The owner's worked example: a hallway running south-east turns left to north-east.
    expect(rotate('SE', 'counter-clockwise')).toBe('NE')
    expect(rotate('NE', 'counter-clockwise')).toBe('NW')
    expect(rotate('NW', 'counter-clockwise')).toBe('SW')
    expect(rotate('SW', 'counter-clockwise')).toBe('SE')
  })
})

describe('rotate clockwise', () => {
  it('turns the entrance a quarter turn to the visual right', () => {
    expect(rotate('SE', 'clockwise')).toBe('SW')
    expect(rotate('NE', 'clockwise')).toBe('SE')
    expect(rotate('NW', 'clockwise')).toBe('NE')
    expect(rotate('SW', 'clockwise')).toBe('NW')
  })

  it('is the inverse of counter-clockwise for every direction', () => {
    for (const direction of ALL_DIRECTIONS) {
      const turned = rotate(direction, 'counter-clockwise')
      expect(turned).not.toBeNull()
      expect(rotate(turned as Direction, 'clockwise')).toBe(direction)
    }
  })
})

describe('rotate straight', () => {
  it('returns the same direction for all four directions', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, 'straight')).toBe(direction)
    }
  })
})

describe('rotate over repeated turns', () => {
  it('returns to the starting direction after four counter-clockwise turns', () => {
    for (const start of ALL_DIRECTIONS) {
      let direction: Direction | null = start
      for (let turn = 0; turn < 4; turn += 1) {
        direction = rotate(direction as Direction, 'counter-clockwise')
      }
      expect(direction).toBe(start)
    }
  })

  it('returns to the starting direction after four clockwise turns', () => {
    for (const start of ALL_DIRECTIONS) {
      let direction: Direction | null = start
      for (let turn = 0; turn < 4; turn += 1) {
        direction = rotate(direction as Direction, 'clockwise')
      }
      expect(direction).toBe(start)
    }
  })

  it('reaches every direction exactly once across the four counter-clockwise steps', () => {
    for (const start of ALL_DIRECTIONS) {
      const seen = new Set<Direction>()
      let direction: Direction = start
      for (let turn = 0; turn < 4; turn += 1) {
        seen.add(direction)
        direction = rotate(direction, 'counter-clockwise') as Direction
      }
      expect(seen).toEqual(new Set(ALL_DIRECTIONS))
    }
  })
})

describe('rotate on rules that are not directional', () => {
  it.each(NON_DIRECTIONAL)('returns null for %s', (turn) => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, turn)).toBeNull()
    }
  })
})

describe('isDirectional', () => {
  it('accepts only the three rules that can be turned into a direction answer', () => {
    expect(isDirectional('counter-clockwise')).toBe(true)
    expect(isDirectional('clockwise')).toBe(true)
    expect(isDirectional('straight')).toBe(true)
  })

  it.each(NON_DIRECTIONAL)('rejects %s', (turn) => {
    expect(isDirectional(turn)).toBe(false)
  })
})

describe('turnPhrase', () => {
  it('describes a counter-clockwise turn as left', () => {
    expect(turnPhrase('counter-clockwise')).toMatch(/left/i)
  })

  it('describes a clockwise turn as right', () => {
    expect(turnPhrase('clockwise')).toMatch(/right/i)
  })

  it('describes a straight rule as going straight', () => {
    expect(turnPhrase('straight')).toMatch(/straight/i)
  })
})
