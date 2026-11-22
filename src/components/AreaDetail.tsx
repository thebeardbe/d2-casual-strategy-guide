import type { Act, Area } from '../types'
import { areaFill, areaMapTypeLabel, areaMapTypes, mapTypeColor, mapTypeHint, mapTypeLabel } from '../data/mapTypes'
import { Flowchart } from './Flowchart'
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
          {area.rules.length > 0 && (
            <Section
              title="Navigation:"
              items={area.rules.map((rule) => describeRule(rule))}
            />
          )}
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
              <figcaption className="example__caption">
                Example layout captured from the video. Layouts are randomised, so this is one
                possible version, and some levels change size with difficulty.
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

function describeRule(rule: Area['rules'][number]): string {
  const turns: Record<string, string> = {
    'counter-clockwise': 'turn 90\u00b0 counter-clockwise',
    clockwise: 'turn 90\u00b0 clockwise',
    straight: 'go straight',
    fixed: 'same layout every time',
    alternating: 'one of a few fixed layouts',
    random: 'no reliable rule',
  }
  const parts = [turns[rule.turn] ?? rule.turn]
  if (rule.towards) parts.push(`towards ${rule.towards}`)
  if (rule.from) parts.push(`from the ${rule.from}`)
  if (rule.note) parts.push(`(${rule.note})`)
  return parts.join(' ')
}
