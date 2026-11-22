import type { Turn } from '../types'

/**
 * Compass bearings in degrees, 0 = north, 90 = east. Rotating 90 degrees
 * counter-clockwise subtracts from the bearing, clockwise adds, which keeps the
 * maths honest for all eight directions instead of relying on list order.
 */
export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export const BEARINGS: Record<Direction, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
}

export const DIRECTIONS = Object.keys(BEARINGS) as Direction[]

export const DIRECTION_LABELS: Record<Direction, string> = {
  N: 'north (up)',
  NE: 'north-east (up-right)',
  E: 'east (right)',
  SE: 'south-east (down-right)',
  S: 'south (down)',
  SW: 'south-west (down-left)',
  W: 'west (left)',
  NW: 'north-west (up-left)',
}

export const DIRECTION_SHORT: Record<Direction, string> = {
  N: 'N',
  NE: 'NE',
  E: 'E',
  SE: 'SE',
  S: 'S',
  SW: 'SW',
  W: 'W',
  NW: 'NW',
}

/** Unit vector for drawing, in screen coordinates (y grows downwards). */
export function directionVector(direction: Direction): { x: number; y: number } {
  const radians = ((BEARINGS[direction] - 90) * Math.PI) / 180
  return { x: Math.cos(radians), y: Math.sin(radians) }
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
  if (!isDirectional(turn)) return null
  const delta = turn === 'counter-clockwise' ? -90 : turn === 'clockwise' ? 90 : 0
  const bearing = (((BEARINGS[entry] + delta) % 360) + 360) % 360
  const match = DIRECTIONS.find((direction) => BEARINGS[direction] === bearing)
  if (!match) {
    console.warn(`No compass direction for bearing ${bearing}; the turn is not a multiple of 45 degrees.`)
    return null
  }
  return match as Direction
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
