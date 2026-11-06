import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import {
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  BellRing,
  HelpCircle,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { PublicLayout, INDIAN_CITIES } from '../../layouts/PublicLayout'
import {
  fetchPublicAdvisories,
  type Incident,
  type PublicAdvisoryResponse,
} from '../../services/api'
import { createSeverityIcon, createUserLocationIcon } from '../../utils/leafletIcons'

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
  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string>('')

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
          setNotificationStatusMsg('Using your device GPS position.')
        },
        () => {
          // If denied, fallback to Pune center with message
          setUserCoords({ lat: 18.5204, lng: 73.8567 })
          setNotificationStatusMsg('Location access denied. Using Pune Center.')
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
          setNotificationStatusMsg('Browser safety alerts enabled for your location.')
          new Notification('CrowdPulse Safety Network Active', {
            body: `You will now receive urgent warnings if critical crowd congestion occurs in ${selectedCity}.`,
          })
        } else {
          setNotificationStatusMsg('Browser alert permission was denied or dismissed.')
        }
      } catch (e) {
        setNotificationStatusMsg('Notifications are not supported in this environment.')
      }
    } else {
      setNotificationStatusMsg('Web notifications are not supported by your browser.')
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
      {/* Demonstration Data Warning Notice */}
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start space-x-3 text-xs font-mono text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <strong className="text-amber-300">DEMONSTRATION SAFETY PORTAL:</strong> All incident
          data, distances, and traffic advisories shown are simulated for crowd-safety response and
          evaluation purposes. In a real emergency, always follow municipal authority broadcasts and
          dial <strong>112</strong>.
        </div>
      </div>

      {/* Top Hero: 4 Core Questions Answering Banner */}
      <div className="mb-6 rounded-2xl border border-[#1e2638] bg-gradient-to-r from-[#0d121c] via-[#101726] to-[#0d121c] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>Real-Time Citizen Guidance • {selectedCity}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crowd-Safety Conditions Near You
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Verified updates from metropolitan safety and traffic monitoring centers. No technical
              jargon — plain guidance on crowd density and routes to avoid.
            </p>
          </div>

          {/* Quick Notification Permission Card */}
          <div className="shrink-0 p-4 rounded-xl border border-[#2c3852] bg-[#121620]/90 backdrop-blur-sm max-w-sm w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                <span>Urgent Safety Alerts</span>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  browserAlertsEnabled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {browserAlertsEnabled ? 'Active' : 'Standby'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Get notified immediately if high crowd risk or bottlenecks emerge near your location.
            </p>
            {!browserAlertsEnabled ? (
              <button
                onClick={handleEnableNotifications}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs transition-colors shadow"
              >
                Enable Notifications
              </button>
            ) : (
              <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Device connected to city alert feed</span>
              </div>
            )}
            {notificationStatusMsg && (
              <div className="text-[10px] font-mono text-cyan-300 italic">
                {notificationStatusMsg}
              </div>
            )}
          </div>
        </div>

        {/* 4 Questions Quick Summary Grid */}
        <div className="mt-6 pt-5 border-t border-[#1e2638] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2638]">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-cyan-400" />
              <span>1. WHAT IS HAPPENING?</span>
            </div>
            <div className="mt-1 text-xs text-white font-semibold line-clamp-2">
              {selectedIncident ? selectedIncident.title : 'No active incidents reported'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2638]">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>2. WHERE IS IT?</span>
            </div>
            <div className="mt-1 text-xs text-white font-semibold truncate">
              {selectedIncident
                ? `${selectedIncident.locality}, ${selectedIncident.city}`
                : selectedCity}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2638]">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>3. HOW CLOSE TO ME?</span>
            </div>
            <div className="mt-1 text-xs text-white font-semibold">
              {selectedIncident?.distance_km !== undefined && selectedIncident?.distance_km !== null
                ? `${selectedIncident.distance_km} km (approx. straight-line)`
                : 'Select GPS for distance'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0c10]/70 border border-[#1e2638]">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>4. WHAT SHOULD I DO?</span>
            </div>
            <div className="mt-1 text-xs text-cyan-300 font-bold line-clamp-2">
              {selectedIncident?.advisory?.public_action || 'Proceed along normal routes.'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-500 uppercase">Filter Severity:</span>
          {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
                filterSeverity === sev
                  ? sev === 'RED'
                    ? 'bg-rose-950 text-rose-300 border-rose-600'
                    : sev === 'YELLOW'
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : sev === 'GREEN'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-600'
                  : 'bg-[#121620] text-slate-400 border-[#1e2638] hover:border-slate-600'
              }`}
            >
              {sev === 'ALL' ? 'All Advisories' : sev}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span>{filteredIncidents.length} locations reported</span>
          <button
            onClick={loadAdvisories}
            className="p-1.5 rounded-lg bg-[#121620] border border-[#1e2638] hover:text-white transition-colors"
            title="Refresh advisories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split: Interactive Street Map + Incident Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Street Map (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1e2638] bg-[#0c0e14] overflow-hidden shadow-2xl flex flex-col min-h-[460px]">
          <div className="px-4 py-3 border-b border-[#1e2638] bg-[#10141f] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold text-white">LIVE GEOGRAPHIC INCIDENT MAP</span>
            </div>
            <span className="text-slate-400 text-[11px]">{selectedCity} Metro Grid</span>
          </div>

          <div className="flex-1 w-full relative min-h-[420px]">
            <MapContainer
              center={activeCenter}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', minHeight: '420px', width: '100%', background: '#0a0c10' }}
            >
              <ChangeMapView center={activeCenter} />
              {/* Dark CartoDB Style OpenStreetMap Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* User location pin if GPS provided */}
              {userCoords && (
                <Marker
                  position={[userCoords.lat, userCoords.lng]}
                  icon={createUserLocationIcon()}
                >
                  <Popup>
                    <div className="font-mono text-xs">
                      <strong>Your Approximate Location</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                      </div>
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
                    <div className="font-mono text-xs p-1 max-w-[220px]">
                      <div
                        className={`text-[10px] font-bold uppercase ${
                          inc.severity === 'RED'
                            ? 'text-rose-600'
                            : inc.severity === 'YELLOW'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {inc.severity} RISK
                      </div>
                      <div className="font-bold text-slate-900 mt-1">{inc.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{inc.locality}</div>
                      {inc.advisory && (
                        <div className="mt-2 pt-1 border-t border-slate-200 text-[11px] font-semibold text-cyan-800">
                          {inc.advisory.public_action}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="px-4 py-2 border-t border-[#1e2638] bg-[#0c0e14] text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>High Congestion (Avoid)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Elevated Volume</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Normal Flow</span>
              </span>
            </div>
            <span>Click any marker to inspect</span>
          </div>
        </div>

        {/* Right: Verified Incident Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              Verified Advisories ({filteredIncidents.length})
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Sorted by distance
            </span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#1e2638] bg-[#0c0e14] text-center font-mono text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-slate-300 font-bold">All areas normal in {selectedCity}</p>
              <p className="text-[11px]">No active crowd congestion or hazards flagged.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-[#121824] shadow-lg ring-1 ring-cyan-500/30'
                        : 'border-[#1e2638] bg-[#0d1017] hover:border-[#2c3852] hover:bg-[#10141f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            inc.severity === 'RED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : inc.severity === 'YELLOW'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {inc.severity} RISK
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(inc.updated_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {inc.distance_km !== undefined && inc.distance_km !== null && (
                        <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          ~{inc.distance_km} km away
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-white leading-snug">{inc.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{inc.locality}</p>

                    {/* Official Action Box */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#080a0e] border border-[#1e2638] space-y-1">
                      <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        Recommended Action:
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed">
                        {inc.advisory?.public_action || 'Proceed with normal caution.'}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#1e2638] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        {inc.advisory?.published_by || 'Metropolitan Police Control'}
                      </span>

                      <Link
                        to={`/public/incident/${inc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Details & Updates</span>
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
    </PublicLayout>
  )
}
