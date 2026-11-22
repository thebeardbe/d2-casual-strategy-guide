import type { Area, NavigationRule as Rule, Turn } from '../types'

interface NavigationRuleProps {
  area: Area
}

interface TurnDiagram {
  /** Degrees to rotate the exit arrow, clockwise from "straight ahead". */
  rotation: number
  caption: string
  detail: string
}

const DIAGRAMS: Record<Turn, TurnDiagram> = {
  'counter-clockwise': {
    rotation: -90,
    caption: 'Turn 90\u00b0 counter-clockwise',
    detail:
      'Walk in along the entrance pathway, then take the first hallway pointing to your left. The exit is usually somewhere on that side of the map.',
  },
  clockwise: {
    rotation: 90,
    caption: 'Turn 90\u00b0 clockwise',
    detail:
      'Walk in along the entrance pathway, then take the first hallway pointing to your right. The exit is usually somewhere on that side of the map.',
  },
  straight: {
    rotation: 0,
    caption: 'Straight ahead',
    detail:
      'Entrance and exit pathways point the same way, so keep following the hallway.',
  },
  fixed: {
    rotation: 0,
    caption: 'Same layout every time',
    detail:
      'There is nothing to read here: the level always generates the same way, so it is worth memorising once.',
  },
  alternating: {
    rotation: 0,
    caption: 'One of a few fixed layouts',
    detail:
      'The level picks one of a small set of pre-built layouts, and the options mirror each other, so learn the handful.',
  },
  random: {
    rotation: 0,
    caption: 'No reliable rule',
    detail:
      'The entrance tells you nothing useful here. Learn the dead-end hallway tiles and turn around as soon as you see them.',
  },
}

/** Shown when no example screenshot could be captured for an area. */
export function NavigationRule({ area }: NavigationRuleProps) {
  const rule: Rule = area.rules[0] ?? { turn: 'random' }
  const diagram = DIAGRAMS[rule.turn]
  const directional = rule.turn === 'counter-clockwise' || rule.turn === 'clockwise' || rule.turn === 'straight'
  const from = rule.from === 'waypoint' ? 'the waypoint' : 'the entrance'

  return (
    <div className="nav-rule">
      <h2 className="nav-rule__heading">How to navigate</h2>
      <p className="nav-rule__caption-line">{diagram.caption}</p>

      <svg
        className="nav-rule__svg"
        viewBox="0 0 420 250"
        role="img"
        aria-label={`${diagram.caption}, measured from ${from}`}
      >
        {directional ? (
          <>
            <g className="nav-rule__arrow nav-rule__arrow--entrance">
              <line x1="140" y1="196" x2="140" y2="64" />
              <polygon points="140,40 158,76 122,76" />
            </g>
            <g
              className="nav-rule__arrow nav-rule__arrow--exit"
              transform={`rotate(${diagram.rotation} 280 130)`}
            >
              <line x1="280" y1="196" x2="280" y2="64" />
              <polygon points="280,40 298,76 262,76" />
            </g>
            <text className="nav-rule__label" x="140" y="226" textAnchor="middle">
              entrance
            </text>
            <text className="nav-rule__label" x="280" y="226" textAnchor="middle">
              exit
            </text>
          </>
        ) : (
          <>
            <circle className="nav-rule__glyph" cx="210" cy="130" r="76" />
            <text className="nav-rule__glyph-text" x="210" y="146" textAnchor="middle">
              {rule.turn === 'random' ? '?' : '\u2261'}
            </text>
          </>
        )}
      </svg>

      <p className="nav-rule__detail">
        {diagram.detail} Measured from {from}.
      </p>

      {area.rules.length > 1 && (
        <ul className="nav-rule__rules">
          {area.rules.map((extra, index) => (
            <li key={`${extra.turn}-${index}`}>
              {DIAGRAMS[extra.turn].caption}
              {extra.towards ? ` towards ${extra.towards}` : ''}
              {extra.from === 'waypoint' ? ', from the waypoint' : ''}
            </li>
          ))}
        </ul>
      )}

      <p className="nav-rule__note">
        No example screenshot was captured for this area. The examples in the source video are
        gameplay footage for this one.
      </p>
    </div>
  )
}
