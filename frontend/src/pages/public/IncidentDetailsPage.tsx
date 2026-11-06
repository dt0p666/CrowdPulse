import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  Share2,
} from 'lucide-react'
import { PublicLayout } from '../../layouts/PublicLayout'
import { fetchIncident, type Incident } from '../../services/api'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createSeverityIcon } from '../../utils/leafletIcons'

export const IncidentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchIncident(id)
      .then((data) => {
        setIncident(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Incident not found')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <PublicLayout
      selectedCity={incident?.city || 'Pune'}
      onSelectCity={() => {}}
      onUseGPS={() => {}}
      overallStatus={incident?.severity || 'GREEN'}
      activeAlertsCount={incident?.severity === 'RED' ? 1 : 0}
      notifications={[]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <div>
          <Link
            to="/public"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to City Advisories</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-slate-500">
            Loading incident advisory details...
          </div>
        ) : error || !incident ? (
          <div className="p-8 rounded-2xl border border-rose-900 bg-rose-950/20 text-rose-300 font-mono text-xs text-center">
            {error || 'Incident not found.'}
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="rounded-2xl border border-[#1e2638] bg-[#0c0e14] p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      incident.severity === 'RED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : incident.severity === 'YELLOW'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {incident.severity} ADVISORY
                  </span>

                  {incident.is_verified && (
                    <span className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>OFFICIALLY VERIFIED</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121620] border border-[#2c3852] text-xs font-mono text-slate-300 hover:border-cyan-500 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Advisory'}</span>
                  </button>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {incident.advisory?.headline || incident.title}
                </h1>
                <p className="mt-1 text-sm text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    {incident.locality}, {incident.city}, {incident.state}
                  </span>
                </p>
              </div>

              {/* Action Directive Highlight */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-1.5">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <span>WHAT SHOULD YOU DO?</span>
                </div>
                <div className="text-sm font-semibold text-white leading-relaxed">
                  {incident.advisory?.public_action ||
                    'Proceed with caution and allow emergency responders clear passage.'}
                </div>
              </div>
            </div>

            {/* Middle Grid: Detailed Location Map & Response Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Map View */}
              <div className="rounded-2xl border border-[#1e2638] bg-[#0c0e14] overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-[#10141f] border-b border-[#1e2638] font-mono text-xs font-bold text-slate-300">
                  AFFECTED LOCATION PERIMETER
                </div>
                <div className="h-64 w-full">
                  <MapContainer
                    center={[incident.lat, incident.lng]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker
                      position={[incident.lat, incident.lng]}
                      icon={createSeverityIcon(incident.severity)}
                    >
                      <Popup>
                        <div className="font-mono text-xs">
                          <strong>{incident.locality}</strong>
                          <div>{incident.title}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-3 text-[11px] font-mono text-slate-400 bg-[#0c0e14]">
                  Radius: ~{incident.advisory?.affected_radius_km || 2.0} km perimeter under crowd
                  divergence observation.
                </div>
              </div>

              {/* Verified Authority Details */}
              <div className="rounded-2xl border border-[#1e2638] bg-[#0c0e14] p-5 space-y-4">
                <div className="font-mono text-xs font-bold text-slate-300 border-b border-[#1e2638] pb-2">
                  OFFICIAL METROPOLITAN RECORD
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">VERIFYING AUTHORITY</span>
                    <span className="text-white font-bold">
                      {incident.advisory?.published_by || 'Pune Police Traffic & Safety Command'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">CURRENT STATUS</span>
                    <span className="text-emerald-400 font-bold uppercase">{incident.status}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">INITIAL OBSERVATION</span>
                    <span className="text-slate-300">{incident.source}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">INCIDENT OVERVIEW</span>
                    <p className="text-slate-300 leading-relaxed font-sans mt-0.5">
                      {incident.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Updates */}
            <div className="rounded-2xl border border-[#1e2638] bg-[#0c0e14] p-6 space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>CHRONOLOGICAL INCIDENT TIMELINE</span>
              </h3>

              <div className="space-y-4 border-l-2 border-[#1e2638] ml-2 pl-4">
                {incident.timeline_updates && incident.timeline_updates.length > 0 ? (
                  incident.timeline_updates.map((upd, idx) => (
                    <div key={idx} className="relative font-mono text-xs space-y-1">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-cyan-500 border-2 border-[#0c0e14]" />
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{upd.action}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(upd.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">by {upd.author}</span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans leading-relaxed">
                        {upd.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-mono text-slate-500">
                    No timeline records logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Hotline Shortcuts */}
            <div className="rounded-2xl border border-[#1e2638] bg-[#10141f] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Need Immediate Physical Assistance?</div>
                  <div className="text-slate-400 text-[11px]">
                    Free 24x7 Emergency Helpline across all Indian States
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="tel:112"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                >
                  Dial 112 (National)
                </a>
                <a
                  href="tel:100"
                  className="px-3 py-1.5 rounded-lg bg-[#171d2b] hover:bg-[#202738] text-slate-200 border border-[#2c3852] font-bold transition-colors"
                >
                  Dial 100 (Police)
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  )
}
