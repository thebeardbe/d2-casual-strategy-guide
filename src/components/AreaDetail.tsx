import type { Act, Area } from '../types'
import { areaFill, areaMapTypeLabel, areaMapTypes, mapTypeColor, mapTypeHint, mapTypeLabel } from '../data/mapTypes'
import { Flowchart } from './Flowchart'
import { DirectionGlyph } from './DirectionGlyph'
import { NavigationRule } from './NavigationRule'

interface AreaDetailProps {
  act: Act
  area: Area
  onSelect: (areaId: string) => void
  onClose: () => void
}

export function AreaDetail({ act, area, onSelect, onClose }: AreaDetailProps) {
  const fill = areaFill(area)
  const typeBackground = fill.gradient
    ? `linear-gradient(180deg, ${fill.gradient[0]} 0%, ${fill.gradient[1]} 100%)`
    : fill.solid

  return (
    <div className="detail">
      <aside className="panel">
        <button className="panel__close" type="button" onClick={onClose} aria-label="Close and return to the chart">
          {'\u00d7'}
        </button>
        <div className="panel__inner">
          <h1 className="panel__title" style={{ background: typeBackground }}>
            {area.name}
          </h1>
          <p className="panel__type">Type: {areaMapTypeLabel(area)}</p>
          <p className="panel__waypoint">
            Waypoint: {area.waypoint ? area.waypoint.where : 'none in this level'}
          </p>
          <DirectionGlyph turn={area.rules[0]?.turn ?? 'random'} size={128} />
          <ul className="panel__types">
            {areaMapTypes(area).map((key) => (
              <li key={key} className="panel__type-hint">
                <span className="panel__swatch" style={{ background: mapTypeColor(key) }} />
                {mapTypeLabel(key)}: {mapTypeHint(key)}
              </li>
            ))}
          </ul>

          <Section title="Features:" items={area.features} />
          <Section title="Entrance:" items={area.entrance} />
          <Section title={area.exit.length > 1 ? 'Exits:' : 'Exit:'} items={area.exit} />
          {area.notes && <Section title="Good to know:" items={area.notes} />}
          {area.variants && !area.example && (
            <Section
              title="The layouts:"
              items={area.variants.map((variant) => `${variant.label}: ${variant.detail}`)}
            />
          )}
          {area.rules.length > 0 && <Section title="Navigation:" items={describeRules(area.rules)} />}
          <p className="panel__source">
            <a
              href={`https://www.youtube.com/watch?v=J1EFUYGk4CA&t=${area.videoTime}s`}
              target="_blank"
              rel="noreferrer"
            >
              Watch this map in the video at {formatTime(area.videoTime)}
            </a>
          </p>
        </div>
      </aside>

      <section className="detail__main">
        <div className="detail__chart">
          <Flowchart act={act} selectedId={area.id} onSelect={onSelect} compact />
        </div>
        <div className="detail__example">
          {area.example ? (
            <figure className="example">
              <img
                className="example__image"
                src={area.example}
                alt={`Example layout of ${area.name}`}
                loading="lazy"
              />
              {area.variants && (
                <ul className="example__variants">
                  {area.variants.map((variant) => (
                    <li key={variant.label}>
                      <strong>{variant.label}</strong>: {variant.detail}
                    </li>
                  ))}
                </ul>
              )}
              <figcaption className="example__caption">
                Layout captured from the video. This level always generates the same way
                {area.variants ? ', in one of the shapes listed above' : ''}
                {area.mapType === 'alternating-fixed' ? ', and this is one of them' : ''}.
              </figcaption>
            </figure>
          ) : (
            <NavigationRule area={area} />
          )}
        </div>
      </section>
    </div>
  )
}

interface SectionProps {
  title: string
  items: string[]
}

function Section({ title, items }: SectionProps) {
  if (items.length === 0) return null
  return (
    <section className="panel__section">
      <h2 className="panel__section-title">{title}</h2>
      <ul className="panel__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

const TURN_TEXT: Record<string, string> = {
  'counter-clockwise': 'turn 90\u00b0 counter-clockwise',
  clockwise: 'turn 90\u00b0 clockwise',
  straight: 'go straight',
  fixed: 'same layout every time',
  alternating: 'one of a few fixed layouts',
  random: 'no reliable rule',
}

/**
 * Group rules by their starting point. Jail L1 is the reason this exists: the
 * exit to Jail L2 is straight from the entrance but counter-clockwise from the
 * waypoint, and a flat list reads like a contradiction.
 */
function describeRules(rules: Area['rules']): string[] {
  const entrance: string[] = []
  const waypoint: string[] = []
  for (const rule of rules) {
    const text = `${TURN_TEXT[rule.turn] ?? rule.turn}${rule.towards ? ` to ${rule.towards}` : ''}${rule.note ? ` (${rule.note})` : ''}`
    if (rule.from === 'waypoint') waypoint.push(text)
    else entrance.push(text)
  }
  const lines: string[] = []
  if (entrance.length > 0) lines.push(`From the entrance: ${entrance.join(', or ')}`)
  if (waypoint.length > 0) lines.push(`From the waypoint: ${waypoint.join(', or ')}`)
  return lines
}
