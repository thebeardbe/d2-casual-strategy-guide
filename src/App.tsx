import { useEffect } from 'react'
import { AreaDetail } from './components/AreaDetail'
import { Flowchart } from './components/Flowchart'
import { availableActs, areasInOrder, findAct, findArea, ROMAN_NUMERALS } from './data/acts'
import { useRoute } from './lib/route'

export function App() {
  const [route, navigate] = useRoute()
  const act = findAct(route.act) ?? availableActs[0]
  const area = findArea(act, route.areaId)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key === 'Escape' && area) {
        navigate({ act: act.number })
        return
      }
      if (!area || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
      const ordered = areasInOrder(act)
      const index = ordered.findIndex((candidate) => candidate.id === area.id)
      if (index < 0) return
      const step = event.key === 'ArrowLeft' ? -1 : 1
      const next = ordered[(index + step + ordered.length) % ordered.length]
      navigate({ act: act.number, areaId: next.id })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [act, area, navigate])

  return (
    <div className="app">
      <header className="tabs">
        <p className="tabs__brand">Diablo II Map Codex</p>
        <nav className="tabs__nav" aria-label="Acts">
          {ROMAN_NUMERALS.map((roman, index) => {
            const number = index + 1
            const available = findAct(number)
            const active = number === act.number
            return (
              <button
                key={roman}
                type="button"
                className={`tabs__tab${active ? ' tabs__tab--active' : ''}${available ? '' : ' tabs__tab--pending'}`}
                aria-current={active ? 'page' : undefined}
                disabled={!available}
                title={available ? `Act ${roman}` : `Act ${roman} is not added yet`}
                onClick={() => navigate({ act: number })}
              >
                Act {roman}
              </button>
            )
          })}
        </nav>
        <p className="tabs__credit">
          Layout data from{' '}
          <a href="https://www.youtube.com/watch?v=J1EFUYGk4CA" target="_blank" rel="noreferrer">
            WithNoFiller
          </a>
        </p>
      </header>

      <main className={area ? 'main main--detail' : 'main main--chart'}>
        {area ? (
          <AreaDetail
            act={act}
            area={area}
            onSelect={(areaId) => navigate({ act: act.number, areaId })}
            onClose={() => navigate({ act: act.number })}
          />
        ) : (
          <Flowchart
            act={act}
            onSelect={(areaId) => navigate({ act: act.number, areaId })}
          />
        )}
      </main>
    </div>
  )
}
