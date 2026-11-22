import type { Act, Area, Connector } from '../types'
import { act1 } from './act1'
import { act2 } from './act2'
import { act3 } from './act3'
import { act4 } from './act4'

/**
 * Acts that are built so far. The tab bar always shows all five; the rest stay
 * disabled until their data lands, so the plan is visible from the UI.
 */
export const availableActs: Act[] = [act1, act2, act3, act4]

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'] as const

export function findAct(number: number): Act | undefined {
  return availableActs.find((act) => act.number === number)
}

export function findArea(act: Act, areaId: string | undefined) {
  if (!areaId) return undefined
  return act.areas.find((area) => area.id === areaId)
}

/**
 * Progression order for the previous/next buttons: walk the necessary path from
 * town, visiting each stop's optional detours before moving on. Any area the
 * walk misses is appended in chart order, so nothing becomes unreachable.
 */
export function areasInOrder(act: Act): Area[] {
  const byId = new Map(act.areas.map((area) => [area.id, area]))
  const children = new Map<string, Connector[]>()
  for (const connector of act.connectors) {
    const list = children.get(connector.from) ?? []
    list.push(connector)
    children.set(connector.from, list)
  }

  const ordered: Area[] = []
  const seen = new Set<string>()

  const visitDetours = (fromId: string) => {
    for (const connector of children.get(fromId) ?? []) {
      if (connector.necessary || seen.has(connector.to)) continue
      const child = byId.get(connector.to)
      if (!child) continue
      seen.add(child.id)
      ordered.push(child)
      visitDetours(child.id)
    }
  }

  const town = act.areas.find((area) => !act.connectors.some((link) => link.to === area.id))
  let current: Area | undefined = town
  while (current) {
    seen.add(current.id)
    ordered.push(current)
    visitDetours(current.id)
    const next = (children.get(current.id) ?? []).find((link) => link.necessary && !seen.has(link.to))
    current = next ? byId.get(next.to) : undefined
  }

  const leftovers = [...act.areas]
    .filter((area) => !seen.has(area.id))
    .sort((a, b) => a.column - b.column || a.row - b.row)
  return [...ordered, ...leftovers]
}
