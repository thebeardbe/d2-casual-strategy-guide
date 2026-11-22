import { useState } from 'react'
import type { Area, NavigationRule } from '../types'
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  DIRECTION_SHORT,
  DIRECTION_VECTORS,
  isDirectional,
  rotate,
  turnPhrase,
  type Direction,
} from '../lib/directions'

interface TurnCalculatorProps {
  area: Area
}

const CENTRE = 110
const ENTRY_LENGTH = 44
const EXIT_LENGTH = 82
const HEAD = 13

/**
 * Pick the direction your entrance hallway runs and see which way the exit runs.
 * This is the video's core rule made interactive: the exit is the entrance
 * hallway rotated by 90 degrees, clockwise or counter-clockwise.
 */
export function TurnCalculator({ area }: TurnCalculatorProps) {
  const rules = area.rules.filter((rule) => isDirectional(rule.turn))
  const [ruleIndex, setRuleIndex] = useState(0)
  const [entry, setEntry] = useState<Direction | null>(null)

  if (rules.length === 0) return null
  const rule: NavigationRule = rules[Math.min(ruleIndex, rules.length - 1)]
  const exit = entry ? rotate(entry, rule.turn) : null

  return (
    <div className="turn">
      <h2 className="turn__heading">Work out your exit</h2>
      <p className="turn__intro">
        Look at the entrance tile, not at the stairs or your character: which way does the
        hallway it opens into run?
      </p>

      {rules.length > 1 && (
        <div className="turn__rules" role="group" aria-label="Which exit">
          {rules.map((candidate, index) => (
            <button
              key={`${candidate.turn}-${candidate.towards ?? index}`}
              type="button"
              className={`turn__rule${index === ruleIndex ? ' turn__rule--active' : ''}`}
              aria-pressed={index === ruleIndex}
              onClick={() => setRuleIndex(index)}
            >
              {ruleLabel(candidate, index)}
            </button>
          ))}
        </div>
      )}

      <div className="turn__body">
        <svg className="turn__svg" viewBox="0 0 220 220" role="img" aria-label={describe(area, entry, exit)}>
          <circle className="turn__grid" cx={CENTRE} cy={CENTRE} r={96} />
          {DIRECTIONS.map((direction) => {
            const vector = DIRECTION_VECTORS[direction]
            return (
              <line
                key={direction}
                className="turn__spoke"
                x1={CENTRE + vector.x * 22}
                y1={CENTRE + vector.y * 22}
                x2={CENTRE + vector.x * 96}
                y2={CENTRE + vector.y * 96}
              />
            )
          })}
          <text className="turn__compass" x={CENTRE} y={16} textAnchor="middle">N</text>
          <text className="turn__compass" x={210} y={CENTRE + 4} textAnchor="middle">E</text>
          <text className="turn__compass" x={CENTRE} y={214} textAnchor="middle">S</text>
          <text className="turn__compass" x={10} y={CENTRE + 4} textAnchor="middle">W</text>

          {entry && (
            <Arrow direction={entry} length={ENTRY_LENGTH} className="turn__arrow--entry" label="in" />
          )}
          {exit && (
            <Arrow direction={exit} length={EXIT_LENGTH} className="turn__arrow--exit" label="out" />
          )}
        </svg>

        <div className="turn__panel">
          <p className="turn__prompt">{entry ? `${turnPhrase(rule.turn)} from there:` : 'Pick your entrance direction:'}</p>
          <div className="turn__picks" role="group" aria-label="Entrance hallway direction">
            {DIRECTIONS.map((direction) => (
              <button
                key={direction}
                type="button"
                className={`turn__pick${entry === direction ? ' turn__pick--active' : ''}`}
                aria-pressed={entry === direction}
                title={DIRECTION_LABELS[direction]}
                onClick={() => setEntry(direction)}
              >
                {DIRECTION_SHORT[direction]}
              </button>
            ))}
          </div>

          {entry && exit ? (
            <p className="turn__answer">
              Entrance runs <strong>{DIRECTION_LABELS[entry]}</strong>. The exit runs{' '}
              <strong>{DIRECTION_LABELS[exit]}</strong>.
            </p>
          ) : (
            <p className="turn__answer turn__answer--empty">
              Pick the direction the entrance hallway points. If it is not clear, you can walk a few
              steps in and look again.
            </p>
          )}
        </div>
      </div>

    </div>
  )
}

interface ArrowProps {
  direction: Direction
  length: number
  className: string
  label: string
}

function Arrow({ direction, length, className, label }: ArrowProps) {
  const vector = DIRECTION_VECTORS[direction]
  const tipX = CENTRE + vector.x * length
  const tipY = CENTRE + vector.y * length
  const perpendicular = { x: -vector.y, y: vector.x }
  const baseX = tipX - vector.x * HEAD
  const baseY = tipY - vector.y * HEAD

  return (
    <g className={`turn__arrow ${className}`}>
      <line x1={CENTRE} y1={CENTRE} x2={baseX} y2={baseY} />
      <polygon
        points={[
          `${tipX},${tipY}`,
          `${baseX + perpendicular.x * 8},${baseY + perpendicular.y * 8}`,
          `${baseX - perpendicular.x * 8},${baseY - perpendicular.y * 8}`,
        ].join(' ')}
      />
      <text x={tipX + vector.x * 16} y={tipY + vector.y * 16 + 4} textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

/**
 * Jail L1 has four rules and two of them lead to Jail L2, so the button needs the
 * starting point as well as the target.
 */
function ruleLabel(rule: NavigationRule, index: number): string {
  if (!rule.towards) return `rule ${index + 1}`
  return rule.from ? `${rule.towards} (from the ${rule.from})` : rule.towards
}

function describe(area: Area, entry: Direction | null, exit: Direction | null): string {
  if (!entry || !exit) return `Work out the exit direction for ${area.name}`
  return `Entrance runs ${DIRECTION_LABELS[entry]}, exit runs ${DIRECTION_LABELS[exit]}`
}
