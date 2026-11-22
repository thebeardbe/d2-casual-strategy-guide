import type { Area } from '../../types'

/**
 * Kurast: three big squares in a row, each with two sewer entrances and two
 * small temples, then the causeway with its own pair of temples. The square rule
 * is the Act II one: exits sit near corners, and here the exit is the opposite
 * corner from the entrance.
 */
export const act3Kurast: Area[] = [
  {
    id: 'lower-kurast', name: 'Lower Kurast', label: 'Lower\nKurast', act: 3,
    mapType: 'big-square', row: 1, column: 5,
    waypoint: { where: 'Placed randomly in the square' },
    features: ['Super chests around the rings of torches'],
    entrance: ['From Flayer Jungle'], exit: ['Kurast Bazaar, the opposite corner'],
    rules: [{ turn: 'straight', note: 'The exit is the corner opposite the entrance' }],
    notes: [
      'Players run single player on players 8 Hell and sweep Lower Kurast for super chests.',
      'Find the ring of torches, then open the chests in the two buildings north of it.',
    ],
    areaLevels: [{ normal: 22, nightmare: 52, hell: 80 }], videoTime: 1800,
    farming: [
      {
        topic: 'Super chests',
        detail:
          'The classic Lower Kurast run: find a ring of torches, then hit the chests in the two buildings north of it. Best on players 8 in single player.',
      },
    ],
  },
  {
    id: 'kurast-bazaar', name: 'Kurast Bazaar', label: 'Kurast\nBazaar', act: 3,
    mapType: 'big-square', row: 1, column: 6,
    waypoint: { where: 'Placed randomly in the square' },
    features: ['Two sewer entrances, always in the same place', 'Two small temples'],
    entrance: ['From Lower Kurast'], exit: ['Upper Kurast, the opposite corner'],
    rules: [{ turn: 'straight', note: 'The exit is the corner opposite the entrance' }],
    notes: ['The two sewer entrances and the waypoint layout never move; the temples are placed randomly.'],
    areaLevels: [{ normal: 22, nightmare: 52, hell: 81 }], videoTime: 1823,
  },
  {
    id: 'ruined-temple', name: 'Ruined Temple', label: 'Ruined\nTemple', act: 3,
    mapType: 'alternating-fixed', row: 0, column: 6, optional: true,
    features: ['Lam Esen\u2019s Tome', 'Mini boss: Battlemaid Sarina'],
    entrance: ['From Kurast Bazaar, placed randomly'], exit: [],
    variants: [
      { label: 'Three layouts', detail: 'The temple is one of three small arrangements' },
      { label: 'Same objective', detail: 'The tome and Battlemaid Sarina are in the same room' },
    ],
    rules: [{ turn: 'alternating', note: 'One of three layouts' }],
    notes: ['Easy to skip, but the tome gives five stat points.'],
    areaLevels: [{ normal: 23, nightmare: 53, hell: 85 }], videoTime: 1830,
  },
  {
    id: 'disused-fane', name: 'Disused Fane', label: 'Disused\nFane', act: 3,
    mapType: 'alternating-fixed', row: 2, column: 6, optional: true,
    features: ['Small temple'], entrance: ['From Kurast Bazaar, placed randomly'], exit: [],
    variants: [
      { label: 'Two layouts', detail: 'Small temple, one of two arrangements' },
      { label: 'Skippable', detail: 'Nothing here is needed for the act' },
    ],
    rules: [{ turn: 'alternating', note: 'One of two layouts' }],
    areaLevels: [{ normal: 23, nightmare: 53, hell: 85 }], videoTime: 1835,
  },
  {
    id: 'kurast-sewers-1', name: 'Kurast Sewers - Level 1', label: 'Sewers L1', act: 3,
    mapType: 'fixed-enough', row: 2, column: 7, optional: true,
    features: ['Four entrances forming a hollow square', 'Sparkling chest'],
    entrance: ['From Kurast Bazaar (and Upper Kurast)'], exit: ['Sewers L2, clockwise from the chest'],
    rules: [{ turn: 'clockwise', note: 'The hatch down is 90 degrees clockwise from the sparkling chest' }],
    notes: [
      'The four entrances always sit in the same spots and the objective tiles are always 90 degrees apart.',
      'The tile with the hatch to level two carries a small symbol.',
      'Hard to navigate without teleport; the video says so too.',
    ],
    areaLevels: [{ normal: 23, nightmare: 52, hell: 85 }], videoTime: 1840,
  },
  {
    id: 'kurast-sewers-2', name: 'Kurast Sewers - Level 2', label: 'Sewers L2', act: 3,
    mapType: 'fixed', row: 3, column: 7, optional: true,
    features: ['Properly fixed layout'], entrance: ['From Sewers L1'], exit: [],
    rules: [{ turn: 'fixed' }],
    areaLevels: [{ normal: 24, nightmare: 53, hell: 85 }], videoTime: 1856,
  },
  {
    id: 'upper-kurast', name: 'Upper Kurast', label: 'Upper\nKurast', act: 3,
    mapType: 'big-square', row: 1, column: 8,
    features: ['Two sewer entrances in fixed spots', 'Two small temples'],
    entrance: ['From Kurast Bazaar'], exit: ['Kurast Causeway, middle of the upper right side'],
    rules: [{ turn: 'straight', note: 'The exit is always the middle of the upper right side' }],
    areaLevels: [{ normal: 23, nightmare: 52, hell: 81 }], videoTime: 1862,
  },
  {
    id: 'forgotten-temple', name: 'Forgotten Temple', label: 'Forgotten\nTemple', act: 3,
    mapType: 'alternating-fixed', row: 0, column: 8, optional: true,
    features: ['Small temple'], entrance: ['From Upper Kurast'], exit: [],
    variants: [
      { label: 'Two layouts', detail: 'Small temple, one of two arrangements' },
      { label: 'Skippable', detail: 'Nothing here is needed for the act' },
    ],
    rules: [{ turn: 'alternating', note: 'One of two layouts' }],
    areaLevels: [{ normal: 24, nightmare: 54, hell: 85 }], videoTime: 1870,
  },
  {
    id: 'forgotten-reliquary', name: 'Forgotten Reliquary', label: 'Forgotten\nReliquary', act: 3,
    mapType: 'alternating-fixed', row: 2, column: 8, optional: true,
    features: ['Small temple'], entrance: ['From Upper Kurast'], exit: [],
    variants: [
      { label: 'Two layouts', detail: 'Small temple, one of two arrangements' },
      { label: 'Skippable', detail: 'Nothing here is needed for the act' },
    ],
    rules: [{ turn: 'alternating', note: 'One of two layouts' }],
    areaLevels: [{ normal: 23, nightmare: 53, hell: 85 }], videoTime: 1872,
  },
  {
    id: 'kurast-causeway', name: 'Kurast Causeway', label: 'Kurast\nCauseway', act: 3,
    mapType: 'fixed', row: 1, column: 9,
    features: ['Very small map', 'Two small temples'],
    entrance: ['From Upper Kurast'], exit: ['Travincal, straight up'],
    rules: [{ turn: 'straight', note: 'To leave, go up' }],
    areaLevels: [{ normal: 24, nightmare: 53, hell: 81 }], videoTime: 1881,
  },
  {
    id: 'disused-reliquary', name: 'Disused Reliquary', label: 'Disused\nReliquary', act: 3,
    mapType: 'alternating-fixed', row: 0, column: 9, optional: true,
    features: ['Small temple'], entrance: ['From Kurast Causeway'], exit: [],
    variants: [
      { label: 'Two layouts', detail: 'Small temple, one of two arrangements' },
      { label: 'Skippable', detail: 'Nothing here is needed for the act' },
    ],
    rules: [{ turn: 'alternating', note: 'One of two layouts' }],
    areaLevels: [{ normal: 24, nightmare: 54, hell: 85 }], videoTime: 1883,
  },
  {
    id: 'ruined-fane', name: 'Ruined Fane', label: 'Ruined\nFane', act: 3,
    mapType: 'alternating-fixed', row: 2, column: 9, optional: true,
    features: ['Small temple'], entrance: ['From Kurast Causeway'], exit: [],
    variants: [
      { label: 'Two layouts', detail: 'Small temple, one of two arrangements' },
      { label: 'Skippable', detail: 'Nothing here is needed for the act' },
    ],
    rules: [{ turn: 'alternating', note: 'One of two layouts' }],
    areaLevels: [{ normal: 24, nightmare: 54, hell: 85 }], videoTime: 1885,
  },
]
