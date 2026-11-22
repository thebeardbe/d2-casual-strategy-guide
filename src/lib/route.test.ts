import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { DEFAULT_ROUTE, parseRoute, routeToHash, useRoute } from './route'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('parseRoute', () => {
  it('parses an act-only route', () => {
    expect(parseRoute('#/act/1')).toEqual({ act: 1 })
    expect(parseRoute('#/act/4')).toEqual({ act: 4 })
  })

  it('parses an area route', () => {
    expect(parseRoute('#/act/3/jail-2')).toEqual({ act: 3, areaId: 'jail-2' })
  })

  it('tolerates trailing and repeated slashes', () => {
    expect(parseRoute('#/act/1/')).toEqual({ act: 1 })
    expect(parseRoute('#/act/1/jail-2/')).toEqual({ act: 1, areaId: 'jail-2' })
    expect(parseRoute('#/act/1//jail-2')).toEqual({ act: 1, areaId: 'jail-2' })
  })

  it('falls back to the default route for unparseable hashes', () => {
    for (const hash of ['', '#', '#/', '#/nonsense', '#/act', '#/act/abc', '#/act/0', '#/act/-1', '#/act/1.5']) {
      expect(parseRoute(hash), `hash: ${JSON.stringify(hash)}`).toEqual(DEFAULT_ROUTE)
    }
  })

  it('keeps the default route act at the first act', () => {
    expect(DEFAULT_ROUTE).toEqual({ act: 1 })
  })
})

describe('routeToHash', () => {
  it('writes an act route and round-trips through parseRoute', () => {
    const hash = routeToHash({ act: 2 })
    expect(hash).toBe('#/act/2')
    expect(parseRoute(hash)).toEqual({ act: 2 })
  })

  it('writes an area route and round-trips through parseRoute', () => {
    const route = { act: 3, areaId: 'jail-2' }
    const hash = routeToHash(route)
    expect(hash).toBe('#/act/3/jail-2')
    expect(parseRoute(hash)).toEqual(route)
  })

  it('drops an empty area id instead of emitting a trailing slash', () => {
    expect(routeToHash({ act: 1, areaId: '' })).toBe('#/act/1')
  })
})

describe('useRoute', () => {
  it('keeps the navigate callback stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useRoute())
    const navigate = result.current[1]

    rerender()

    expect(result.current[1]).toBe(navigate)
  })

  it('writes the hash and updates the route when navigating', () => {
    const { result } = renderHook(() => useRoute())
    expect(result.current[0]).toEqual(DEFAULT_ROUTE)

    act(() => result.current[1]({ act: 1, areaId: 'cathedral' }))

    expect(window.location.hash).toBe('#/act/1/cathedral')
    expect(result.current[0]).toEqual({ act: 1, areaId: 'cathedral' })
  })
})
