import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Flowchart } from './Flowchart'
import { act1 } from '../data/act1'
import { mapTypeColor } from '../data/mapTypes'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function nodeByName(name: string) {
  return screen.getByRole('button', { name: new RegExp(name) })
}

describe('Flowchart', () => {
  it('renders one focusable node per area, named after the area', () => {
    render(<Flowchart act={act1} onSelect={() => {}} />)

    const nodes = screen.getAllByRole('button')
    expect(nodes).toHaveLength(act1.areas.length)
    for (const area of act1.areas) {
      const node = nodeByName(area.name)
      expect(node).toHaveAttribute('tabindex', '0')
      expect(node).toHaveAttribute('aria-label', expect.stringContaining(area.name))
    }
  })

  it('reports the clicked area id', () => {
    const onSelect = vi.fn()
    render(<Flowchart act={act1} onSelect={onSelect} />)

    fireEvent.click(nodeByName('Jail - Level 2'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('jail-2')
  })

  it('activates a node from the keyboard', () => {
    const onSelect = vi.fn()
    render(<Flowchart act={act1} onSelect={onSelect} />)

    fireEvent.keyDown(nodeByName('Cathedral'), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('cathedral')

    fireEvent.keyDown(nodeByName('Cathedral'), { key: ' ' })
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('marks only the selected area with the ring', () => {
    const { container } = render(<Flowchart act={act1} selectedId="jail-2" onSelect={() => {}} />)

    const rings = container.querySelectorAll('.node__ring')
    expect(rings).toHaveLength(1)

    const selectedNode = nodeByName('Jail - Level 2')
    expect(selectedNode.querySelector('.node__ring')).not.toBeNull()
    expect(selectedNode).toHaveAttribute('aria-pressed', 'true')
    expect(nodeByName('Jail - Level 1')).toHaveAttribute('aria-pressed', 'false')
    expect(nodeByName('Jail - Level 1').querySelector('.node__ring')).toBeNull()
  })

  it('shows the act heading and legend in full mode', () => {
    render(<Flowchart act={act1} onSelect={() => {}} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Act I')
    expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
  })

  it('renders no act heading in the compact variant', () => {
    render(<Flowchart act={act1} selectedId="jail-2" onSelect={() => {}} compact />)

    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.queryByText('necessary')).toBeNull()
    expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
  })

  it('never silently drops a connector: each one is either drawn or reported', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Flowchart act={act1} onSelect={() => {}} />)

    const arrows = container.querySelectorAll('polygon.arrow').length
    const warned = warn.mock.calls.map((call) => String(call[0]))
    const connectorKeys = new Set(act1.connectors.map((connector) => `${connector.from} -> ${connector.to}`))

    expect(arrows + warned.length).toBe(act1.connectors.length)
    for (const message of warned) {
      const match = message.match(/^Connector (\S+) -> (\S+)/)
      expect(match, message).not.toBeNull()
      expect(connectorKeys.has(`${match![1]} -> ${match![2]}`), message).toBe(true)
    }
  })

  it('draws an arrow for every connector', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Flowchart act={act1} onSelect={() => {}} />)

    expect(act1.connectors).toHaveLength(33)
    expect(container.querySelectorAll('polygon.arrow')).toHaveLength(act1.connectors.length)
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders text labels for every area inside its node', () => {
    render(<Flowchart act={act1} onSelect={() => {}} />)

    const node = nodeByName('Jail - Level 2')
    expect(within(node as HTMLElement).getByText('Jail L2')).toBeInTheDocument()
  })

  it('renders the two-colour Barracks node from its linear gradient', () => {
    const { container } = render(<Flowchart act={act1} onSelect={() => {}} />)

    const gradient = container.querySelector('linearGradient#fill-barracks')
    expect(gradient).not.toBeNull()
    const stops = gradient!.querySelectorAll('stop')
    expect(stops).toHaveLength(2)
    expect(stops[0]).toHaveAttribute('stop-color', mapTypeColor('counter-clockwise'))
    expect(stops[1]).toHaveAttribute('stop-color', mapTypeColor('straight'))

    const box = nodeByName('Barracks').querySelector('.node__box')
    expect(box).not.toBeNull()
    expect(box).toHaveAttribute('fill', 'url(#fill-barracks)')
  })
})
