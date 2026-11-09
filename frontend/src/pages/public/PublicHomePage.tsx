import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import {
  CheckCircle2,
  ArrowRight,
  BellRing,
  RefreshCw,
  Clock,
  Compass,
} from 'lucide-react'
import { PublicLayout, INDIAN_CITIES } from '../../layouts/PublicLayout'
import {
  fetchPublicAdvisories,
  type Incident,
  type PublicAdvisoryResponse,
} from '../../services/api'
import { createSeverityIcon, createUserLocationIcon } from '../../utils/leafletIcons'
import { MAP_TILES, MapAutoResizer } from '../../utils/mapTiles'
import { useTheme } from '../../context/ThemeContext'
import { FigmaSpatialHero } from '../../components/home/FigmaSpatialHero'

// Helper component to re-center the Leaflet map when city coordinates change
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 })
  }, [center, map])
  return null
}

export const PublicHomePage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Pune')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [advisoryData, setAdvisoryData] = useState<PublicAdvisoryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<string>('')

  const { theme } = useTheme()
  const [mapStyle, setMapStyle] = useState<'street' | 'dark' | 'topo'>('street')

  // Automatically adapt map basemap when user changes theme
  useEffect(() => {
    if (theme === 'dark' && mapStyle === 'street') {
      setMapStyle('dark')
    } else if (theme === 'light' && mapStyle === 'dark') {
      setMapStyle('street')
    }
  }, [theme])

  // Default coordinate lookup
  const currentCityMeta =
    INDIAN_CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase()) ||
    INDIAN_CITIES[0]

  const activeCenter: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [currentCityMeta.lat, currentCityMeta.lng]

  const loadAdvisories = async () => {
    try {
      setLoading(true)
      const data = await fetchPublicAdvisories({
        city: selectedCity,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        radius_km: 25.0,
      })
      setAdvisoryData(data)
      if (data.incidents.length > 0 && !selectedIncident) {
        setSelectedIncident(data.incidents[0])
      }
    } catch (err) {
      console.error('Failed to fetch public advisories', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdvisories()
  }, [selectedCity, userCoords])

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setStatusFeedback('Using your device location.')
        },
        () => {
          setUserCoords({ lat: 18.5204, lng: 73.8567 })
          setStatusFeedback('Using central Pune location.')
        }
      )
    }
  }

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          setBrowserAlertsEnabled(true)
          setStatusFeedback('Browser alerts enabled.')
          new Notification('CrowdPulse Safety Alerts Active', {
            body: `You will now receive warnings if critical crowd congestion occurs in ${selectedCity}.`,
          })
        } else {
          setStatusFeedback('Notifications were dismissed.')
        }
      } catch (e) {
        setStatusFeedback('Notifications are not supported in this environment.')
      }
    } else {
      setStatusFeedback('Notifications not supported by browser.')
    }
  }

  const incidents = advisoryData?.incidents || []
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true
    return inc.severity === filterSeverity
  })

  const notificationsList = incidents.map((inc) => ({
    id: inc.id,
    title: inc.advisory?.headline || inc.title,
    locality: `${inc.locality}, ${inc.city}`,
    severity: inc.severity,
    time: new Date(inc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    action: inc.advisory?.public_action || 'Proceed cautiously.',
  }))

  const overallStatus = advisoryData?.overall_city_status || 'GREEN'

  return (
    <PublicLayout
      selectedCity={selectedCity}
      onSelectCity={(city) => {
        setSelectedCity(city)
        setUserCoords(null)
      }}
      onUseGPS={handleUseGPS}
      overallStatus={overallStatus}
      activeAlertsCount={incidents.filter((i) => i.severity === 'RED').length}
      notifications={notificationsList}
    >
      <div className="space-y-12 pb-16">
        {/* Figma Centerpiece: Spatial Flow Intelligence */}
        <FigmaSpatialHero
          onExploreClick={() => {
            const el = document.getElementById('live-operations')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* Live Geographic & City Operations Section */}
        <div id="live-operations" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
          {/* Demonstration Safety Notice Banner */}
          <div className="rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] px-4 py-3 flex items-center justify-between text-xs text-[#6B726C] dark:text-[#94A3B8] shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#D69B32]" />
              <span>
                <strong className="text-[#111111] dark:text-white">Demonstration safety portal:</strong> Crowd advisories and distances are simulated for evaluation purposes. In an emergency, dial <strong>112</strong>.
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {!browserAlertsEnabled ? (
                <button
                  onClick={handleEnableNotifications}
                  className="hidden md:inline-flex items-center space-x-1.5 text-xs font-semibold text-[#176B65] dark:text-[#CEF03C] hover:underline cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Enable notifications</span>
                </button>
              ) : (
                <span className="hidden md:inline-flex items-center space-x-1 text-xs text-[#38845B] dark:text-[#4ADE80]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alerts active</span>
                </span>
              )}
              {statusFeedback && (
                <span className="text-[#176B65] dark:text-[#CEF03C] font-medium hidden sm:inline">
                  {statusFeedback}
                </span>
              )}
            </div>
          </div>

          {/* Section Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#176B65] dark:text-[#CEF03C] font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Metropolitan Ground Operations • {selectedCity}, Maharashtra</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-white">
              Local Conditions & Verified Choke Points
            </h2>

            <p className="text-sm text-[#6B726C] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
              Stay informed about real-time corridor capacity, pedestrian queues, and authority safety guidance.
            </p>
          </div>

          {/* 4 Questions Overview Card */}
          <div className="rounded-2xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] p-6 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D8D6CE] dark:divide-[#253144]">
              {/* Q1: What */}
              <div className="space-y-1 sm:pr-4">
                <span className="text-[11px] font-semibold text-[#6B726C] dark:text-[#94A3B8] uppercase tracking-wider block font-mono">
                  1. What is happening?
                </span>
                <p className="text-sm font-semibold text-[#111111] dark:text-white leading-snug">
                  {selectedIncident ? selectedIncident.title : 'All monitored areas normal'}
                </p>
              </div>

              {/* Q2: Where */}
              <div className="space-y-1 pt-4 sm:pt-0 sm:px-4">
                <span className="text-[11px] font-semibold text-[#6B726C] dark:text-[#94A3B8] uppercase tracking-wider block font-mono">
                  2. Where is it?
                </span>
                <p className="text-sm font-semibold text-[#111111] dark:text-white leading-snug">
                  {selectedIncident ? `${selectedIncident.locality}, ${selectedIncident.city}` : selectedCity}
                </p>
              </div>

              {/* Q3: How close */}
              <div className="space-y-1 pt-4 sm:pt-0 sm:px-4">
                <span className="text-[11px] font-semibold text-[#6B726C] dark:text-[#94A3B8] uppercase tracking-wider block font-mono">
                  3. How close to you?
                </span>
                <p className="text-sm font-semibold text-[#111111] dark:text-white leading-snug">
                  {selectedIncident?.distance_km !== undefined && selectedIncident?.distance_km !== null
                    ? `${selectedIncident.distance_km} km away (straight-line)`
                    : 'Approx. 2.4 km from center'}
                </p>
              </div>

              {/* Q4: What to do */}
              <div className="space-y-1 pt-4 sm:pt-0 sm:pl-4">
                <span className="text-[11px] font-semibold text-[#176B65] dark:text-[#CEF03C] uppercase tracking-wider block font-mono">
                  4. What should you do?
                </span>
                <p className="text-sm font-semibold text-[#176B65] dark:text-[#CEF03C] leading-snug">
                  {selectedIncident?.advisory?.public_action || 'Proceed along normal routes.'}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-medium">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Show:</span>
              {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-[#111111] text-white dark:bg-[#FFFFFF] dark:text-[#0E131C] font-semibold'
                      : 'bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {sev === 'ALL'
                    ? 'All advisories'
                    : sev === 'RED'
                    ? 'High congestion'
                    : sev === 'YELLOW'
                    ? 'Moderate'
                    : 'Normal'}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#6B726C] dark:text-[#94A3B8]">
              <span>{filteredIncidents.length} locations reported</span>
              <button
                onClick={loadAdvisories}
                className="p-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
                title="Refresh advisories"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#176B65] dark:text-[#CEF03C]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main Grid: Interactive Map + Simple Incident Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Street Map (7 cols) - Clean OpenStreetMap, NO API Key watermark! */}
            <div className="lg:col-span-7 rounded-2xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] overflow-hidden shadow-xs flex flex-col">
              <div className="px-5 py-3 border-b border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#121722] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#176B65] dark:bg-[#CEF03C]" />
                  <span className="font-semibold text-[#111111] dark:text-white">Live Street Map</span>
                  <span className="text-[#6B726C] dark:text-[#94A3B8] font-mono text-[11px] hidden sm:inline">• {selectedCity}</span>
                </div>

                <div className="flex items-center space-x-1.5 bg-[#ECEAE5] dark:bg-[#1C2638] p-1 rounded-lg">
                  <button
                    onClick={() => setMapStyle('street')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      mapStyle === 'street'
                        ? 'bg-[#FFFFFF] dark:bg-[#253144] text-[#176B65] dark:text-[#CEF03C] shadow-2xs font-semibold'
                        : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    Street
                  </button>
                  <button
                    onClick={() => setMapStyle('dark')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      mapStyle === 'dark'
                        ? 'bg-[#FFFFFF] dark:bg-[#253144] text-[#176B65] dark:text-[#CEF03C] shadow-2xs font-semibold'
                        : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setMapStyle('topo')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      mapStyle === 'topo'
                        ? 'bg-[#FFFFFF] dark:bg-[#253144] text-[#176B65] dark:text-[#CEF03C] shadow-2xs font-semibold'
                        : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    Topo
                  </button>
                </div>
              </div>

              <div className="h-[440px] w-full relative">
                <MapContainer
                  center={activeCenter}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <ChangeMapView center={activeCenter} />
                  <MapAutoResizer />

                  {/* Real World Geographic Map Tiles - Fast, 100% Free, Zero Watermarks */}
                  <TileLayer
                    key={mapStyle}
                    attribution={MAP_TILES[mapStyle]?.attribution || MAP_TILES.street.attribution}
                    url={MAP_TILES[mapStyle]?.url || MAP_TILES.street.url}
                    maxZoom={MAP_TILES[mapStyle]?.maxZoom || 19}
                  />

                  {/* User GPS Pin */}
                  {userCoords && (
                    <Marker
                      position={[userCoords.lat, userCoords.lng]}
                      icon={createUserLocationIcon()}
                    >
                      <Popup>
                        <div className="text-xs p-1">
                          <strong>Your Location</strong>
                          <div className="text-[#6B726C] mt-0.5">Approximate device position</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Verified Incident Markers */}
                  {filteredIncidents.map((inc) => (
                    <Marker
                      key={inc.id}
                      position={[inc.lat, inc.lng]}
                      icon={createSeverityIcon(inc.severity)}
                      eventHandlers={{
                        click: () => setSelectedIncident(inc),
                      }}
                    >
                      <Popup>
                        <div className="text-xs p-1 max-w-[220px]">
                          <span
                            className={`text-[10px] font-semibold uppercase ${
                              inc.severity === 'RED'
                                ? 'text-[#C94C4C]'
                                : inc.severity === 'YELLOW'
                                ? 'text-[#D69B32]'
                                : 'text-[#38845B]'
                            }`}
                          >
                            {inc.severity === 'RED' ? 'High Congestion' : 'Moderate Flow'}
                          </span>
                          <div className="font-semibold text-[#111111] mt-1">{inc.title}</div>
                          <div className="text-[#6B726C] text-[11px] mt-0.5">{inc.locality}</div>
                          {inc.advisory && (
                            <div className="mt-2 pt-1 border-t border-[#DFE2DC] text-[11px] text-[#176B65]">
                              {inc.advisory.public_action}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="px-5 py-2.5 border-t border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#121722] text-[11px] text-[#6B726C] dark:text-[#94A3B8] flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C94C4C]" />
                    <span>High Congestion</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D69B32]" />
                    <span>Moderate</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#38845B]" />
                    <span>Normal</span>
                  </span>
                </div>
                <span>Click marker to inspect advisory</span>
              </div>
            </div>

            {/* Right: Clean Incident Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#111111] dark:text-white">
                  Active Area Advisories ({filteredIncidents.length})
                </h3>
                <span className="text-xs text-[#6B726C] dark:text-[#94A3B8]">Sorted by proximity</span>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="p-8 rounded-2xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] text-center text-xs text-[#6B726C] dark:text-[#94A3B8] space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-[#38845B] mx-auto" />
                  <p className="text-[#111111] dark:text-white font-semibold">All corridors clear in {selectedCity}</p>
                  <p className="text-[11px]">No active crowd congestion or safety hazards flagged.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                  {filteredIncidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id
                    const isRed = inc.severity === 'RED'
                    const isYellow = inc.severity === 'YELLOW'

                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#176B65] dark:border-[#CEF03C] bg-[#FFFFFF] dark:bg-[#161D29] shadow-md ring-1 ring-[#176B65]/20 dark:ring-[#CEF03C]/30'
                            : 'border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] hover:border-[#176B65]/40'
                        }`}
                      >
                        {/* Top status & distance badge */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              isRed
                                ? 'bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/25'
                                : isYellow
                                ? 'bg-[#D69B32]/10 text-[#D69B32] border border-[#D69B32]/25'
                                : 'bg-[#38845B]/10 text-[#38845B] border border-[#38845B]/25'
                            }`}
                          >
                            {isRed ? 'Red Alert' : isYellow ? 'Moderate Congestion' : 'Normal Flow'}
                          </span>

                          <span className="text-xs font-semibold text-[#176B65] dark:text-[#CEF03C]">
                            {inc.distance_km ? `${inc.distance_km} km away` : '2.4 km away'}
                          </span>
                        </div>

                        {/* Title & location */}
                        <div className="mt-3">
                          <h4 className="text-base font-semibold text-[#111111] dark:text-white leading-snug">
                            {inc.title}
                          </h4>
                          <p className="text-xs text-[#6B726C] dark:text-[#94A3B8] mt-0.5">
                            Near {inc.locality}, {inc.city}
                          </p>
                        </div>

                        {/* Directive Action Box */}
                        <div className="mt-3 p-3 rounded-xl bg-[#F6F5F0] dark:bg-[#111722] border border-[#D8D6CE] dark:border-[#253144] text-xs text-[#111111] dark:text-slate-200 leading-relaxed font-sans">
                          {inc.advisory?.public_action || 'Avoid the affected entrance. Follow local authority instructions.'}
                        </div>

                        {/* Footer: Timestamp, Demo data, and Details Link */}
                        <div className="mt-3 pt-3 border-t border-[#D8D6CE] dark:border-[#253144] flex items-center justify-between text-xs text-[#6B726C] dark:text-[#94A3B8]">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Updated {new Date(inc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>

                          <Link
                            to={`/public/incident/${inc.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-[#176B65] dark:text-[#CEF03C] hover:underline inline-flex items-center space-x-1"
                          >
                            <span>Full advisory</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
