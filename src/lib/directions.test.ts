import { describe, expect, it } from 'vitest'
import {
  BEARINGS,
  DIRECTIONS,
  DIRECTION_LABELS,
  DIRECTION_SHORT,
  directionVector,
  isDirectional,
  rotate,
  turnPhrase,
  type Direction,
} from './directions'
import type { Turn } from '../types'

const NON_DIRECTIONAL: Turn[] = ['fixed', 'alternating', 'random']

const ALL_DIRECTIONS: Direction[] = [...DIRECTIONS]

/**
 * The expected result of a quarter turn in each compass direction, spelled out
 * rather than derived from BEARINGS so a broken bearing table is visible here.
 */
const COUNTER_CLOCKWISE: Record<Direction, Direction> = {
  N: 'W',
  NE: 'NW',
  E: 'N',
  SE: 'NE',
  S: 'E',
  SW: 'SE',
  W: 'S',
  NW: 'SW',
}

const CLOCKWISE: Record<Direction, Direction> = {
  N: 'E',
  NE: 'SE',
  E: 'S',
  SE: 'SW',
  S: 'W',
  SW: 'NW',
  W: 'N',
  NW: 'NE',
}

describe('BEARINGS', () => {
  it('maps all eight compass directions to 45 degree steps, north first', () => {
    expect(BEARINGS).toEqual({
      N: 0,
      NE: 45,
      E: 90,
      SE: 135,
      S: 180,
      SW: 225,
      W: 270,
      NW: 315,
    })
  })
})

describe('DIRECTIONS', () => {
  it('lists all eight compass points in clockwise order starting at north', () => {
    expect(DIRECTIONS).toEqual(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
  })

  it('gives every direction a long label, a short label and a drawing vector', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(DIRECTION_LABELS[direction], `${direction} long label`).toBeTruthy()
      expect(DIRECTION_SHORT[direction], `${direction} short label`).toBe(direction)
      const vector = directionVector(direction)
      expect(Number.isFinite(vector.x), `${direction} vector x`).toBe(true)
      expect(Number.isFinite(vector.y), `${direction} vector y`).toBe(true)
    }
  })
})

describe('directionVector', () => {
  it('points north up and east right in screen coordinates', () => {
    const expected: Record<Direction, { x: number; y: number }> = {
      N: { x: 0, y: -1 },
      NE: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
      E: { x: 1, y: 0 },
      SE: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
      S: { x: 0, y: 1 },
      SW: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
      W: { x: -1, y: 0 },
      NW: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
    }

    for (const direction of ALL_DIRECTIONS) {
      const vector = directionVector(direction)
      expect(vector.x, `${direction} x`).toBeCloseTo(expected[direction].x, 6)
      expect(vector.y, `${direction} y`).toBeCloseTo(expected[direction].y, 6)
      expect(Math.hypot(vector.x, vector.y), `${direction} unit length`).toBeCloseTo(1, 6)
    }
  })
})

describe('rotate counter-clockwise', () => {
  it('turns the entrance a quarter turn to the visual left for all eight directions', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, 'counter-clockwise'), `${direction} counter-clockwise`).toBe(
        COUNTER_CLOCKWISE[direction],
      )
    }
  })

  it('matches the worked examples', () => {
    // The owner's example: a hallway running south-east turns left to north-east.
    expect(rotate('SE', 'counter-clockwise')).toBe('NE')
    expect(rotate('NE', 'counter-clockwise')).toBe('NW')
    expect(rotate('E', 'counter-clockwise')).toBe('N')
    expect(rotate('N', 'counter-clockwise')).toBe('W')
  })
})

describe('rotate clockwise', () => {
  it('turns the entrance a quarter turn to the visual right for all eight directions', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, 'clockwise'), `${direction} clockwise`).toBe(
        CLOCKWISE[direction],
      )
    }
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
  it('returns the same direction for all eight directions', () => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, 'straight'), `${direction} straight`).toBe(direction)
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
      let direction: Direction = start
      for (let turn = 0; turn < 4; turn += 1) {
        direction = rotate(direction, 'clockwise') as Direction
      }
      expect(direction).toBe(start)
    }
  })

  it('visits four distinct directions before returning to where it started', () => {
    // A quarter turn follows one of two cycles of four directions: the cardinal
    // points or the diagonals.
    const EXPECTED_CYCLES: Record<Direction, Direction[]> = {
      N: ['N', 'W', 'S', 'E'],
      E: ['E', 'N', 'W', 'S'],
      S: ['S', 'E', 'N', 'W'],
      W: ['W', 'S', 'E', 'N'],
      NE: ['NE', 'NW', 'SW', 'SE'],
      SE: ['SE', 'NE', 'NW', 'SW'],
      SW: ['SW', 'SE', 'NE', 'NW'],
      NW: ['NW', 'SW', 'SE', 'NE'],
    }

    for (const start of ALL_DIRECTIONS) {
      const seen: Direction[] = []
      let direction: Direction = start
      for (let turn = 0; turn < 4; turn += 1) {
        seen.push(direction)
        direction = rotate(direction, 'counter-clockwise') as Direction
      }
      expect(seen).toEqual(EXPECTED_CYCLES[start])
      expect(new Set(seen).size).toBe(4)
      expect(seen[seen.length - 1]).not.toBe(start)
    }
  })
})

describe('rotate on rules that are not directional', () => {
  it.each(NON_DIRECTIONAL)('returns null for %s', (turn) => {
    for (const direction of ALL_DIRECTIONS) {
      expect(rotate(direction, turn), `${direction} ${turn}`).toBeNull()
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
