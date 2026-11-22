import { describe, expect, it } from 'vitest'
import {
  CELL_WIDTH,
  CHART_PADDING,
  NODE_HEIGHT,
  NODE_WIDTH,
  ROW_HEIGHT,
  arrowBetween,
  chartSize,
  nodeRect,
} from './layout'
import type { Area } from '../types'

function makeArea(id: string, row: number, column: number): Area {
  return {
    id,
    name: id,
    label: id,
    act: 1,
    mapType: 'fixed',
    row,
    column,
    features: ['feature'],
    entrance: ['entrance'],
    exit: ['exit'],
    rules: [{ turn: 'fixed' }],
  }
}

interface Point {
  x: number
  y: number
}

function parsePoints(points: string): Point[] {
  return points.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number)
    return { x, y }
  })
}

/** The reference chart's arrowheads overlap the node edge by a few units. */
const EDGE_TOLERANCE = 6

describe('nodeRect', () => {
  it('offsets a node by the chart padding when row and column are zero', () => {
    expect(nodeRect(makeArea('town', 0, 0))).toEqual({
      x: CHART_PADDING,
      y: CHART_PADDING,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })
  })

  it('places nodes on the exported column/row grid', () => {
    const rect = nodeRect(makeArea('mid', 2, 3))
    expect(rect.x).toBe(CHART_PADDING + 3 * CELL_WIDTH)
    expect(rect.y).toBe(CHART_PADDING + 2 * ROW_HEIGHT)
    expect(rect.width).toBe(NODE_WIDTH)
    expect(rect.height).toBe(NODE_HEIGHT)
  })

  it('supports fractional columns used by the reference layout', () => {
    const rect = nodeRect(makeArea('frac', 1, 2.5))
    expect(rect.x).toBe(CHART_PADDING + 2.5 * CELL_WIDTH)
    expect(rect.y).toBe(CHART_PADDING + ROW_HEIGHT)
  })
})

describe('chartSize', () => {
  it('adds padding on both sides of a single node at the origin', () => {
    expect(chartSize([makeArea('only', 0, 0)])).toEqual({
      width: CHART_PADDING * 2 + NODE_WIDTH,
      height: CHART_PADDING * 2 + NODE_HEIGHT,
    })
  })

  it('covers the furthest column and row, wherever they appear in the list', () => {
    const areas = [
      makeArea('far', 2, 4),
      makeArea('near', 0, 0),
      makeArea('middle', 1, 2.5),
    ]
    expect(chartSize(areas)).toEqual({
      width: CHART_PADDING * 2 + 4 * CELL_WIDTH + NODE_WIDTH,
      height: CHART_PADDING * 2 + 2 * ROW_HEIGHT + NODE_HEIGHT,
    })
  })

  it('never produces a chart smaller than one padded node', () => {
    const empty = chartSize([])
    expect(empty.width).toBeGreaterThanOrEqual(CHART_PADDING * 2 + NODE_WIDTH)
    expect(empty.height).toBeGreaterThanOrEqual(CHART_PADDING * 2 + NODE_HEIGHT)
  })
})

describe('arrowBetween', () => {
  it('returns null for nodes that share neither a row nor a column', () => {
    const from = makeArea('a', 0, 0)
    expect(arrowBetween(from, makeArea('b', 1, 1))).toBeNull()
    expect(arrowBetween(from, makeArea('c', 2, 3))).toBeNull()
    expect(arrowBetween(makeArea('d', 1, 1), from)).toBeNull()
  })

  it('draws a horizontal arrow from the right edge to the left edge of the next column', () => {
    const left = makeArea('left', 0, 0)
    const right = makeArea('right', 0, 1)
    const arrow = arrowBetween(left, right)

    expect(arrow).not.toBeNull()
    expect(arrow?.axis).toBe('horizontal')

    const points = parsePoints(arrow!.points)
    expect(points).toHaveLength(8)

    const source = nodeRect(left)
    const target = nodeRect(right)
    const tail = points[0]
    const tip = points[3]

    expect(Math.abs(tail.x - (source.x + source.width))).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(Math.abs(tip.x - target.x)).toBeLessThanOrEqual(EDGE_TOLERANCE)
    // The arrow points rightwards, so the tip is the right-most point.
    expect(tip.x).toBe(Math.max(...points.map((point) => point.x)))
    // Centred on the row.
    expect(tip.y).toBe(source.y + source.height / 2)
  })

  it('flips direction when the target is to the left', () => {
    const left = makeArea('left', 0, 0)
    const right = makeArea('right', 0, 1)
    const arrow = arrowBetween(right, left)

    expect(arrow?.axis).toBe('horizontal')
    const points = parsePoints(arrow!.points)
    expect(points).toHaveLength(8)

    const source = nodeRect(right)
    const target = nodeRect(left)
    const tail = points[0]
    const tip = points[3]

    // Tail at the left edge of the right-hand node, tip at the right edge of
    // the left-hand node.
    expect(Math.abs(tail.x - source.x)).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(Math.abs(tip.x - (target.x + target.width))).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(tip.x).toBe(Math.min(...points.map((point) => point.x)))
  })

  it('draws a vertical arrow down from the bottom edge to the top edge of the next row', () => {
    const top = makeArea('top', 0, 2)
    const bottom = makeArea('bottom', 1, 2)
    const arrow = arrowBetween(top, bottom)

    expect(arrow?.axis).toBe('vertical')
    const points = parsePoints(arrow!.points)
    expect(points).toHaveLength(8)

    const source = nodeRect(top)
    const target = nodeRect(bottom)
    const tail = points[0]
    const tip = points[3]

    expect(Math.abs(tail.y - (source.y + source.height))).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(Math.abs(tip.y - target.y)).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(tip.y).toBe(Math.max(...points.map((point) => point.y)))
    expect(tip.x).toBe(source.x + source.width / 2)
  })

  it('flips direction for vertical arrows pointing upwards', () => {
    const top = makeArea('top', 0, 2)
    const bottom = makeArea('bottom', 1, 2)
    const arrow = arrowBetween(bottom, top)

    expect(arrow?.axis).toBe('vertical')
    const points = parsePoints(arrow!.points)
    expect(points).toHaveLength(8)

    const source = nodeRect(bottom)
    const target = nodeRect(top)
    const tail = points[0]
    const tip = points[3]

    expect(Math.abs(tail.y - source.y)).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(Math.abs(tip.y - (target.y + target.height))).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(tip.y).toBe(Math.min(...points.map((point) => point.y)))
  })

  it('treats columns within a fraction of a cell as the same column', () => {
    // Reference-layout pairs: Outer Cloister at 7.8 / row 1 to Barracks at
    // 7.72 / row 0, and Inner Cloister at 9.69 / row 2 to Cathedral at 9.66 /
    // row 1. Both are off by less than the 0.15-cell tolerance, so both get a
    // vertical arrow instead of being dropped.
    const pairs: [Area, Area][] = [
      [makeArea('gate', 1, 7.8), makeArea('barracks', 0, 7.72)],
      [makeArea('inner-cloister', 2, 9.69), makeArea('cathedral', 1, 9.66)],
    ]
    for (const [from, to] of pairs) {
      const arrow = arrowBetween(from, to)
      expect(arrow, `${from.id} -> ${to.id}`).not.toBeNull()
      expect(arrow!.axis).toBe('vertical')
      expect(parsePoints(arrow!.points)).toHaveLength(8)
    }
  })

  it('draws the tolerance arrow downwards when the target row is below', () => {
    const arrow = arrowBetween(makeArea('barracks', 0, 7.72), makeArea('gate', 1, 7.8))
    expect(arrow?.axis).toBe('vertical')

    const points = parsePoints(arrow!.points)
    // Head first for a downward arrow: the tip is the bottom-most point.
    const tip = points[3]
    expect(tip.y).toBe(Math.max(...points.map((point) => point.y)))
  })

  it('centres the tolerance arrow on the target column', () => {
    for (const [from, to] of [
      [makeArea('gate', 1, 7.8), makeArea('barracks', 0, 7.72)],
      [makeArea('inner-cloister', 2, 9.69), makeArea('cathedral', 1, 9.66)],
    ] as [Area, Area][]) {
      const arrow = arrowBetween(from, to)
      const points = parsePoints(arrow!.points)
      const target = nodeRect(to)
      const targetCentre = target.x + target.width / 2

      // The tip sits exactly on the target column, not halfway between the two.
      expect(Math.abs(points[3].x - targetCentre)).toBeLessThanOrEqual(0.5)
      // The whole head is symmetric about the target column.
      const minX = Math.min(...points.map((point) => point.x))
      const maxX = Math.max(...points.map((point) => point.x))
      expect(Math.abs((minX + maxX) / 2 - targetCentre)).toBeLessThanOrEqual(0.5)
    }
  })

  it('draws a horizontal arrow for a same-row pair inside the column tolerance', () => {
    // Regression guard for branch order: when the column-tolerance check ran
    // first, a same-row pair 0.1 cells apart was treated as a column pair and
    // produced a vertical arrow instead of a horizontal one.
    const from = makeArea('from', 1, 2)
    const to = makeArea('to', 1, 2.1)
    expect(Math.abs(from.column - to.column)).toBeLessThan(0.15)

    const arrow = arrowBetween(from, to)
    expect(arrow).not.toBeNull()
    expect(arrow!.axis).toBe('horizontal')

    const points = parsePoints(arrow!.points)
    expect(points).toHaveLength(8)
    // A horizontal arrow is centred on the shared row, not on either column.
    const source = nodeRect(from)
    expect(points[3].y).toBe(source.y + source.height / 2)
  })

  it('accepts the tolerance boundary and rejects anything wider', () => {
    const tolerance = 0.15
    // Exactly one tolerance apart, in both column directions.
    for (const toColumn of [tolerance, -tolerance]) {
      const atBoundary = arrowBetween(makeArea('a', 0, 0), makeArea('b', 1, toColumn))
      expect(atBoundary?.axis, `column ${toColumn}`).toBe('vertical')
    }

    expect(arrowBetween(makeArea('a', 0, 0), makeArea('b', 1, 0.16))).toBeNull()
    expect(arrowBetween(makeArea('a', 0, 0), makeArea('b', 1, -0.16))).toBeNull()
  })

  it('returns null when the columns differ beyond the tolerance and the rows differ too', () => {
    expect(arrowBetween(makeArea('a', 0, 2), makeArea('b', 1, 2.16))).toBeNull()
    expect(arrowBetween(makeArea('a', 0, 0), makeArea('b', 3, 0.5))).toBeNull()
  })

  it('leaves horizontal pairs untouched by the column tolerance', () => {
    const left = makeArea('left', 1, 0)
    const right = makeArea('right', 1, 1)
    const arrow = arrowBetween(left, right)

    expect(arrow).not.toBeNull()
    expect(arrow!.axis).toBe('horizontal')

    const points = parsePoints(arrow!.points)
    const source = nodeRect(left)
    const target = nodeRect(right)
    // The tip lands on the target's left edge, on the shared row centre.
    expect(Math.abs(points[3].x - target.x)).toBeLessThanOrEqual(EDGE_TOLERANCE)
    expect(points[3].y).toBe(source.y + source.height / 2)
  })

  it('always emits eight polygon points', () => {
    const cases: [Area, Area][] = [
      [makeArea('a', 0, 0), makeArea('b', 0, 1)],
      [makeArea('a', 0, 1), makeArea('b', 0, 0)],
      [makeArea('a', 0, 0), makeArea('b', 1, 0)],
      [makeArea('a', 1, 0), makeArea('b', 0, 0)],
    ]
    for (const [from, to] of cases) {
      const arrow = arrowBetween(from, to)
      expect(arrow).not.toBeNull()
      expect(parsePoints(arrow!.points)).toHaveLength(8)
      for (const point of parsePoints(arrow!.points)) {
        expect(Number.isFinite(point.x)).toBe(true)
        expect(Number.isFinite(point.y)).toBe(true)
      }
    }
  })
})
