import type { Act, Connector } from '../../types'
import { act3Durance } from './durance'
import { act3Jungle } from './jungle'
import { act3Kurast } from './kurast'

/**
 * Act III graph. One necessary spine across the middle row, with the temples,
 * dungeons and sewers hanging off it. Columns are snapped to whole cells so
 * every arrow is axis-aligned: the source chart draws the jungle connectors as
 * "?" tiles and three of its arrows diagonally, which the renderer cannot draw.
 */
const connectors: Connector[] = [
  { from: 'kurast-docks', to: 'spider-forest', necessary: true },
  { from: 'spider-forest', to: 'great-marsh', necessary: true },
  { from: 'great-marsh', to: 'flayer-jungle', necessary: true },
  { from: 'flayer-jungle', to: 'lower-kurast', necessary: true },
  { from: 'lower-kurast', to: 'kurast-bazaar', necessary: true },
  { from: 'kurast-bazaar', to: 'upper-kurast', necessary: true },
  { from: 'upper-kurast', to: 'kurast-causeway', necessary: true },
  { from: 'kurast-causeway', to: 'travincal', necessary: true },
  { from: 'travincal', to: 'durance-1', necessary: true },
  { from: 'durance-1', to: 'durance-2', necessary: true },
  { from: 'durance-2', to: 'durance-3', necessary: true },

  { from: 'spider-forest', to: 'arachnid-lair' },
  { from: 'spider-forest', to: 'spider-cavern' },
  { from: 'flayer-jungle', to: 'flayer-dungeon-1' },
  { from: 'flayer-dungeon-1', to: 'flayer-dungeon-2' },
  { from: 'flayer-dungeon-2', to: 'flayer-dungeon-3' },
  { from: 'flayer-jungle', to: 'swampy-pit-1' },
  { from: 'swampy-pit-1', to: 'swampy-pit-2' },
  { from: 'swampy-pit-2', to: 'swampy-pit-3' },
  { from: 'kurast-bazaar', to: 'ruined-temple' },
  { from: 'kurast-bazaar', to: 'disused-fane' },
  { from: 'disused-fane', to: 'kurast-sewers-1' },
  { from: 'kurast-sewers-1', to: 'kurast-sewers-2' },
  { from: 'upper-kurast', to: 'forgotten-temple' },
  { from: 'upper-kurast', to: 'forgotten-reliquary' },
  { from: 'kurast-causeway', to: 'disused-reliquary' },
  { from: 'kurast-causeway', to: 'ruined-fane' },
]

export const act3: Act = {
  number: 3,
  roman: 'III',
  title: 'Kurast Docks to Mephisto',
  areas: [...act3Jungle, ...act3Kurast, ...act3Durance],
  connectors,
}
