import { useState } from 'react'
import type { Area, NavigationRule } from '../types'
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  DIRECTION_SHORT,
  directionVector,
  isDirectional,
  rotate,
  turnPhrase,
  type Direction,
} from '../lib/directions'

interface TurnCalculatorProps {
  area: Area
}

const CENTRE = 130
const RING_RADIUS = 104
const TARGET_RADIUS = 82
const ENTRY_LENGTH = 50
const EXIT_LENGTH = 78
const HEAD = 15

/**
 * Pick the direction your entrance hallway runs and see which way the exit runs.
 * This is the video's core rule made interactive: the exit is the entrance
 * hallway rotated by 90 degrees, clockwise or counter-clockwise. Nothing has to
 * be picked to use it: the rule is already spelled out above the compass.
 */
export function TurnCalculator({ area }: TurnCalculatorProps) {
  const rules = area.rules.filter((rule) => isDirectional(rule.turn))
  const [ruleIndex, setRuleIndex] = useState(0)
  const [entry, setEntry] = useState<Direction | null>(null)

  if (rules.length === 0) return null
  const rule: NavigationRule = rules[Math.min(ruleIndex, rules.length - 1)]
  const exit = entry ? rotate(entry, rule.turn) : null
  // Catacombs L2 measures from the waypoint: there is no reliable entrance read,
  // so the hallway to look at is the one leading away from the waypoint.
  const origin = rule.from === 'waypoint' ? 'waypoint' : 'entrance'

  const pick = (direction: Direction) => {
    setEntry((current) => (current === direction ? null : direction))
  }

  return (
    <div className="turn">
      <div className="turn__head">
        <h2 className="turn__heading">Work out your exit</h2>
        <p className="turn__intro">
          {origin === 'waypoint' ? (
            <>
              This level is read from the waypoint, not the entrance. Which way does the hallway
              leaving the waypoint run? Click that direction on the compass.
            </>
          ) : (
            <>
              Look at the entrance tile, not at the stairs or your character: which way does the
              hallway it opens into run? Click that direction on the compass.
            </>
          )}
        </p>
      </div>

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
        <svg
          className="turn__svg"
          viewBox="0 0 260 260"
          role="img"
          aria-label={describe(area, origin, entry, exit)}
        >
          <circle className="turn__ring" cx={CENTRE} cy={CENTRE} r={RING_RADIUS} />

          {DIRECTIONS.map((direction) => {
            const vector = directionVector(direction)
            const active = entry === direction
            return (
              <g
                key={direction}
                className={`turn__target${active ? ' turn__target--active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Entrance runs ${DIRECTION_LABELS[direction]}`}
                aria-pressed={active}
                onClick={() => pick(direction)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    pick(direction)
                  }
                }}
              >
                <circle
                  cx={CENTRE + vector.x * TARGET_RADIUS}
                  cy={CENTRE + vector.y * TARGET_RADIUS}
                  r={17}
                />
                <text
                  x={CENTRE + vector.x * TARGET_RADIUS}
                  y={CENTRE + vector.y * TARGET_RADIUS + 5}
                  textAnchor="middle"
                >
                  {DIRECTION_SHORT[direction]}
                </text>
              </g>
            )
          })}

          <circle className="turn__origin" cx={CENTRE} cy={CENTRE} r={5} />

          {entry && (
            <Arrow direction={entry} length={ENTRY_LENGTH} kind="entry" label="ENTRANCE" />
          )}
          {exit && <Arrow direction={exit} length={EXIT_LENGTH} kind="exit" label="EXIT" />}
        </svg>

        <div className="turn__panel">
          <ul className="turn__legend">
            <li>
              <span className="turn__swatch turn__swatch--entry" /> entrance hallway
            </li>
            <li>
              <span className="turn__swatch turn__swatch--exit" /> exit hallway
            </li>
          </ul>

          {entry && exit ? (
            <>
              <p className="turn__answer">
                Entrance runs <strong>{DIRECTION_LABELS[entry]}</strong>.
              </p>
              <p className="turn__answer turn__answer--exit">
                The exit runs <strong>{DIRECTION_LABELS[exit]}</strong>.
              </p>
              <p className="turn__how">
                {turnPhrase(rule.turn)}, measured from the {origin} hallway.
              </p>
            </>
          ) : (
            <p className="turn__answer turn__answer--empty">
              Click the compass direction your entrance hallway points. If it is not obvious yet,
              walk a few steps in and look again.
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
  kind: 'entry' | 'exit'
  label: string
}

function Arrow({ direction, length, kind, label }: ArrowProps) {
  const vector = directionVector(direction)
  const tipX = CENTRE + vector.x * length
  const tipY = CENTRE + vector.y * length
  const perpendicular = { x: -vector.y, y: vector.x }
  const baseX = tipX - vector.x * HEAD
  const baseY = tipY - vector.y * HEAD
  const spread = kind === 'exit' ? 10 : 7
  // Labels sit off to one side so the two arrows never bury each other.
  const side = kind === 'exit' ? -1 : 1
  const labelX = tipX + perpendicular.x * 30 * side + vector.x * 10
  const labelY = tipY + perpendicular.y * 30 * side + vector.y * 10 + 4

  return (
    <g className={`turn__arrow turn__arrow--${kind}`}>
      <line x1={CENTRE} y1={CENTRE} x2={baseX} y2={baseY} />
      <polygon
        points={[
          `${tipX},${tipY}`,
          `${baseX + perpendicular.x * spread},${baseY + perpendicular.y * spread}`,
          `${baseX - perpendicular.x * spread},${baseY - perpendicular.y * spread}`,
        ].join(' ')}
      />
      <text x={labelX} y={labelY} textAnchor="middle">
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

function describe(
  area: Area,
  origin: 'entrance' | 'waypoint',
  entry: Direction | null,
  exit: Direction | null,
): string {
  if (!entry || !exit) return `Work out the exit direction for ${area.name}`
  return `The ${origin} hallway runs ${DIRECTION_LABELS[entry]}, the exit runs ${DIRECTION_LABELS[exit]}`
}
