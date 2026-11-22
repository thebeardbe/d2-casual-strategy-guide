import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { TurnCalculator } from './TurnCalculator'
import { AreaDetail } from './AreaDetail'
import { act1 } from '../data/act1'
import type { Area } from '../types'

afterEach(cleanup)

type Short = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

/** The accessible names the compass targets must expose, in compass order. */
const TARGET_LABELS: Record<Short, string> = {
  N: 'north (up)',
  NE: 'north-east (up-right)',
  E: 'east (right)',
  SE: 'south-east (down-right)',
  S: 'south (down)',
  SW: 'south-west (down-left)',
  W: 'west (left)',
  NW: 'north-west (up-left)',
}

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

function compassTargets(container: HTMLElement = document.body): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[role="button"][aria-label^="Entrance runs "]'),
  )
}

function directionTarget(short: Short, container: HTMLElement = document.body): HTMLElement {
  const label = `Entrance runs ${TARGET_LABELS[short]}`
  const target = compassTargets(container).find(
    (candidate) => candidate.getAttribute('aria-label') === label,
  )
  if (!target) throw new Error(`No compass target with the label "${label}"`)
  return target
}

function pickDirection(short: Short, container: HTMLElement = document.body): void {
  fireEvent.click(directionTarget(short, container))
}

function ruleButtons(): HTMLElement[] {
  return within(screen.getByRole('group', { name: 'Which exit' })).getAllByRole('button')
}

function answer(): HTMLElement {
  return screen.getByText(/Entrance runs/)
}

describe('TurnCalculator compass targets', () => {
  it('renders eight clickable compass targets with the expected aria-labels', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    const targets = compassTargets(container)
    expect(targets).toHaveLength(8)
    expect(targets.map((target) => target.getAttribute('aria-label'))).toEqual(
      (Object.keys(TARGET_LABELS) as Short[]).map((short) => `Entrance runs ${TARGET_LABELS[short]}`),
    )
    expect(targets.map((target) => target.textContent)).toEqual([
      'N',
      'NE',
      'E',
      'SE',
      'S',
      'SW',
      'W',
      'NW',
    ])
    for (const target of targets) {
      expect(target).toHaveAttribute('role', 'button')
      expect(target).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('renders no separate direction-button row and no rule selector for one rule', () => {
    render(<TurnCalculator area={areaById('jail-2')} />)

    expect(screen.getByRole('heading', { name: 'Work out your exit' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Entrance hallway direction' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Which exit' })).not.toBeInTheDocument()
  })

  it('renders the entrance and exit legend', () => {
    render(<TurnCalculator area={areaById('jail-2')} />)

    const legend = screen.getByRole('list')
    expect(legend).toHaveTextContent('entrance hallway')
    expect(legend).toHaveTextContent('exit hallway')
  })
})

describe('TurnCalculator for a single straight rule (Jail L2)', () => {
  it('answers that a south-east entrance exits south-east', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    expect(
      screen.getByText(/Click the compass direction your entrance hallway points/),
    ).toBeInTheDocument()
    pickDirection('SE', container)

    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(screen.getByText(/The exit runs/)).toHaveTextContent('south-east (down-right)')
    expect(screen.getByText(/keep going straight/)).toBeInTheDocument()
  })

  it('marks only the picked compass target as pressed', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    pickDirection('NW', container)

    expect(compassTargets(container)).toHaveLength(8)
    for (const target of compassTargets(container)) {
      expect(target).toHaveAttribute(
        'aria-pressed',
        target.getAttribute('aria-label') === `Entrance runs ${TARGET_LABELS.NW}`
          ? 'true'
          : 'false',
      )
    }
  })

  it('clears the answer when the same compass target is clicked twice', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    pickDirection('SE', container)
    expect(screen.getByText(/The exit runs/)).toBeInTheDocument()

    pickDirection('SE', container)

    expect(screen.queryByText(/Entrance runs/)).not.toBeInTheDocument()
    expect(screen.queryByText(/The exit runs/)).not.toBeInTheDocument()
    expect(
      screen.getByText(/Click the compass direction your entrance hallway points/),
    ).toBeInTheDocument()
    expect(directionTarget('SE', container)).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects a target with the Enter key', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    fireEvent.keyDown(directionTarget('NW', container), { key: 'Enter' })

    expect(directionTarget('NW', container)).toHaveAttribute('aria-pressed', 'true')
    expect(answer()).toHaveTextContent('Entrance runs north-west (up-left)')
    expect(screen.getByText(/The exit runs/)).toHaveTextContent('north-west (up-left)')
  })

  it('shows the ENTRANCE and EXIT arrow labels only once a direction is picked', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    expect(screen.queryByText('ENTRANCE')).not.toBeInTheDocument()
    expect(screen.queryByText('EXIT')).not.toBeInTheDocument()

    pickDirection('SW', container)

    expect(screen.getByText('ENTRANCE')).toBeInTheDocument()
    expect(screen.getByText('EXIT')).toBeInTheDocument()
  })

  it('names both directions in the compass accessible name once chosen', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-2')} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAccessibleName('Work out the exit direction for Jail - Level 2')

    pickDirection('SE', container)

    expect(svg).toHaveAccessibleName(/entrance hallway runs south-east/i)
    expect(svg).toHaveAccessibleName(/exit runs south-east/i)
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
    const { container } = render(<TurnCalculator area={areaById('jail-1')} />)

    fireEvent.click(screen.getByRole('button', { name: 'Jail L2 (from the waypoint)' }))
    pickDirection('SE', container)

    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(screen.getByText(/The exit runs/)).toHaveTextContent('north-east (up-right)')
    expect(screen.getByText(/turn 90\u00b0 counter-clockwise \(left\)/)).toBeInTheDocument()
  })

  it('answers south-east for the straight Jail L2 entrance rule and a south-east entrance', () => {
    const { container } = render(<TurnCalculator area={areaById('jail-1')} />)

    fireEvent.click(screen.getByRole('button', { name: 'Jail L2 (from the entrance)' }))
    pickDirection('SE', container)

    expect(screen.getByText(/The exit runs/)).toHaveTextContent('south-east (down-right)')
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
  it('answers north-east when a south-east entrance is clicked', () => {
    const { container } = render(<TurnCalculator area={areaById('tower-cellar-1-4')} />)

    pickDirection('SE', container)

    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(screen.getByText(/The exit runs/)).toHaveTextContent('north-east (up-right)')
  })

  it('maps every entrance direction a quarter turn to the left', () => {
    const cases: [Short, string][] = [
      ['N', 'west (left)'],
      ['NE', 'north-west (up-left)'],
      ['E', 'north (up)'],
      ['SE', 'north-east (up-right)'],
      ['S', 'east (right)'],
      ['SW', 'south-east (down-right)'],
      ['W', 'south (down)'],
      ['NW', 'south-west (down-left)'],
    ]

    const { container } = render(<TurnCalculator area={areaById('tower-cellar-1-4')} />)
    expect(screen.queryByRole('group', { name: 'Which exit' })).not.toBeInTheDocument()

    for (const [entrance, exit] of cases) {
      pickDirection(entrance, container)
      expect(answer()).toHaveTextContent(`Entrance runs ${TARGET_LABELS[entrance]}`)
      expect(screen.getByText(/The exit runs/)).toHaveTextContent(`The exit runs ${exit}`)
    }
  })
})

describe('TurnCalculator interaction state', () => {
  it('resets the chosen direction when AreaDetail navigates to another area', () => {
    const { container, rerender } = render(
      <AreaDetail act={act1} area={areaById('jail-1')} onSelect={() => {}} onClose={() => {}} />,
    )

    pickDirection('SE', container)
    expect(answer()).toHaveTextContent('Entrance runs south-east (down-right)')
    expect(
      compassTargets(container).filter((target) => target.getAttribute('aria-pressed') === 'true'),
    ).toHaveLength(1)

    rerender(
      <AreaDetail act={act1} area={areaById('tower-cellar-1-4')} onSelect={() => {}} onClose={() => {}} />,
    )

    expect(
      screen.getByText(/Click the compass direction your entrance hallway points/),
    ).toBeInTheDocument()
    for (const target of compassTargets(container)) {
      expect(target).toHaveAttribute('aria-pressed', 'false')
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
