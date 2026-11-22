import type { Act, Area, Connector } from '../../types'

/**
 * Act IV: one straight line from town to Diablo. The chart draws six boxes in a
 * single row, with the River of Flame split diagonally because the map changes
 * character at the waypoint; here that becomes two areas.
 */
const areas: Area[] = [
  {
    id: 'pandemonium-fortress', name: 'Pandemonium Fortress', label: 'Pandemonium\nFortress (Town)', act: 4,
    mapType: 'fixed', row: 0, column: 0,
    features: ['Town for Act 4', 'Deckard Cain, Tyrael, Halbu, Jamella'],
    entrance: ['After beating Mephisto'], exit: ['Outer Steppes, lower right side'],
    rules: [{ turn: 'fixed', note: 'The way out is the lower right side of town' }],
    notes: ['Always the same town. Tyrael is here but mostly states the obvious.'],
    videoTime: 1985,
  },
  {
    id: 'outer-steppes', name: 'Outer Steppes', label: 'Outer\nSteppes', act: 4,
    mapType: 'big-rectangle', row: 0, column: 1,
    features: ['Three possible exit spots'],
    entrance: ['From Pandemonium Fortress, down the staircase along the upper left side'],
    exit: ['Plains of Despair, in one of three places'],
    rules: [{ turn: 'straight', note: 'The exit is one of three spots: the left corner or one of two by the right corner' }],
    notes: ['The entrance is always along the upper left side. Knowing the three exit spots saves real time.'],
    areaLevels: [{ normal: 26, nightmare: 56, hell: 82 }], videoTime: 1995,
  },
  {
    id: 'plains-of-despair', name: 'Plains of Despair', label: 'Plains of\nDespair', act: 4,
    mapType: 'big-rectangle', row: 0, column: 2,
    features: ['Quest boss: Izual', 'Four possible entrance and exit spots'],
    entrance: ['From Outer Steppes'], exit: ['City of the Damned'],
    rules: [{ turn: 'straight', note: 'Entrances and exits only sit in four possible locations' }],
    notes: [
      'Izual is placed randomly. The tile he stands on carries a small mark, different from the other lava pits.',
      'Izual gives two skill points, so he is worth the detour.',
    ],
    areaLevels: [{ normal: 26, nightmare: 57, hell: 83 }], videoTime: 2010,
  },
  {
    id: 'city-of-the-damned', name: 'City of the Damned', label: 'City of the\nDamned', act: 4,
    mapType: 'big-rectangle', row: 0, column: 3,
    waypoint: { where: 'Randomly placed, but always right next to the stairs down to River of Flame',
      random: true },
    features: ['Waypoint', 'Stairs down to River of Flame'],
    entrance: ['From Plains of Despair'], exit: ['River of Flame'],
    rules: [{ turn: 'straight', note: 'Find the stairs: the waypoint is always beside them' }],
    notes: ['The waypoint is random, but it never separates from the stairs to River of Flame.'],
    areaLevels: [{ normal: 27, nightmare: 57, hell: 84 }], videoTime: 2025,
  },
  {
    id: 'river-of-flame-start', name: 'River of Flame - Start', label: 'River of\nFlame (Start)', act: 4,
    mapType: 'fixed-enough', row: 0, column: 4,
    features: ['Hell Forge', 'Branch to the waypoint and branch to the forge'],
    waypoint: undefined,
    entrance: ['From City of the Damned'], exit: ['River of Flame - End, past the waypoint'],
    rules: [{ turn: 'straight', note: 'The whole way runs to the upper right' }],
    notes: [
      'On entering, the map branches into two main pathways: one usually running north-east to the waypoint, the other a perpendicular offshoot to the big Hell Forge tile.',
      'The Hell Forge is where the Hell Forge quest is completed.',
    ],
    areaLevels: [{ normal: 27, nightmare: 58, hell: 85 }], videoTime: 2036,
  },
  {
    id: 'river-of-flame-end', name: 'River of Flame - End', label: 'River of\nFlame (End)', act: 4,
    mapType: 'alternating-fixed', row: 0, column: 5,
    waypoint: { where: 'On the big fixed tile at the start of this stretch, where the road to chaos begins' },
    features: ['Waypoint', 'The road to chaos'],
    entrance: ['From River of Flame - Start, or the waypoint'],
    exit: ['Chaos Sanctuary, upper right'],
    rules: [{ turn: 'straight', towards: 'Chaos Sanctuary', note: 'Always the upper right of the screen' }],
    notes: [
      'The area around the waypoint is one big fixed tile; keep going north-east for the road to chaos.',
      'Read the H shapes when you walk up to them. Tall side: go all the way left and come back. Top fully filled in: take the furthest path to the left. Missing part of the bottom: hug it, go around it, stay in the centre. Perfect H: go all the way right and come back.',
      'Whatever the H says, Chaos Sanctuary is in the upper right of the screen.',
    ],
    areaLevels: [
      { label: 'Whole area', normal: 27, nightmare: 58, hell: 85 },
    ],
    videoTime: 2114,
  },
  {
    id: 'chaos-sanctuary', name: 'Chaos Sanctuary', label: 'Chaos\nSanctuary', act: 4,
    mapType: 'alternating-fixed', row: 0, column: 6,
    features: ['Boss: Diablo', 'Five seals', 'Three mini-boss fights', 'Quest: Terror\u2019s End'],
    entrance: ['From River of Flame'], exit: ['Portal back to town, then Act 5'],
    variants: [
      { label: 'Eight layouts', detail: 'Mostly fixed; each of the three branches can spawn two ways' },
      { label: 'Five seals', detail: 'Pop all five seals and beat the mini bosses before Diablo appears' },
    ],
    rules: [{ turn: 'alternating', note: 'Mostly fixed, three branches vary: eight possible maps' }],
    notes: ['Pop the five seals, beat the bosses, then beat Diablo. Back in town, open the portal to Act V.'],
    areaLevels: [{ normal: 28, nightmare: 58, hell: 85 }], videoTime: 2140,
  },
]

const connectors: Connector[] = [
  { from: 'pandemonium-fortress', to: 'outer-steppes', necessary: true },
  { from: 'outer-steppes', to: 'plains-of-despair', necessary: true },
  { from: 'plains-of-despair', to: 'city-of-the-damned', necessary: true },
  { from: 'city-of-the-damned', to: 'river-of-flame-start', necessary: true },
  { from: 'river-of-flame-start', to: 'river-of-flame-end', necessary: true },
  { from: 'river-of-flame-end', to: 'chaos-sanctuary', necessary: true },
]

export const act4: Act = {
  number: 4,
  roman: 'IV',
  title: 'Pandemonium Fortress to Diablo',
  areas,
  connectors,
}
