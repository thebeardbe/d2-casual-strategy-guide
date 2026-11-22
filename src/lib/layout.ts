import type { Area } from '../types'

/**
 * Chart geometry, in SVG units. The reference chart draws 112x62 nodes on a
 * 145-wide column grid with 107-tall rows, so these constants reproduce its
 * proportions rather than being arbitrary.
 */
export const CELL_WIDTH = 145
export const ROW_HEIGHT = 107
export const NODE_WIDTH = 112
export const NODE_HEIGHT = 62
export const CHART_PADDING = 28

/** Arrow proportions, taken from the reference chart's chunky arrowheads. */
const HEAD_HEIGHT = 46
const TAIL_THICKNESS = 22
const MAX_HEAD_LENGTH = 26
const ARROW_OVERLAP = 4
/**
 * Columns are fractional so the chart matches the reference layout's uneven
 * spacing, which leaves paired nodes a few units apart. Anything inside this
 * many cells still counts as the same column, so those pairs get a vertical
 * arrow instead of being dropped.
 */
const COLUMN_TOLERANCE = 0.15

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Arrow {
  points: string
  /** Axis the arrow runs along; the chart only uses axis-aligned arrows. */
  axis: 'horizontal' | 'vertical'
}

export function nodeRect(area: Pick<Area, 'row' | 'column'>): Rect {
  return {
    x: CHART_PADDING + area.column * CELL_WIDTH,
    y: CHART_PADDING + area.row * ROW_HEIGHT,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }
}

export function chartSize(areas: Pick<Area, 'row' | 'column'>[]): { width: number; height: number } {
  const maxColumn = areas.reduce((max, area) => Math.max(max, area.column), 0)
  const maxRow = areas.reduce((max, area) => Math.max(max, area.row), 0)
  return {
    width: CHART_PADDING * 2 + maxColumn * CELL_WIDTH + NODE_WIDTH,
    height: CHART_PADDING * 2 + maxRow * ROW_HEIGHT + NODE_HEIGHT,
  }
}

/**
 * A chunky arrow with a notched tail, drawn from the edge of one node to the
 * edge of the next. Vertical arrows are aligned to the target column so they
 * point into the box they lead to. Returns null for pairs that are neither in
 * the same row nor the same column, because the chart has no diagonal arrows.
 */
export function arrowBetween(from: Area, to: Area): Arrow | null {
  const source = nodeRect(from)
  const target = nodeRect(to)
  const alignedColumn = Math.abs(from.column - to.column) <= COLUMN_TOLERANCE

  if (from.row === to.row) {
    const sourceCentre = source.x + source.width / 2
    const targetCentre = target.x + target.width / 2
    const direction = targetCentre > sourceCentre ? 1 : -1
    const tail = sourceCentre + (direction * source.width) / 2
    const tip = targetCentre - (direction * target.width) / 2
    return { ...arrowAlong(tail, tip, source.y + source.height / 2, 'horizontal'), axis: 'horizontal' }
  }
  if (alignedColumn) {
    const sourceCentre = source.y + source.height / 2
    const targetCentre = target.y + target.height / 2
    const direction = targetCentre > sourceCentre ? 1 : -1
    const tail = sourceCentre + (direction * source.height) / 2
    const tip = targetCentre - (direction * target.height) / 2
    return { ...arrowAlong(tail, tip, target.x + target.width / 2, 'vertical'), axis: 'vertical' }
  }
  return null
}

/**
 * Build the arrow polygon from `tail` to `tip` along one axis. `offset` is the
 * fixed coordinate on the other axis.
 */
function arrowAlong(tail: number, tip: number, offset: number, axis: 'horizontal' | 'vertical'): { points: string } {
  const direction = tip > tail ? 1 : -1
  const length = Math.abs(tip - tail) + ARROW_OVERLAP
  const headLength = Math.min(MAX_HEAD_LENGTH, length * 0.55)
  const notch = Math.min(8, length * 0.2)
  const start = tail - direction * (ARROW_OVERLAP / 2)

  // Local coordinates: u runs along the arrow, v across it.
  const local: [number, number][] = [
    [0, -TAIL_THICKNESS / 2],
    [length - headLength, -TAIL_THICKNESS / 2],
    [length - headLength, -HEAD_HEIGHT / 2],
    [length, 0],
    [length - headLength, HEAD_HEIGHT / 2],
    [length - headLength, TAIL_THICKNESS / 2],
    [0, TAIL_THICKNESS / 2],
    [notch, 0],
  ]

  const points = local.map(([u, v]) => {
    if (axis === 'horizontal') {
      return `${round(start + direction * u)},${round(offset + v)}`
    }
    return `${round(offset + v)},${round(start + direction * u)}`
  })
  return { points: points.join(' ') }
}

function round(value: number): string {
  return (Math.round(value * 10) / 10).toString()
}
