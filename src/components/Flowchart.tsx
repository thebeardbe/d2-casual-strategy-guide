import type { Act, Area } from '../types'
import { areaFill, areaMapTypeLabel, mapTypeColor, paletteOrder, mapTypeLabel } from '../data/mapTypes'
import { arrowBetween, chartSize, nodeRect } from '../lib/layout'
import { wrapLabel } from '../lib/label'

interface FlowchartProps {
  act: Act
  selectedId?: string
  onSelect?: (areaId: string) => void
  /** Compact hides the act heading and the legend, for the detail view. */
  compact?: boolean
}

const LABEL_FONT_SIZE = 15
const LABEL_LINE_HEIGHT = 17

/** Chart labels come from the data with explicit line breaks. */
function labelLines(area: Area): string[] {
  return area.label.includes('\n') ? area.label.split('\n') : wrapLabel(area.label)
}

export function Flowchart({ act, selectedId, onSelect, compact = false }: FlowchartProps) {
  const { width, height } = chartSize(act.areas)
  const byId = new Map(act.areas.map((area) => [area.id, area]))
  const interactive = Boolean(onSelect)

  return (
    <div className={compact ? 'chart chart--compact' : 'chart'}>
      {!compact && (
        <h1 className="chart__heading">
          Act <span className="chart__numeral">{act.roman}</span>
        </h1>
      )}
      <svg
        className="chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={`Act ${act.roman} map chart`}
      >
        <defs>
          {act.areas.map((area) => {
            const fill = areaFill(area)
            if (!fill.gradient) return null
            return (
              <linearGradient key={fill.id} id={fill.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fill.gradient[0]} />
                <stop offset="100%" stopColor={fill.gradient[1]} />
              </linearGradient>
            )
          })}
        </defs>

        <g className="chart__arrows">
          {act.connectors.map((connector) => {
            const from = byId.get(connector.from)
            const to = byId.get(connector.to)
            if (!from || !to) {
              console.warn(`Connector ${connector.from} -> ${connector.to} references an unknown area.`)
              return null
            }
            const arrow = arrowBetween(from, to)
            if (!arrow) {
              console.warn(`Connector ${connector.from} -> ${connector.to} is not axis-aligned.`)
              return null
            }
            return (
              <polygon
                key={`${connector.from}-${connector.to}`}
                className={connector.necessary ? 'arrow arrow--necessary' : 'arrow arrow--optional'}
                points={arrow.points}
                aria-hidden="true"
              />
            )
          })}
        </g>

        <g className="chart__nodes">
          {act.areas.map((area) => (
            <ChartNode
              key={area.id}
              area={area}
              selected={area.id === selectedId}
              interactive={interactive}
              onSelect={onSelect}
            />
          ))}
        </g>
      </svg>
      {!compact && <Legend act={act} />}
    </div>
  )
}

interface ChartNodeProps {
  area: Area
  selected: boolean
  interactive: boolean
  onSelect?: (areaId: string) => void
}

function ChartNode({ area, selected, interactive, onSelect }: ChartNodeProps) {
  const rect = nodeRect(area)
  const fill = areaFill(area)
  const lines = labelLines(area)
  const centreX = rect.x + rect.width / 2
  const firstLineY = rect.y + rect.height / 2 - ((lines.length - 1) * LABEL_LINE_HEIGHT) / 2
  const description = `${area.name}, ${areaMapTypeLabel(area)}`

  const activate = () => onSelect?.(area.id)
  const onKeyDown = (event: React.KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  return (
    <g
      className={[
        'node',
        selected ? 'node--selected' : '',
        interactive ? 'node--interactive' : '',
      ].join(' ')}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={description}
      aria-pressed={interactive ? selected : undefined}
      onClick={interactive ? activate : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      <rect
        className="node__box"
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        rx={7}
        fill={fill.gradient ? `url(#${fill.id})` : fill.solid}
      />
      {selected && (
        <rect
          className="node__ring"
          x={rect.x - 4}
          y={rect.y - 4}
          width={rect.width + 8}
          height={rect.height + 8}
          rx={10}
        />
      )}
      <text className="node__label" x={centreX} y={firstLineY + LABEL_FONT_SIZE} textAnchor="middle">
        {lines.map((line, index) => (
          <tspan key={line} x={centreX} dy={index === 0 ? 0 : LABEL_LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

/** Only the map types that actually appear in this act, so the key stays short. */
function Legend({ act }: { act: Act }) {
  const used = new Set(act.areas.flatMap((area) => (Array.isArray(area.mapType) ? area.mapType : [area.mapType])))
  const ordered = paletteOrder().filter((key) => used.has(key))
  return (
    <ul className="legend">
      {ordered.map((key) => (
        <li key={key} className="legend__item" title={mapTypeLabel(key)}>
          <span className="legend__swatch" style={{ background: mapTypeColor(key) }} />
          {mapTypeLabel(key)}
        </li>
      ))}
      <li className="legend__item legend__item--arrows">
        <span className="legend__arrow legend__arrow--necessary" /> necessary
        <span className="legend__arrow legend__arrow--optional" /> optional
      </li>
    </ul>
  )
}
