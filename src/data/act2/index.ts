import type { Act, Connector } from '../../types'
import { act2Desert } from './desert'
import { act2Palace } from './palace'
import { act2Sewers } from './sewers'
import { act2Town } from './town'

/**
 * Act II graph. Unlike Act I the necessary path branches: Lut Gholein leads both
 * to the palace route (Arcane Sanctuary and the true tomb) and to the desert
 * route, where the staff pieces are. The arrow probe over the video's own chart
 * frame decided which arrows are blue and which are tan.
 */
const connectors: Connector[] = [
  // Palace route, the quest spine to Duriel.
  { from: 'lut-gholein', to: 'harem-1', necessary: true },
  { from: 'harem-1', to: 'harem-2', necessary: true },
  { from: 'harem-2', to: 'palace-cellar-1', necessary: true },
  { from: 'palace-cellar-1', to: 'palace-cellar-2', necessary: true },
  { from: 'palace-cellar-2', to: 'palace-cellar-3', necessary: true },
  { from: 'palace-cellar-3', to: 'arcane-sanctuary', necessary: true },
  { from: 'arcane-sanctuary', to: 'canyon-of-the-magi', necessary: true },
  { from: 'canyon-of-the-magi', to: 'tal-rasha-tomb-true', necessary: true },
  { from: 'tal-rasha-tomb-true', to: 'tal-rasha-chamber', necessary: true },

  // Desert route, needed for the staff, and continuing to the amulet.
  { from: 'lut-gholein', to: 'rocky-waste', necessary: true },
  { from: 'rocky-waste', to: 'dry-hills', necessary: true },
  { from: 'dry-hills', to: 'far-oasis', necessary: true },
  { from: 'far-oasis', to: 'lost-city', necessary: true },
  { from: 'lost-city', to: 'valley-of-snakes', necessary: true },
  { from: 'valley-of-snakes', to: 'claw-viper-1', necessary: true },
  { from: 'claw-viper-1', to: 'claw-viper-2', necessary: true },
  { from: 'far-oasis', to: 'maggot-lair-1', necessary: true },
  { from: 'maggot-lair-1', to: 'maggot-lair-2', necessary: true },
  { from: 'maggot-lair-2', to: 'maggot-lair-3', necessary: true },

  // Optional detours.
  { from: 'lut-gholein', to: 'sewers-1' },
  { from: 'sewers-1', to: 'sewers-2' },
  { from: 'sewers-2', to: 'sewers-3' },
  { from: 'rocky-waste', to: 'stony-tomb-1' },
  { from: 'stony-tomb-1', to: 'stony-tomb-2' },
  { from: 'dry-hills', to: 'halls-of-the-dead-1' },
  { from: 'halls-of-the-dead-1', to: 'halls-of-the-dead-2' },
  { from: 'halls-of-the-dead-2', to: 'halls-of-the-dead-3' },
  { from: 'lost-city', to: 'ancient-tunnels' },
  { from: 'claw-viper-2', to: 'tal-rasha-tomb-false' },
]

export const act2: Act = {
  number: 2,
  roman: 'II',
  title: 'Lut Gholein to Duriel',
  areas: [...act2Town, ...act2Palace, ...act2Desert, ...act2Sewers],
  connectors,
}
