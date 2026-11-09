import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export interface MapTileConfig {
  id: string
  name: string
  url: string
  attribution: string
  maxZoom: number
}

export const MAP_TILES: Record<string, MapTileConfig> = {
  street: {
    id: 'street',
    name: 'Street View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, METI, TomTom',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    name: 'Dark Radar',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  topo: {
    id: 'topo',
    name: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
    maxZoom: 19,
  },
}

/**
 * Ensures Leaflet recalculates dimensions immediately after React DOM mount
 * preventing grey blank tiles when rendered inside flex/grid containers.
 */
export function MapAutoResizer() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [map])
  return null
}
