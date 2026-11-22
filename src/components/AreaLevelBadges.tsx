import type { Area, AreaLevels } from '../types'

interface AreaLevelBadgesProps {
  area: Pick<Area, 'areaLevels' | 'name'>
}

/** Hell area level that means every item can drop. */
const TOP_AREA_LEVEL = 85

const DIFFICULTIES = [
  { key: 'normal', label: 'Normal', tone: 'normal' },
  { key: 'nightmare', label: 'Nightmare', tone: 'nightmare' },
  { key: 'hell', label: 'Hell', tone: 'hell' },
] as const

/**
 * Area level (alvl) for each difficulty. In Nightmare and Hell ordinary monsters
 * are this level, champions sit about two above it and uniques three, which is
 * why the number matters for drops and experience.
 */
export function AreaLevelBadges({ area }: AreaLevelBadgesProps) {
  if (!area.areaLevels || area.areaLevels.length === 0) return null
  const grouped = area.areaLevels.length > 1

  return (
    <div className="levels">
      <p className="levels__title">Area level</p>
      <div className="levels__grid">
        <div className="levels__head">
          <span />
          {DIFFICULTIES.map((difficulty) => (
            <span key={difficulty.key} className="levels__column">
              {difficulty.label}
            </span>
          ))}
        </div>
        {area.areaLevels.map((entry) => (
          <div key={entry.label ?? 'single'} className="levels__row">
            <span className="levels__label">{grouped ? entry.label : ''}</span>
            {DIFFICULTIES.map((difficulty) => (
              <span
                key={difficulty.key}
                className={`levels__badge levels__badge--${difficulty.tone}`}
                title={tooltip(difficulty.label, difficulty.key, entry)}
              >
                {entry[difficulty.key]}
              </span>
            ))}
            {entry.hell >= TOP_AREA_LEVEL && (
              <span className="levels__top" title={topTooltip(entry)}>
                L85
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="levels__hint">
        Hover a badge for details. L85 marks an area level 85 zone, the top tier for drops.
      </p>
    </div>
  )
}

function topTooltip(entry: AreaLevels): string {
  const name = entry.label ? `${entry.label}: ` : ''
  return `${name}area level ${entry.hell} in Hell, the highest tier in the game, so every item can drop here. This is what people mean by a level 85 area.`
}

function tooltip(name: string, key: (typeof DIFFICULTIES)[number]['key'], entry: AreaLevels): string {
  const level = entry[key]
  if (key === 'normal') {
    return `${name}: area level ${level}. On Normal each monster keeps its own level, so this is the zone's reference level.`
  }
  return `${name}: area level ${level}. Ordinary monsters here are level ${level}, champions about ${level + 2} and uniques ${level + 3}.`
}
