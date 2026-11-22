import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Act, Area, MapTypeKey } from '../types'
import { areasInOrder, availableActs } from './acts'
import { act1 } from './act1'
import palette from './mapTypes.json'
import { FALLBACK_COLOR, areaFill, areaMapTypeLabel, areaMapTypes, mapTypeColor } from './mapTypes'

/**
 * Every file under public/examples, as a site-root-relative path. Vite's glob
 * only lists files that really exist on disk, so this doubles as an existence
 * check without pulling in Node's fs (which tsconfig.app does not type).
 */
const publicExampleFiles = new Set(
  Object.keys(import.meta.glob('/public/examples/*')).map((path) => path.replace(/^\/public/, '')),
)

const paletteTypes = (palette as { types: Record<string, unknown> }).types

/**
 * The progression order the chart promises for Act I: the necessary chain from
 * town to Andariel, with each stop's detours visited depth-first before the
 * walk moves on. Spelled out rather than derived so a regression in the walk
 * order is visible in the test.
 */
const ACT1_ORDER = [
  'rogue-encampment',
  'cow-level',
  'blood-moor',
  'den-of-evil',
  'cold-plains',
  'burial-ground',
  'mausoleum-crypt',
  'cave-1',
  'cave-2',
  'stony-field',
  'tristram',
  'underground-passage-1',
  'underground-passage-2',
  'dark-wood',
  'black-marsh',
  'hole-1',
  'hole-2',
  'forgotten-tower',
  'tower-cellar-1-4',
  'tower-cellar-5',
  'tamoe-highland',
  'pit-1',
  'pit-2',
  'monastery-gate-outer-cloister',
  'barracks',
  'jail-1',
  'jail-2',
  'jail-3',
  'inner-cloister',
  'cathedral',
  'catacombs-1',
  'catacombs-2',
  'catacombs-3',
  'catacombs-4',
]

const ACT1_NECESSARY_ORDER = [
  'rogue-encampment',
  'blood-moor',
  'cold-plains',
  'stony-field',
  'underground-passage-1',
  'dark-wood',
  'black-marsh',
  'tamoe-highland',
  'monastery-gate-outer-cloister',
  'barracks',
  'jail-1',
  'jail-2',
  'jail-3',
  'inner-cloister',
  'cathedral',
  'catacombs-1',
  'catacombs-2',
  'catacombs-3',
  'catacombs-4',
]

function areaIds(areas: Area[]): string[] {
  return areas.map((area) => area.id)
}

/**
 * Variable layouts must not carry a rendered example: one screenshot of a
 * generated arrangement would read as if that arrangement were guaranteed.
 */
const VARIABLE_MAP_TYPES = new Set<MapTypeKey>([
  'big-square',
  'big-rectangle',
  'counter-clockwise',
  'clockwise',
  'straight',
  'random',
])

/** The map types a rendered example is meaningful for. */
const EXAMPLE_MAP_TYPES = new Set<MapTypeKey>(['fixed', 'fixed-enough', 'alternating-fixed'])

describe('areasInOrder (Act I)', () => {
  it('starts at the town area, the only area with no incoming connector', () => {
    const towns = act1.areas.filter(
      (area) => !act1.connectors.some((connector) => connector.to === area.id),
    )
    expect(towns).toHaveLength(1)
    expect(towns[0].id).toBe('rogue-encampment')
    expect(areasInOrder(act1)[0].id).toBe(towns[0].id)
  })

  it('walks the necessary areas as one chain in connector order', () => {
    const necessary = areasInOrder(act1).filter((area) => !area.optional)
    expect(areaIds(necessary)).toEqual(ACT1_NECESSARY_ORDER)
  })

  it('returns the full Act I progression order', () => {
    expect(areaIds(areasInOrder(act1))).toEqual(ACT1_ORDER)
  })

  it('visits each stop detours depth-first before moving on', () => {
    const order = areasInOrder(act1)
    const index = new Map(order.map((area, position) => [area.id, position]))

    // The examples from the review: a single detour follows its stop directly,
    // and a detour chain stays together in connector order.
    expect(index.get('den-of-evil')).toBe(index.get('blood-moor')! + 1)
    expect(index.get('hole-1')).toBe(index.get('black-marsh')! + 1)
    expect(index.get('hole-2')).toBe(index.get('hole-1')! + 1)

    for (const connector of act1.connectors.filter((link) => !link.necessary)) {
      const from = index.get(connector.from)
      const to = index.get(connector.to)
      expect(from, `${connector.from} is in the order`).toBeDefined()
      expect(to, `${connector.to} is in the order`).toBeDefined()
      expect(to!, `${connector.to} comes after ${connector.from}`).toBeGreaterThan(from!)
    }

    // A detour that hangs off another detour follows it immediately: only a
    // necessary stop is allowed to sit between a parent detour and its child.
    for (const connector of act1.connectors.filter((link) => !link.necessary)) {
      const parent = act1.areas.find((area) => area.id === connector.from)
      expect(parent, `${connector.from} exists`).toBeDefined()
      if (!parent!.optional) continue
      expect(index.get(connector.to), `${connector.to} right after ${connector.from}`).toBe(
        index.get(connector.from)! + 1,
      )
    }
  })

  it('includes every area exactly once', () => {
    const order = areasInOrder(act1)
    expect(order).toHaveLength(act1.areas.length)
    expect(new Set(areaIds(order)).size).toBe(act1.areas.length)
    expect(areaIds(order).sort()).toEqual(areaIds(act1.areas).sort())
  })

  it('is stable across repeated calls', () => {
    const first = areaIds(areasInOrder(act1))
    expect(areaIds(areasInOrder(act1))).toEqual(first)
    expect(areaIds(areasInOrder(act1))).toEqual(first)
    expect(first).toEqual(ACT1_ORDER)
  })
})

describe('areasInOrder (generic)', () => {
  it('appends areas the walk misses in chart order', () => {
    const synthetic: Act = {
      number: 1,
      roman: 'I',
      title: 'Synthetic act',
      areas: [
        makeSyntheticArea('town', 0, 0),
        makeSyntheticArea('next', 0, 1),
        makeSyntheticArea('far-right', 1, 3, true),
        makeSyntheticArea('middle', 2, 1, true),
        makeSyntheticArea('left', 1, 0, true),
      ],
      connectors: [{ from: 'town', to: 'next', necessary: true }],
    }

    // The three optional areas are unreachable, so they are leftovers sorted by
    // column first and then row.
    expect(areaIds(areasInOrder(synthetic))).toEqual(['town', 'next', 'left', 'middle', 'far-right'])
  })
})

function makeSyntheticArea(id: string, row: number, column: number, optional = false): Area {
  return {
    id,
    name: id,
    label: id,
    act: 1,
    mapType: 'fixed',
    row,
    column,
    optional,
    features: ['feature'],
    entrance: ['entrance'],
    exit: ['exit'],
    rules: [{ turn: 'fixed' }],
    videoTime: 600,
  }
}

describe('Barracks hybrid map type', () => {
  const barracks = act1.areas.find((area) => area.id === 'barracks')!

  it('has two map type keys', () => {
    expect(areaMapTypes(barracks)).toHaveLength(2)
    expect(areaMapTypes(barracks)).toEqual(['counter-clockwise', 'straight'])
  })

  it('fills with a gradient built from both palette colours', () => {
    const fill = areaFill(barracks)
    expect(fill.solid).toBeUndefined()
    expect(fill.gradient).toEqual([
      mapTypeColor('counter-clockwise'),
      mapTypeColor('straight'),
    ])
    expect(fill.id).toBe('fill-barracks')
  })
})

/** Walk the graph from the town area. */
function reachableFrom(act: Act, onlyNecessary: boolean): { reached: Set<string>; town: Area } {
  const town = act.areas.find((area) => area.row === 1 && area.column === 0)
  if (!town) throw new Error(`Act ${act.number} has no town area at row 1, column 0`)

  const outgoing = new Map<string, string[]>()
  for (const connector of act.connectors) {
    if (onlyNecessary && !connector.necessary) continue
    const list = outgoing.get(connector.from) ?? []
    list.push(connector.to)
    outgoing.set(connector.from, list)
  }

  const reached = new Set<string>([town.id])
  const queue = [town.id]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const next of outgoing.get(current) ?? []) {
      if (reached.has(next)) continue
      reached.add(next)
      queue.push(next)
    }
  }
  return { reached, town }
}

for (const act of availableActs) {
  const actLabel = `Act ${act.number} (${act.roman})`
  const ids = act.areas.map((area) => area.id)

  describe(`${actLabel} areas`, () => {
    it('has at least one area', () => {
      expect(act.areas.length).toBeGreaterThan(0)
    })

    it('uses unique area ids', () => {
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('gives every area non-empty required text fields', () => {
      for (const area of act.areas) {
        expect(area.name.trim(), `${area.id} name`).not.toBe('')
        expect(area.label.trim(), `${area.id} label`).not.toBe('')
        expect(area.entrance.length, `${area.id} entrance`).toBeGreaterThan(0)
        expect(area.rules.length, `${area.id} rules`).toBeGreaterThan(0)
        expect(Number.isInteger(area.videoTime), `${area.id} videoTime is an integer`).toBe(true)
        expect(area.videoTime, `${area.id} videoTime is positive`).toBeGreaterThan(0)

        // The video's own cards list no features or no exit for some levels
        // (Jail L1 lists only a waypoint, Den of Evil has no exit), so both
        // arrays may be empty. Any entry they do carry must still have text.
        for (const feature of area.features) expect(feature.trim(), `${area.id} feature`).not.toBe('')
        for (const entrance of area.entrance) expect(entrance.trim(), `${area.id} entrance`).not.toBe('')
        for (const exit of area.exit) expect(exit.trim(), `${area.id} exit`).not.toBe('')
        for (const rule of area.rules) expect(rule.turn).toBeTruthy()
      }
    })

    it('keeps every area in the act it is listed in', () => {
      for (const area of act.areas) {
        expect(area.act, `${area.id} act`).toBe(act.number)
      }
    })

    it('keeps rows in 0..2 and columns finite', () => {
      for (const area of act.areas) {
        expect([0, 1, 2], `${area.id} row`).toContain(area.row)
        expect(Number.isFinite(area.column), `${area.id} column`).toBe(true)
        expect(area.column, `${area.id} column`).toBeGreaterThanOrEqual(0)
      }
    })

    it('never puts two areas on the same grid cell', () => {
      const cells = act.areas.map((area) => `${area.row}@${area.column}`)
      expect(new Set(cells).size).toBe(cells.length)
    })

    it('keeps chart labels to at most three explicit lines', () => {
      for (const area of act.areas) {
        expect(area.label.split('\n').length, `${area.id} label ${JSON.stringify(area.label)}`).toBeLessThanOrEqual(3)
      }
    })
  })

  describe(`${actLabel} connectors`, () => {
    it('only connects areas that exist', () => {
      const known = new Set(ids)
      for (const connector of act.connectors) {
        expect(known.has(connector.from), `from ${connector.from}`).toBe(true)
        expect(known.has(connector.to), `to ${connector.to}`).toBe(true)
      }
    })

    it('has no duplicate and no self connectors', () => {
      const seen = new Set<string>()
      for (const connector of act.connectors) {
        expect(connector.from, `self connector ${connector.from}`).not.toBe(connector.to)
        const key = `${connector.from}->${connector.to}`
        expect(seen.has(key), `duplicate connector ${key}`).toBe(false)
        seen.add(key)
      }
    })

    it('reaches every necessary area from town along necessary connectors only', () => {
      const { reached } = reachableFrom(act, true)
      const necessaryAreas = act.areas.filter((area) => !area.optional).map((area) => area.id)
      expect([...reached].sort()).toEqual([...necessaryAreas].sort())
    })

    it('marks exactly the areas that are not on the necessary path as optional', () => {
      const { reached } = reachableFrom(act, true)
      const optionalAreas = act.areas.filter((area) => area.optional).map((area) => area.id)
      const offPath = act.areas.filter((area) => !reached.has(area.id)).map((area) => area.id)
      expect([...offPath].sort()).toEqual([...optionalAreas].sort())
      expect(optionalAreas.length).toBeGreaterThan(0)
    })

    it('walks the necessary areas as a single chain from town', () => {
      const { reached, town } = reachableFrom(act, true)
      const necessary = act.connectors.filter((connector) => connector.necessary)
      const incoming = new Map<string, number>()
      const outgoing = new Map<string, number>()
      for (const connector of necessary) {
        incoming.set(connector.to, (incoming.get(connector.to) ?? 0) + 1)
        outgoing.set(connector.from, (outgoing.get(connector.from) ?? 0) + 1)
        expect(reached.has(connector.from), `${connector.from} is off the necessary path`).toBe(true)
        expect(reached.has(connector.to), `${connector.to} is off the necessary path`).toBe(true)
      }
      for (const id of reached) {
        if (id === town.id) {
          expect(incoming.get(id) ?? 0, `${id} should not be entered on the necessary path`).toBe(0)
        } else {
          expect(incoming.get(id), `${id} incoming necessary connectors`).toBe(1)
        }
      }
      const endpoints = [...reached].filter((id) => (outgoing.get(id) ?? 0) === 0)
      expect(endpoints).toHaveLength(1)
      for (const id of reached) {
        if (id === endpoints[0]) continue
        expect(outgoing.get(id), `${id} outgoing necessary connectors`).toBe(1)
      }
    })

    it('leaves no area unreachable when optional detours are allowed', () => {
      const { reached } = reachableFrom(act, false)
      // Optional detours may hang off other optional areas, but the full graph
      // must still cover every area that the act lists.
      for (const area of act.areas) {
        expect(reached.has(area.id), `${area.id} is unreachable from town`).toBe(true)
      }
    })
  })

  describe(`${actLabel} map types`, () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('only uses map type keys that exist in mapTypes.json', () => {
      for (const area of act.areas) {
        for (const key of areaMapTypes(area)) {
          expect(paletteTypes, `${area.id} mapType "${key}"`).toHaveProperty(key)
        }
      }
    })

    it('never falls back to the grey placeholder when labelling or filling an area', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      for (const area of act.areas) {
        const expectedLabel = areaMapTypes(area)
          .map((key) => (paletteTypes[key] as { label: string }).label)
          .join(' + ')
        expect(areaMapTypeLabel(area), `${area.id} label`).toBe(expectedLabel)
        const fill = areaFill(area)
        const colours = fill.gradient ?? [fill.solid]
        for (const colour of colours) {
          expect(colour, `${area.id} fill`).toBeTruthy()
          expect(colour, `${area.id} fill fell back to grey`).not.toBe(FALLBACK_COLOR)
        }
      }
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe(`${actLabel} example images`, () => {
    it('points every example at an existing .webp under public/examples', () => {
      for (const area of act.areas) {
        if (!area.example) continue
        expect(area.example.startsWith('/examples/'), `${area.id} example prefix`).toBe(true)
        expect(area.example.endsWith('.webp'), `${area.id} example extension`).toBe(true)
        expect(publicExampleFiles.has(area.example), `${area.id} example ${area.example}`).toBe(true)
      }
    })

    it('does not reuse the same example image for two areas', () => {
      const examples = act.areas.flatMap((area) => (area.example ? [area.example] : []))
      expect(new Set(examples).size).toBe(examples.length)
    })

    it('never gives a variable layout an example picture', () => {
      for (const area of act.areas) {
        const variableTypes = areaMapTypes(area).filter((key) => VARIABLE_MAP_TYPES.has(key))
        if (variableTypes.length === 0) continue
        expect(
          area.example,
          `${area.id} is ${variableTypes.join(' + ')}, so it must not have an example`,
        ).toBeUndefined()
      }
    })

    it('only gives an example picture to a fixed, fixed-enough or alternating-fixed area', () => {
      const withExample = act.areas.filter((area) => area.example)
      expect(withExample.length, 'at least one area keeps an example').toBeGreaterThan(0)
      for (const area of withExample) {
        for (const key of areaMapTypes(area)) {
          expect(EXAMPLE_MAP_TYPES.has(key), `${area.id} has an example but is ${key}`).toBe(true)
        }
      }
    })
  })

  describe(`${actLabel} layout variants`, () => {
    it('lists at least two fully described layouts when an area carries variants', () => {
      const withVariants = act.areas.filter((area) => area.variants)
      expect(withVariants.length, 'at least one area carries variants').toBeGreaterThan(0)

      for (const area of withVariants) {
        expect(area.variants!.length, `${area.id} variant count`).toBeGreaterThanOrEqual(2)
        for (const variant of area.variants!) {
          expect(variant.label.trim(), `${area.id} variant label`).not.toBe('')
          expect(variant.detail.trim(), `${area.id} variant detail`).not.toBe('')
        }
      }
    })
  })
}
