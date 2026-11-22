import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { TurnCalculator } from './TurnCalculator'
import { AreaDetail } from './AreaDetail'
import { act1 } from '../data/act1'
import type { Area } from '../types'

afterEach(cleanup)

function areaById(id: string): Area {
  const area = act1.areas.find((candidate) => candidate.id === id)
  if (!area) throw new Error(`Act I has no area "${id}"`)
  return area
}

function makeArea(overrides: Partial<Area> = {}): Area {
  return {
    id: 'synthetic',
    name: 'Synthetic Area',
    label: 'Synthetic',
    act: 1,
    mapType: 'straight',
    row: 0,
    column: 0,
    features: [],
    entrance: [],
    exit: [],
    rules: [{ turn: 'straight' }],
    videoTime: 0,
    ...overrides,
  }
}

function ruleButtons(): HTMLElement[] {
  return within(screen.getByRole('group', { name: 'Which exit' })).getAllByRole('button')
}

function directionButtons(): HTMLElement[] {
  return within(screen.getByRole('group', { name: 'Entrance hallway direction' })).getAllByRole('button')
}

function pickDirection(name: string): void {
  fireEvent.click(within(screen.getByRole('group', { name: 'Entrance hallway direction' })).getByRole('button', { name }))
}

function answer(): HTMLElement {
  return screen.getByText(/Entrance runs/)
}

describe('TurnCalculator for a single straight rule (Jail L2)', () => {
  it('renders the four direction buttons and no rule selector', () => {
    render(<TurnCalculator area={areaById('jail-2')} />)

    expect(screen.getByRole('heading', { name: 'Work out your exit' })).toBeInTheDocument()
    expect(directionButtons().map((button) => button.textContent)).toEqual(['NE', 'NW', 'SW', 'SE'])
    expect(screen.queryByRole('group', { name: 'Which exit' })).not.toBeInTheDocument()
  })

  it('answers that a south-east entrance exits south-east', () => {
    render(<TurnCalculator area={areaById('jail-2')} />)

    expect(screen.getByText('Pick your entrance direction:')).toBeInTheDocument()
    pickDirection('SE')

    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(answer()).toHaveTextContent('The exit runs south-east (down-right)')
  })
})

describe('TurnCalculator for several rules (Jail L1)', () => {
  it('renders one selector button per directional rule', () => {
    render(<TurnCalculator area={areaById('jail-1')} />)

    expect(ruleButtons()).toHaveLength(4)
    expect(ruleButtons().map((button) => button.textContent)).toEqual([
      'the waypoint',
      'Jail L2 (from the entrance)',
      'Jail L2 (from the waypoint)',
      'Barracks (from the waypoint)',
    ])
  })

  it('distinguishes the two Jail L2 rules by their starting point', () => {
    render(<TurnCalculator area={areaById('jail-1')} />)

    expect(screen.getByRole('button', { name: 'Jail L2 (from the entrance)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' })).toBeInTheDocument()
  })

  it('answers north-east for the Jail L2 waypoint rule and a south-east entrance', () => {
    render(<TurnCalculator area={areaById('jail-1')} />)

    fireEvent.click(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' }))
    pickDirection('SE')

    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(answer()).toHaveTextContent('The exit runs north-east (up-right)')
    expect(screen.getByText(/turn 90\u00b0 counter-clockwise \(left\) from there:/)).toBeInTheDocument()
  })

  it('marks the chosen rule with aria-pressed', () => {
    render(<TurnCalculator area={areaById('jail-1')} />)

    expect(screen.getByRole('button', { name: 'the waypoint' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' }))

    expect(screen.getByRole('button', { name: 'the waypoint' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

describe('TurnCalculator counter-clockwise mapping (Tower Cellar - Levels 1-4)', () => {
  it('maps every entrance direction a quarter turn to the left', () => {
    const cases: [string, string][] = [
      ['SE', 'north-east (up-right)'],
      ['NE', 'north-west (up-left)'],
      ['NW', 'south-west (down-left)'],
      ['SW', 'south-east (down-right)'],
    ]

    render(<TurnCalculator area={areaById('tower-cellar-1-4')} />)
    expect(screen.queryByRole('group', { name: 'Which exit' })).not.toBeInTheDocument()

    for (const [entrance, exit] of cases) {
      pickDirection(entrance)
      expect(answer()).toHaveTextContent(`Entrance runs ${labelFor(entrance)}`)
      expect(answer()).toHaveTextContent(`The exit runs ${exit}`)
    }
  })
})

describe('TurnCalculator interaction state', () => {
  it('keeps aria-pressed on the selected direction only', () => {
    render(<TurnCalculator area={areaById('tower-cellar-1-4')} />)

    for (const button of directionButtons()) {
      expect(button).toHaveAttribute('aria-pressed', 'false')
    }

    pickDirection('NW')

    for (const button of directionButtons()) {
      expect(button).toHaveAttribute('aria-pressed', button.textContent === 'NW' ? 'true' : 'false')
    }
  })

  it('names the entrance and exit directions in the SVG accessible name once chosen', () => {
    render(<TurnCalculator area={areaById('tower-cellar-1-4')} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAccessibleName('Work out the exit direction for Tower Cellar - Levels 1-4')

    pickDirection('NW')

    expect(svg).toHaveAccessibleName(/entrance runs north-west/i)
    expect(svg).toHaveAccessibleName(/exit runs south-west/i)
  })

  it('resets the chosen direction when AreaDetail navigates to another area', () => {
    const { rerender } = render(
      <AreaDetail act={act1} area={areaById('jail-1')} onSelect={() => {}} onClose={() => {}} />,
    )

    pickDirection('SE')
    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(directionButtons().filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1)

    rerender(
      <AreaDetail act={act1} area={areaById('tower-cellar-1-4')} onSelect={() => {}} onClose={() => {}} />,
    )

    expect(screen.getByText('Pick your entrance direction:')).toBeInTheDocument()
    for (const button of directionButtons()) {
      expect(button).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('TurnCalculator when it cannot give an answer', () => {
  it('renders nothing for a random area (Catacombs - Level 3)', () => {
    const { container } = render(<TurnCalculator area={areaById('catacombs-3')} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for an area with only non-directional rules', () => {
    const area = makeArea({
      rules: [{ turn: 'fixed' }, { turn: 'alternating' }, { turn: 'random' }],
    })
    const { container } = render(<TurnCalculator area={area} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for an area with no rules at all', () => {
    const { container } = render(<TurnCalculator area={makeArea({ rules: [] })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a fixed area with a waypoint (Inner Cloister)', () => {
    const area = areaById('inner-cloister')
    expect(area.waypoint).toBeDefined()
    const { container } = render(<TurnCalculator area={area} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('TurnCalculator waypoint line', () => {
  it('omits the waypoint line when the area has no waypoint', () => {
    render(<TurnCalculator area={areaById('jail-2')} />)

    expect(screen.queryByText(/^Waypoint: /)).not.toBeInTheDocument()
  })
})

function labelFor(short: string): string {
  const labels: Record<string, string> = {
    NE: 'north-east (up-right)',
    NW: 'north-west (up-left)',
    SW: 'south-west (down-left)',
    SE: 'south-east (down-right)',
  }
  const label = labels[short]
  if (!label) throw new Error(`Unknown direction ${short}`)
  return label
}
