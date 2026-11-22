import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { AreaLevelBadges } from './AreaLevelBadges'
import { act1 } from '../data/act1'
import type { Area } from '../types'

afterEach(cleanup)

function areaById(id: string): Area {
  const area = act1.areas.find((candidate) => candidate.id === id)
  if (!area) throw new Error(`Act I has no area "${id}"`)
  return area
}

function badges(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.levels__badge'))
}

describe('AreaLevelBadges for a single area (Cathedral)', () => {
  it('renders the section title and the three difficulty column headers', () => {
    const { container } = render(<AreaLevelBadges area={areaById('cathedral')} />)

    expect(screen.getByText('Area level')).toBeInTheDocument()
    const head = container.querySelector('.levels__head')
    expect(head).not.toBeNull()
    expect(head!.textContent).toBe('NormalNightmareHell')
  })

  it('renders one badge per difficulty with Cathedral values 11 / 42 / 72', () => {
    const { container } = render(<AreaLevelBadges area={areaById('cathedral')} />)

    expect(badges(container).map((badge) => badge.textContent)).toEqual(['11', '42', '72'])
  })

  it('explains each difficulty in the badge tooltip', () => {
    const { container } = render(<AreaLevelBadges area={areaById('cathedral')} />)
    const [normal, nightmare, hell] = badges(container)

    expect(normal.getAttribute('title')).toBe(
      "Normal: area level 11. On Normal each monster keeps its own level, so this is the zone's reference level.",
    )
    expect(nightmare.getAttribute('title')).toBe(
      'Nightmare: area level 42. Ordinary monsters here are level 42, champions about 44 and uniques 45.',
    )
    expect(hell.getAttribute('title')).toBe(
      'Hell: area level 72. Ordinary monsters here are level 72, champions about 74 and uniques 75.',
    )
  })

  it('leaves the single row unlabelled because there is nothing to disambiguate', () => {
    const { container } = render(<AreaLevelBadges area={areaById('cathedral')} />)

    const rows = container.querySelectorAll('.levels__row')
    expect(rows).toHaveLength(1)
    expect(rows[0].querySelector('.levels__label')!.textContent).toBe('')
  })
})

describe('AreaLevelBadges for grouped areas (Mausoleum & Crypt)', () => {
  it('renders one labelled row per area', () => {
    const { container } = render(<AreaLevelBadges area={areaById('mausoleum-crypt')} />)

    const rows = Array.from(container.querySelectorAll('.levels__row'))
    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.querySelector('.levels__label')!.textContent)).toEqual([
      'Mausoleum',
      'Crypt',
    ])
    expect(screen.getByText('Mausoleum')).toBeInTheDocument()
    expect(screen.getByText('Crypt')).toBeInTheDocument()
  })

  it('shows the different Hell area levels 85 and 83 down the Hell column', () => {
    const { container } = render(<AreaLevelBadges area={areaById('mausoleum-crypt')} />)

    const rows = Array.from(container.querySelectorAll('.levels__row'))
    const hellLevels = rows.map(
      (row) => row.querySelectorAll<HTMLElement>('.levels__badge')[2].textContent,
    )
    expect(hellLevels).toEqual(['85', '83'])
  })

  it('gives every badge a tooltip naming its own difficulty and level', () => {
    const { container } = render(<AreaLevelBadges area={areaById('mausoleum-crypt')} />)

    const all = badges(container)
    expect(all).toHaveLength(6)
    expect(all.every((badge) => (badge.getAttribute('title') ?? '').length > 0)).toBe(true)

    const rows = Array.from(container.querySelectorAll('.levels__row'))
    const mausoleumHell = rows[0].querySelectorAll<HTMLElement>('.levels__badge')[2]
    const cryptHell = rows[1].querySelectorAll<HTMLElement>('.levels__badge')[2]
    expect(mausoleumHell.getAttribute('title')).toContain('Hell: area level 85')
    expect(cryptHell.getAttribute('title')).toContain('Hell: area level 83')
  })
})

describe('AreaLevelBadges when an area has none', () => {
  it('renders no "Area level" section for Rogue Encampment', () => {
    const { container } = render(<AreaLevelBadges area={areaById('rogue-encampment')} />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText('Area level')).not.toBeInTheDocument()
  })

  it('renders no section for Forgotten Tower either', () => {
    const { container } = render(<AreaLevelBadges area={areaById('forgotten-tower')} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders no section for an explicitly empty level list', () => {
    const area = { name: 'Synthetic Area', areaLevels: [] }
    const { container } = render(<AreaLevelBadges area={area} />)

    expect(container).toBeEmptyDOMElement()
  })
})

function topChips(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.levels__top'))
}

describe('AreaLevelBadges L85 marker', () => {
  it('marks The Pit L1, whose Hell area level is 85', () => {
    const { container } = render(<AreaLevelBadges area={areaById('pit-1')} />)

    const chips = topChips(container)
    expect(chips).toHaveLength(1)
    expect(chips[0].textContent).toBe('L85')
  })

  it('does not mark Cathedral, whose Hell area level is 72', () => {
    const { container } = render(<AreaLevelBadges area={areaById('cathedral')} />)

    expect(topChips(container)).toHaveLength(0)
  })

  it('marks Underground Passage L2 and The Pit L2 as well', () => {
    for (const id of ['underground-passage-2', 'pit-2']) {
      const { container, unmount } = render(<AreaLevelBadges area={areaById(id)} />)
      const chips = topChips(container)
      expect(chips, id).toHaveLength(1)
      expect(chips[0].textContent, id).toBe('L85')
      unmount()
    }
  })

  it('marks only the Mausoleum row, not the Crypt row (Hell 85 vs 83)', () => {
    const { container } = render(<AreaLevelBadges area={areaById('mausoleum-crypt')} />)

    const chips = topChips(container)
    expect(chips).toHaveLength(1)

    const rows = Array.from(container.querySelectorAll<HTMLElement>('.levels__row'))
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelector('.levels__label')!.textContent).toBe('Mausoleum')
    expect(rows[1].querySelector('.levels__label')!.textContent).toBe('Crypt')

    expect(rows[0].querySelectorAll('.levels__top')).toHaveLength(1)
    expect(rows[0].querySelector('.levels__top')!.textContent).toBe('L85')
    expect(rows[1].querySelectorAll('.levels__top')).toHaveLength(0)
  })

  it('explains in the chip tooltip that 85 is the highest area level and every item can drop', () => {
    const { container } = render(<AreaLevelBadges area={areaById('pit-1')} />)

    const title = topChips(container)[0].getAttribute('title') ?? ''
    expect(title).toContain('85')
    expect(title).toMatch(/highest/i)
    expect(title).toMatch(/every item/i)
  })

  it('mentions the L85 marker in the hint line under the grid', () => {
    const { container } = render(<AreaLevelBadges area={areaById('pit-1')} />)

    const hint = container.querySelector('.levels__hint')
    expect(hint).not.toBeNull()
    expect(hint!.textContent).toContain('L85')
  })
})

describe('AreaLevelBadges L85 threshold', () => {
  function synthetic(levels: { label?: string; hell: number }[]) {
    return {
      name: 'Synthetic Area',
      areaLevels: levels.map((entry) => ({
        label: entry.label,
        normal: 1,
        nightmare: 40,
        hell: entry.hell,
      })),
    }
  }

  it('marks a Hell level just above the threshold, not only exactly 85', () => {
    const { container } = render(<AreaLevelBadges area={synthetic([{ hell: 86 }])} />)

    expect(topChips(container)).toHaveLength(1)
  })

  it('leaves a Hell level just below the threshold unmarked', () => {
    const { container } = render(<AreaLevelBadges area={synthetic([{ hell: 84 }])} />)

    expect(topChips(container)).toHaveLength(0)
  })

  it('flags only the qualifying row on a multi-row card', () => {
    const { container } = render(
      <AreaLevelBadges
        area={synthetic([
          { label: 'Low', hell: 84 },
          { label: 'High', hell: 99 },
        ])}
      />,
    )

    const rows = Array.from(container.querySelectorAll<HTMLElement>('.levels__row'))
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('.levels__top')).toHaveLength(0)
    expect(rows[1].querySelectorAll('.levels__top')).toHaveLength(1)
  })
})
