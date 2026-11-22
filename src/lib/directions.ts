import type { Turn } from '../types'

/**
 * Isometric hallways in Diablo II run along the four diagonals, so the entrance
 * tile can only point one of these four ways. Listed in counter-clockwise order,
 * which makes the rotation maths a step along the list.
 */
export const DIRECTIONS = ['NE', 'NW', 'SW', 'SE'] as const

export type Direction = (typeof DIRECTIONS)[number]

export const DIRECTION_LABELS: Record<Direction, string> = {
  NE: 'north-east (up-right)',
  NW: 'north-west (up-left)',
  SW: 'south-west (down-left)',
  SE: 'south-east (down-right)',
}

/** Short label for a button. */
export const DIRECTION_SHORT: Record<Direction, string> = {
  NE: 'NE',
  NW: 'NW',
  SW: 'SW',
  SE: 'SE',
}

/** Unit vector for drawing, screen coordinates (y grows downwards). */
export const DIRECTION_VECTORS: Record<Direction, { x: number; y: number }> = {
  NE: { x: 1, y: -1 },
  NW: { x: -1, y: -1 },
  SW: { x: -1, y: 1 },
  SE: { x: 1, y: 1 },
}

/** True when a rule can be turned into a direction answer. */
export function isDirectional(turn: Turn): boolean {
  return turn === 'counter-clockwise' || turn === 'clockwise' || turn === 'straight'
}

/**
 * Which way the exit hallway runs, given the way the entrance hallway runs.
 * Counter-clockwise is a visual left turn: south-east becomes north-east.
 */
export function rotate(entry: Direction, turn: Turn): Direction | null {
  const index = DIRECTIONS.indexOf(entry)
  if (index < 0) return null
  switch (turn) {
    case 'counter-clockwise':
      return DIRECTIONS[(index + 1) % DIRECTIONS.length]
    case 'clockwise':
      return DIRECTIONS[(index - 1 + DIRECTIONS.length) % DIRECTIONS.length]
    case 'straight':
      return entry
    default:
      return null
  }
}

/** "turn 90° counter-clockwise (left)" and friends. */
export function turnPhrase(turn: Turn): string {
  switch (turn) {
    case 'counter-clockwise':
      return 'turn 90\u00b0 counter-clockwise (left)'
    case 'clockwise':
      return 'turn 90\u00b0 clockwise (right)'
    case 'straight':
      return 'keep going straight'
    default:
      return 'no reliable rule'
  }
}
