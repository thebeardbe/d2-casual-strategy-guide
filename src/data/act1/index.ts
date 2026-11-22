import type { Act, Connector } from '../../types'
import { dungeons } from './dungeons'
import { monastery } from './monastery'
import { outdoor } from './outdoor'

/**
 * Act I graph. Arrow direction follows the reference chart: the necessary path
 * runs blue from town to Andariel, optional detours hang off it in orange.
 */
const connectors: Connector[] = [
  // Necessary path, town to the Catacombs.
  { from: 'rogue-encampment', to: 'blood-moor', necessary: true },
  { from: 'blood-moor', to: 'cold-plains', necessary: true },
  { from: 'cold-plains', to: 'stony-field', necessary: true },
  { from: 'stony-field', to: 'underground-passage-1', necessary: true },
  { from: 'underground-passage-1', to: 'dark-wood', necessary: true },
  { from: 'dark-wood', to: 'black-marsh', necessary: true },
  { from: 'black-marsh', to: 'tamoe-highland', necessary: true },
  { from: 'tamoe-highland', to: 'monastery-gate-outer-cloister', necessary: true },
  { from: 'monastery-gate-outer-cloister', to: 'barracks', necessary: true },
  { from: 'barracks', to: 'jail-1', necessary: true },
  { from: 'jail-1', to: 'jail-2', necessary: true },
  { from: 'jail-2', to: 'jail-3', necessary: true },
  { from: 'jail-3', to: 'inner-cloister', necessary: true },
  { from: 'inner-cloister', to: 'cathedral', necessary: true },
  { from: 'cathedral', to: 'catacombs-1', necessary: true },
  { from: 'catacombs-1', to: 'catacombs-2', necessary: true },
  { from: 'catacombs-2', to: 'catacombs-3', necessary: true },
  { from: 'catacombs-3', to: 'catacombs-4', necessary: true },

  // Optional detours.
  { from: 'rogue-encampment', to: 'cow-level' },
  { from: 'blood-moor', to: 'den-of-evil' },
  { from: 'cold-plains', to: 'burial-ground' },
  { from: 'burial-ground', to: 'mausoleum-crypt' },
  { from: 'cold-plains', to: 'cave-1' },
  { from: 'cave-1', to: 'cave-2' },
  { from: 'stony-field', to: 'tristram' },
  { from: 'underground-passage-1', to: 'underground-passage-2' },
  { from: 'black-marsh', to: 'hole-1' },
  { from: 'hole-1', to: 'hole-2' },
  { from: 'black-marsh', to: 'forgotten-tower' },
  { from: 'forgotten-tower', to: 'tower-cellar-1-4' },
  { from: 'tower-cellar-1-4', to: 'tower-cellar-5' },
  { from: 'tamoe-highland', to: 'pit-1' },
  { from: 'pit-1', to: 'pit-2' },
]

export const act1: Act = {
  number: 1,
  roman: 'I',
  title: 'Rogue Encampment to Andariel',
  areas: [...outdoor, ...dungeons, ...monastery],
  connectors,
}
