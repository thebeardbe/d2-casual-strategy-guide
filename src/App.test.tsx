import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { App } from './App'

function resetHash() {
  window.history.replaceState(null, '', '/')
}

afterEach(() => {
  cleanup()
  resetHash()
})

function actNav() {
  return screen.getByRole('navigation', { name: 'Acts' })
}

describe('App', () => {
  it('renders the five act tabs with only Act I enabled', () => {
    render(<App />)

    const tabs = within(actNav()).getAllByRole('button')
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Act I',
      'Act II',
      'Act III',
      'Act IV',
      'Act V',
    ])
    expect(within(actNav()).getByRole('button', { name: 'Act I' })).toBeEnabled()
    for (const roman of ['II', 'III', 'IV', 'V']) {
      expect(within(actNav()).getByRole('button', { name: `Act ${roman}` })).toBeDisabled()
    }
  })

  it('marks Act I as the current page', () => {
    render(<App />)

    expect(within(actNav()).getByRole('button', { name: 'Act I' })).toHaveAttribute('aria-current', 'page')
    expect(within(actNav()).getByRole('button', { name: 'Act II' })).not.toHaveAttribute('aria-current')
  })

  it('shows the Act I chart by default', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Act I')
    expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
  })

  it('opens the area from the hash on first render', () => {
    window.location.hash = '#/act/1/jail-2'
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 2')
    expect(screen.getByText(/^Type: /)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close and return to the chart' })).toBeInTheDocument()
  })

  it('falls back to the default chart for an unknown area id', () => {
    window.location.hash = '#/act/1/not-an-area'
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Act I')
    expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
  })

  it('navigates to an area when its node is clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /^Cathedral/ }))

    expect(window.location.hash).toBe('#/act/1/cathedral')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cathedral')
  })

  it('returns to the chart with Escape', () => {
    window.location.hash = '#/act/1/jail-2'
    render(<App />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Act I')
    expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
  })

  it('steps to the next area with the arrow keys', () => {
    window.location.hash = '#/act/1/jail-2'
    render(<App />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Jail - Level 2')
    expect(window.location.hash.startsWith('#/act/1/')).toBe(true)
  })

  it('steps exactly one area forward with ArrowRight', () => {
    window.location.hash = '#/act/1/jail-2'
    render(<App />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(window.location.hash).toBe('#/act/1/jail-3')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 3')
  })

  it('steps exactly one area back with ArrowLeft', () => {
    window.location.hash = '#/act/1/jail-2'
    render(<App />)

    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    expect(window.location.hash).toBe('#/act/1/jail-1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 1')
  })

  describe('guide route', () => {
    it('shows the guide when the initial hash is #/guide', () => {
      window.location.hash = '#/guide'
      render(<App />)

      expect(screen.getByRole('heading', { level: 1, name: 'How to read a map' })).toBeInTheDocument()
      expect(screen.queryByRole('group', { name: 'Act I map chart' })).not.toBeInTheDocument()
    })

    it('switches to the guide when the header button is clicked', () => {
      render(<App />)

      fireEvent.click(screen.getByRole('button', { name: 'How to read a map' }))

      expect(window.location.hash).toBe('#/guide')
      expect(screen.getByRole('heading', { level: 1, name: 'How to read a map' })).toBeInTheDocument()
      expect(screen.queryByRole('group', { name: 'Act I map chart' })).not.toBeInTheDocument()
    })

    it('returns to the chart from the guide with Escape', () => {
      window.location.hash = '#/guide'
      render(<App />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(window.location.hash).toBe('#/act/1')
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Act I')
      expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
    })

    it('returns to the chart from the guide with the back button', () => {
      window.location.hash = '#/guide'
      render(<App />)

      fireEvent.click(screen.getByRole('button', { name: 'Back to the chart' }))

      expect(window.location.hash).toBe('#/act/1')
      expect(screen.getByRole('group', { name: 'Act I map chart' })).toBeInTheDocument()
    })

    it('links to the video moments that explain the hallway and the categories', () => {
      window.location.hash = '#/guide'
      render(<App />)

      const hallway = screen.getByRole('link', { name: /2:27/ })
      expect(hallway).toHaveAttribute(
        'href',
        'https://www.youtube.com/watch?v=J1EFUYGk4CA&t=147s',
      )

      const categories = screen.getByRole('link', { name: /5:43/ })
      expect(categories).toHaveAttribute(
        'href',
        'https://www.youtube.com/watch?v=J1EFUYGk4CA&t=343s',
      )
    })
  })

  describe('modifier keys', () => {
    const modifiers = [
      ['altKey', 'Alt'],
      ['ctrlKey', 'Ctrl'],
      ['metaKey', 'Meta'],
      ['shiftKey', 'Shift'],
    ] as const

    for (const [modifier, label] of modifiers) {
      for (const key of ['ArrowLeft', 'ArrowRight'] as const) {
        it(`ignores ${key} while ${label} is held`, () => {
          window.location.hash = '#/act/1/jail-2'
          render(<App />)

          fireEvent.keyDown(window, { key, [modifier]: true })

          expect(window.location.hash).toBe('#/act/1/jail-2')
          expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 2')
        })
      }
    }

    it('ignores Escape while a modifier is held', () => {
      window.location.hash = '#/act/1/jail-2'
      render(<App />)

      fireEvent.keyDown(window, { key: 'Escape', shiftKey: true })

      expect(window.location.hash).toBe('#/act/1/jail-2')
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jail - Level 2')
    })
  })
})
