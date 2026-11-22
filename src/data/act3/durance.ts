import type { Area } from '../../types'

/** Travincal and the Durance of Hate, ending with Mephisto. */
export const act3Durance: Area[] = [
  {
    id: 'travincal', name: 'Travincal', label: 'Travincal', act: 3,
    mapType: 'fixed', row: 1, column: 10,
    waypoint: { where: 'Always in the same spot, on the near side' },
    features: ['The High Council', 'Compelling Orb', 'Quest: The Blackened Temple'],
    entrance: ['From Kurast Causeway'], exit: ['Durance of Hate L1, through the orb'],
    rules: [{ turn: 'fixed', note: 'The council and the waypoint never move' }],
    notes: ['Smash the Compelling Orb to open the way to the Durance.'],
    areaLevels: [{ normal: 24, nightmare: 54, hell: 82 }], videoTime: 1890,
  },
  {
    id: 'durance-1', name: 'Durance of Hate - Level 1', label: 'Durance of\nHate L1', act: 3,
    mapType: 'counter-clockwise', row: 1, column: 11,
    features: [], entrance: ['From Travincal'], exit: ['Durance of Hate L2, counter-clockwise'],
    rules: [{ turn: 'counter-clockwise' }],
    areaLevels: [{ normal: 25, nightmare: 55, hell: 83 }], videoTime: 1898,
  },
  {
    id: 'durance-2', name: 'Durance of Hate - Level 2', label: 'Durance of\nHate L2', act: 3,
    mapType: 'counter-clockwise', row: 2, column: 11,
    waypoint: { where: 'Turn 90 degrees counter-clockwise from the entrance' },
    features: ['Waypoint'], entrance: ['From Durance of Hate L1 or the waypoint'],
    exit: ['Durance of Hate L3'],
    rules: [
      { turn: 'counter-clockwise', towards: 'the waypoint', from: 'entrance' },
      { turn: 'straight', towards: 'Durance L3', from: 'entrance' },
      { turn: 'counter-clockwise', towards: 'Durance L3', from: 'waypoint' },
    ],
    notes: ['Most runs use the waypoint, so the waypoint rule is the one that matters.'],
    areaLevels: [{ normal: 25, nightmare: 55, hell: 83 }], videoTime: 1902,
  },
  {
    id: 'durance-3', name: 'Durance of Hate - Level 3', label: 'Durance of\nHate L3', act: 3,
    mapType: 'fixed', row: 3, column: 11,
    features: ['Boss: Mephisto', 'Super chest in the back', 'Quest: The Guardian'],
    entrance: ['From Durance of Hate L2'], exit: [],
    rules: [{ turn: 'fixed' }],
    notes: ['There is a super chest behind Mephisto; do not forget it on a run.'],
    areaLevels: [{ normal: 25, nightmare: 55, hell: 83 }], videoTime: 1913,
    farming: [
      {
        topic: 'Mephisto',
        detail:
          'Fixed map, so every run is the same walk. There is a super chest in the back after him.',
      },
    ],
  },
]
