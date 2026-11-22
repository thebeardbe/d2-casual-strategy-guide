import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { AreaDetail } from './AreaDetail'
import { act1 } from '../data/act1'
import type { Area } from '../types'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function areaById(id: string): Area {
  const area = act1.areas.find((candidate) => candidate.id === id)
  if (!area) throw new Error(`Act I has no area "${id}"`)
  return area
}

function renderDetail(area: Area, onSelect = vi.fn(), onClose = vi.fn()) {
  const view = render(<AreaDetail act={act1} area={area} onSelect={onSelect} onClose={onClose} />)
  return { ...view, onSelect, onClose }
}

describe('AreaDetail', () => {
  it('renders the area name, map type and section headings', () => {
    renderDetail(areaById('jail-2'))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 2')
    expect(screen.getByText(/^Type: /)).toBeInTheDocument()
    expect(screen.getByText(/^Type: /)).toHaveTextContent('Straight')
    expect(screen.getByRole('heading', { name: 'Features:' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Entrance:' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Exit:' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Navigation:' })).toBeInTheDocument()
  })

  it('lists the navigation rules in prose', () => {
    renderDetail(areaById('jail-2'))

    expect(screen.getByText('From the entrance: go straight')).toBeInTheDocument()
  })

  it('appends a rule note in parentheses to the navigation prose', () => {
    const area = areaById('rogue-encampment')
    const rule = area.rules[0]
    expect(rule.note).toBe('Layout depends on which side the exit is on')
    renderDetail(area)

    const navigation = screen.getByRole('heading', { name: 'Navigation:' }).closest('section')
    expect(navigation).not.toBeNull()
    expect(
      within(navigation as HTMLElement).getByText(
        'From the entrance: one of a few fixed layouts (Layout depends on which side the exit is on)',
      ),
    ).toBeInTheDocument()
  })

  it('groups rules by starting point into one list item per starting point', () => {
    renderDetail(areaById('jail-1'))

    const navigation = screen.getByRole('heading', { name: 'Navigation:' }).closest('section')
    expect(navigation).not.toBeNull()
    const items = within(navigation as HTMLElement).getAllByRole('listitem')
    expect(items).toHaveLength(2)

    expect(items[0]).toHaveTextContent(/^From the entrance:/)
    expect(items[0]).toHaveTextContent('go straight to Jail L2')
    expect(items[1]).toHaveTextContent(/^From the waypoint:/)
    expect(items[1]).toHaveTextContent('turn 90\u00b0 clockwise to Barracks')
  })

  it('shows where the waypoint is when the area has one', () => {
    const area = areaById('jail-1')
    expect(area.waypoint).toBeDefined()
    renderDetail(area)

    expect(screen.getByText(`Waypoint: ${area.waypoint!.where}`)).toBeInTheDocument()
  })

  it('shows the waypoint only once when the calculator is present (Jail L1)', () => {
    const area = areaById('jail-1')
    expect(area.waypoint).toBeDefined()
    expect(area.rules).toHaveLength(4)
    const { container } = renderDetail(area)

    expect(screen.getByRole('heading', { name: 'Work out your exit' })).toBeInTheDocument()
    const occurrences = (container.textContent ?? '').match(/Waypoint:/g) ?? []
    expect(occurrences).toHaveLength(1)
  })

  it('says there is no waypoint for an area without one', () => {
    const area = areaById('blood-moor')
    expect(area.waypoint).toBeUndefined()
    renderDetail(area)

    expect(screen.getByText('Waypoint: none in this level')).toBeInTheDocument()
  })

  it('renders a straight-ahead direction glyph for an area that goes straight', () => {
    renderDetail(areaById('jail-2'))

    const glyph = screen.getByRole('img', { name: 'Straight ahead' })
    expect(glyph).toHaveAttribute('aria-label', 'Straight ahead')
  })

  it('renders a counter-clockwise direction glyph for a counter-clockwise area', () => {
    renderDetail(areaById('jail-1'))

    const glyph = screen.getByRole('img', { name: 'Turn counter-clockwise' })
    expect(glyph).toHaveAttribute('aria-label', 'Turn counter-clockwise')
  })

  it('does not add empty parentheses for a rule without a note', () => {
    const area = areaById('jail-2')
    expect(area.rules[0].note).toBeUndefined()
    renderDetail(area)

    const navigation = screen.getByRole('heading', { name: 'Navigation:' }).closest('section')
    expect(navigation).not.toBeNull()
    const text = navigation!.textContent ?? ''
    expect(text).toContain('go straight')
    expect(text).not.toMatch(/\(\s*\)/)
  })

  it('uses the plural "Exits:" heading when an area has several exits', () => {
    const area = areaById('cold-plains')
    expect(area.exit.length).toBeGreaterThan(1)
    renderDetail(area)

    expect(screen.getByRole('heading', { name: 'Exits:' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Exit:' })).toBeNull()
  })

  it('omits the Features section when the card lists no features', () => {
    const area = areaById('jail-1')
    expect(area.features).toHaveLength(0)
    renderDetail(area)

    expect(screen.queryByRole('heading', { name: 'Features:' })).toBeNull()
  })

  it('omits the Exit section when the card lists no exit', () => {
    const area = areaById('den-of-evil')
    expect(area.exit).toHaveLength(0)
    renderDetail(area)

    expect(screen.queryByRole('heading', { name: 'Exit:' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Exits:' })).toBeNull()
  })

  it('renders the example image when the area has one', () => {
    const area = areaById('cave-2')
    expect(area.example).toBeDefined()
    renderDetail(area)

    const image = screen.getByRole('img', { name: `Example layout of ${area.name}` })
    expect(image.tagName).toBe('IMG')
    expect(image).toHaveAttribute('src', area.example)
    expect(screen.queryByRole('heading', { name: 'How to navigate' })).toBeNull()
  })

  it('lists the fixed layouts under the example image when an area has both', () => {
    const area = areaById('monastery-gate-outer-cloister')
    expect(area.example).toBeDefined()
    expect(area.variants).toHaveLength(3)
    const { container } = renderDetail(area)

    expect(screen.getByRole('img', { name: `Example layout of ${area.name}` })).toBeInTheDocument()

    const variants = container.querySelectorAll('.example__variants li')
    expect(variants).toHaveLength(3)
    const text = [...variants].map((variant) => variant.textContent ?? '').join(' | ')
    expect(text).toContain('Barracks are upper-right')
    expect(text).toContain('Barracks are upper-left')
    expect(text).toContain('Barracks are lower-right')

    // With an image the layouts belong under it, not in a separate panel section.
    expect(screen.queryByRole('heading', { name: 'The layouts:' })).toBeNull()
  })

  it('renders a "The layouts:" section when an area has variants but no example', () => {
    // No Act I area currently has variants without an example, so drop the
    // example from one that does to exercise the fallback branch.
    const area = { ...areaById('monastery-gate-outer-cloister'), example: undefined }
    expect(area.example).toBeUndefined()
    renderDetail(area)

    const heading = screen.getByRole('heading', { name: 'The layouts:' })
    const section = heading.closest('section')
    expect(section).not.toBeNull()

    const items = within(section as HTMLElement).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Barracks are upper-right')
    expect(items[1]).toHaveTextContent('Barracks are upper-left')
    expect(items[2]).toHaveTextContent('Barracks are lower-right')
    expect(screen.queryByAltText(`Example layout of ${area.name}`)).toBeNull()
  })

  it('links every card to the video at its videoTime', () => {
    for (const area of act1.areas) {
      const { unmount } = renderDetail(area)
      const link = screen.getByRole('link', { name: /Watch this map in the video/ })
      expect(link.getAttribute('href'), `${area.id} video link`).toContain(`&t=${area.videoTime}s`)
      unmount()
    }
  })

  it('falls back to the navigation diagram when the area has no example', () => {
    const area = areaById('catacombs-3')
    expect(area.example).toBeUndefined()
    renderDetail(area)

    expect(screen.getByRole('heading', { name: 'How to navigate' })).toBeInTheDocument()
    expect(screen.queryByAltText(`Example layout of ${area.name}`)).toBeNull()
  })

  it('calls onClose from the close button', () => {
    const { onClose } = renderDetail(areaById('jail-2'))

    fireEvent.click(screen.getByRole('button', { name: 'Close and return to the chart' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect with the id of a chart node', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { onSelect } = renderDetail(areaById('jail-2'))

    fireEvent.click(screen.getByRole('button', { name: /^Cathedral/ }))

    expect(onSelect).toHaveBeenCalledWith('cathedral')
  })

  it('highlights the current area in the mini chart', () => {
    const { container } = renderDetail(areaById('jail-2'))

    expect(container.querySelectorAll('.node__ring')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /^Jail - Level 2/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
