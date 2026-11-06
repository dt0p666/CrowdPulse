import L from 'leaflet'

// Fix default leaflet icons if used directly
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/**
 * Create modern pulse marker for incident maps
 */
export function createSeverityIcon(severity: 'GREEN' | 'YELLOW' | 'RED') {
  const colorMap = {
    RED: {
      bg: '#f43f5e',
      border: '#fda4af',
      ring: 'rgba(244, 63, 94, 0.4)',
    },
    YELLOW: {
      bg: '#f59e0b',
      border: '#fde68a',
      ring: 'rgba(245, 158, 11, 0.4)',
    },
    GREEN: {
      bg: '#10b981',
      border: '#a7f3d0',
      ring: 'rgba(16, 185, 129, 0.4)',
    },
  }

  const c = colorMap[severity] || colorMap.GREEN

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${c.ring};
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${c.bg};
          border: 2px solid ${c.border};
          box-shadow: 0 0 10px ${c.bg};
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
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
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.35);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #06b6d4;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px #06b6d4;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}
