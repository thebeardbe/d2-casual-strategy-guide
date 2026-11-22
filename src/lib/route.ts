import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { kind: 'act'; act: number; areaId?: string }
  | { kind: 'guide' }

export const DEFAULT_ROUTE: Route = { kind: 'act', act: 1 }

/**
 * Parse `#/act/1` or `#/act/1/jail-2`. Anything unparseable falls back to the
 * first act rather than throwing, so a stale link still lands somewhere.
 */
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'guide') return { kind: 'guide' }
  if (parts[0] !== 'act') return DEFAULT_ROUTE
  const act = Number(parts[1])
  if (!Number.isInteger(act) || act < 1) return DEFAULT_ROUTE
  const areaId = parts[2]
  return areaId ? { kind: 'act', act, areaId } : { kind: 'act', act }
}

export function routeToHash(route: Route): string {
  if (route.kind === 'guide') return '#/guide'
  return route.areaId ? `#/act/${route.act}/${route.areaId}` : `#/act/${route.act}`
}

/**
 * Route state backed by the URL hash, so every area has a link that can be
 * shared or reloaded. Listens for back/forward and for hand-edited hashes.
 */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next)
    if (window.location.hash !== hash) {
      window.location.hash = hash
    }
    setRoute(next)
  }, [])

  return [route, navigate]
}
