import type { Turn } from '../types'

interface DirectionGlyphProps {
  turn: Turn
  /** Drawn next to the caption when the card has a waypoint to show as well. */
  size?: number
}

interface Glyph {
  caption: string
  /** Path from the entrance up the level, then into the exit. */
  path?: string
  head?: { points: string }
  glyph?: string
}

const GLYPHS: Record<Turn, Glyph> = {
  straight: {
    caption: 'Straight ahead',
    path: 'M60 104 L60 46',
    head: { points: '60,32 72,56 48,56' },
  },
  'counter-clockwise': {
    caption: 'Turn counter-clockwise',
    path: 'M60 104 L60 60 L34 60',
    head: { points: '20,60 44,48 44,72' },
  },
  clockwise: {
    caption: 'Turn clockwise',
    path: 'M60 104 L60 60 L86 60',
    head: { points: '100,60 76,48 76,72' },
  },
  fixed: { caption: 'Same layout every time', glyph: '\u2261' },
  alternating: { caption: 'One of a few fixed layouts', glyph: '\u2261' },
  random: { caption: 'No reliable rule', glyph: '?' },
}

/**
 * Small entrance-to-exit turn indicator. The direction comes from the same
 * NavigationRule data as the big diagram, so a card always shows which way to
 * turn even when it has an example map.
 */
export function DirectionGlyph({ turn, size = 120 }: DirectionGlyphProps) {
  const glyph = GLYPHS[turn]
  return (
    <figure className="glyph" style={{ width: size }}>
      <svg className="glyph__svg" viewBox="0 0 120 120" role="img" aria-label={glyph.caption}>
        <line className="glyph__entrance" x1="60" y1="116" x2="60" y2="104" />
        {glyph.path ? (
          <path className="glyph__route" d={glyph.path} />
        ) : (
          <circle className="glyph__ring" cx="60" cy="66" r="34" />
        )}
        {glyph.head && <polygon className="glyph__head" points={glyph.head.points} />}
        {glyph.glyph && (
          <text className="glyph__mark" x="60" y="80" textAnchor="middle">
            {glyph.glyph}
          </text>
        )}
      </svg>
      <figcaption className="glyph__caption">{glyph.caption}</figcaption>
    </figure>
  )
}
