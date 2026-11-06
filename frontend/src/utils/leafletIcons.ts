import L from 'leaflet'

// Fix default leaflet icons if used directly
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/**
 * Clean & Refined Marker for Verified Incident Locations
 * Based on warm editorial status colors (#C94C4C, #D69B32, #38845B)
 */
export function createSeverityIcon(severity: 'GREEN' | 'YELLOW' | 'RED') {
  const colorMap = {
    RED: {
      bg: '#C94C4C',
      border: '#FFFFFF',
      ring: 'rgba(201, 76, 76, 0.25)',
      shadow: 'rgba(201, 76, 76, 0.35)',
    },
    YELLOW: {
      bg: '#D69B32',
      border: '#FFFFFF',
      ring: 'rgba(214, 155, 50, 0.25)',
      shadow: 'rgba(214, 155, 50, 0.35)',
    },
    GREEN: {
      bg: '#38845B',
      border: '#FFFFFF',
      ring: 'rgba(56, 132, 91, 0.25)',
      shadow: 'rgba(56, 132, 91, 0.35)',
    },
  }

  const c = colorMap[severity] || colorMap.GREEN

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${c.ring};
        "></div>
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${c.bg};
          border: 2px solid ${c.border};
          box-shadow: 0 2px 6px ${c.shadow};
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

/**
 * Citizen User Location Pin
 */
export function createUserLocationIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(23, 107, 101, 0.2);
        "></div>
        <div style="
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #176B65;
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(23, 107, 101, 0.4);
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}
