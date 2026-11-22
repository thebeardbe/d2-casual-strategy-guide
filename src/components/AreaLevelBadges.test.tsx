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
