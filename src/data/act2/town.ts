import type { Area } from '../../types'

/** Act II town. */
export const act2Town: Area[] = [
  {
    id: 'lut-gholein',
    name: 'Lut Gholein',
    label: 'Lut Gholein\n(Town)',
    act: 2,
    mapType: 'alternating-fixed',
    row: 0,
    column: 1,
    features: ['Town for Act 2', '2 layouts'],
    entrance: ['After arriving from Act I'],
    exit: [
      'Rocky Waste, 2 possible exits',
      'Harem L1',
      'Sewers L1, 2 exits and the south one is best',
    ],
    variants: [
      { label: '2 layouts', detail: 'The city gate is on one of two sides' },
      { label: 'Everything else fixed', detail: 'The palace and both sewer entrances never move' },
    ],
    rules: [{ turn: 'alternating', note: 'The gate side decides where Rocky Waste is' }],
    notes: [
      'Talking to Jerhyn before leaving opens the palace. Entering the Harem and town-portalling back is the fastest walk to Meshif.',
    ],
    videoTime: 1118,
  },
]
