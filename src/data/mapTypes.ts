import palette from './mapTypes.json'
import type { Area, MapType, MapTypeKey } from '../types'

export interface MapTypePalette {
  types: Partial<Record<MapTypeKey, MapType>>
  order: MapTypeKey[]
}

const file = palette as MapTypePalette

/** Colour used when a map type has no palette entry yet (Act III onward). */
export const FALLBACK_COLOR = '#4a4540'

export function mapTypeColor(key: MapTypeKey): string {
  const entry = file.types[key]
  if (!entry) {
    console.warn(`No palette entry for map type "${key}"; falling back to grey.`)
    return FALLBACK_COLOR
  }
  return entry.color
}

export function mapTypeLabel(key: MapTypeKey): string {
  return file.types[key]?.label ?? key
}

export function mapTypeHint(key: MapTypeKey): string {
  return file.types[key]?.hint ?? ''
}

/** The map types of an area, normalised: a level can be a hybrid of two. */
export function areaMapTypes(area: Pick<Area, 'mapType'>): MapTypeKey[] {
  return Array.isArray(area.mapType) ? area.mapType : [area.mapType]
}

/** Label such as "Hybrid of Straight and Counter-Clockwise". */
export function areaMapTypeLabel(area: Pick<Area, 'mapType'>): string {
  return areaMapTypes(area).map(mapTypeLabel).join(' + ')
}

/** Solid colour, or a two-stop vertical gradient for hybrid levels. */
export function areaFill(area: Pick<Area, 'mapType' | 'id'>): { solid?: string; gradient?: [string, string]; id: string } {
  const [first, second] = areaMapTypes(area)
  if (second) {
    return { gradient: [mapTypeColor(first), mapTypeColor(second)], id: `fill-${area.id}` }
  }
  return { solid: mapTypeColor(first), id: `fill-${area.id}` }
}

export function paletteOrder(): MapTypeKey[] {
  return file.order
}
