/**
 * Map-type classes used by the reference chart. One source of truth: the
 * palette was sampled from the reference screenshot, the labels from the
 * video's own master list.
 */
export type MapTypeKey =
  | 'alternating-fixed'
  | 'fixed'
  | 'fixed-enough'
  | 'big-square'
  | 'big-rectangle'
  | 'skinny-rectangle'
  | 'skinny-rectangle'
  | 'counter-clockwise'
  | 'clockwise'
  | 'straight'
  | 'random'

export interface MapType {
  label: string
  color: string
  hint: string
}

/** How the exit relates to the entrance pathway. */
export type Turn =
  | 'counter-clockwise'
  | 'clockwise'
  | 'straight'
  | 'fixed'
  | 'alternating'
  | 'random'

export interface NavigationRule {
  turn: Turn
  /** Which reference point the turn is measured from. */
  from?: 'entrance' | 'waypoint'
  /** Which exit the rule belongs to, when a level has several. */
  towards?: string
  note?: string
}

/** Area level per difficulty, from the D2R levels table. */
export interface AreaLevels {
  label?: string
  normal: number
  nightmare: number
  hell: number
}

/** Where a level's waypoint sits, in the video's own terms. */
export interface WaypointInfo {
  where: string
  /** True when the game places it somewhere different each time. */
  random?: boolean
}

export interface Area {
  id: string
  /** Title shown in the detail panel, for example "Jail - Level 2". */
  name: string
  /** Chart label, newline-separated to match the reference chart's line breaks. */
  label: string
  act: number
  mapType: MapTypeKey | MapTypeKey[]
  /** Grid row, 0 = top row of the chart. */
  row: number
  /** Grid column, fractional to match the reference layout. */
  column: number
  /** Optional areas hang off the necessary path and get orange arrows. */
  optional?: boolean
  features: string[]
  entrance: string[]
  /** Absent means the level has no waypoint. */
  waypoint?: WaypointInfo
  /**
   * Area levels (alvl) per difficulty. Towns and the Forgotten Tower entry have
   * no monsters, so they carry none. Levels grouped on one card list each.
   */
  areaLevels?: AreaLevels[]
  exit: string[]
  rules: NavigationRule[]
  /** The fixed layouts a level can take, for fixed and alternating fixed maps. */
  variants?: { label: string; detail: string }[]
  /** Why an area is worth farming, and what for. */
  farming?: { topic: string; detail: string }[]
  /** Everything worth knowing that is not a feature, entrance or exit. */
  notes?: string[]
  /** Second in the source video where this area is explained. */
  videoTime: number
  /** Path under /examples, relative to the site root. */
  example?: string
}

export interface Connector {
  from: string
  to: string
  /** Necessary path (blue arrow) or optional detour (orange arrow). */
  necessary?: boolean
}

export interface Act {
  number: number
  roman: string
  title: string
  areas: Area[]
  connectors: Connector[]
}
