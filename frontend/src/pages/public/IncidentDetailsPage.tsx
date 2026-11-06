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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/public"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#176B65] hover:text-[#12544F] transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all advisories</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#777D78]">
            Loading advisory details...
          </div>
        ) : error || !incident ? (
          <div className="p-8 rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] text-[#C94C4C] text-xs text-center">
            {error || 'Incident not found.'}
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      incident.severity === 'RED'
                        ? 'bg-[#FDF2F2] text-[#C94C4C]'
                        : incident.severity === 'YELLOW'
                        ? 'bg-[#FEF8ED] text-[#D69B32]'
                        : 'bg-[#EEF7F2] text-[#38845B]'
                    }`}
                  >
                    {incident.severity === 'RED' ? 'Red Alert' : 'Moderate Congestion'}
                  </span>

                  {incident.is_verified && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-[#EBF4F3] text-[#176B65]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Officially Verified</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#DFE2DC] text-xs font-medium text-[#777D78] hover:text-[#202522] hover:border-[#CBD0C8] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied!' : 'Share advisory'}</span>
                </button>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#202522]">
                  {incident.advisory?.headline || incident.title}
                </h1>
                <p className="mt-1 text-sm text-[#777D78] flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#176B65] shrink-0" />
                  <span>
                    Near {incident.locality}, {incident.city}, {incident.state}
                  </span>
                </p>
              </div>

              {/* Action Directive Highlight */}
              <div className="p-5 rounded-xl border border-[#DFE2DC] bg-[#F6F5F0] space-y-1.5">
                <div className="text-xs font-semibold text-[#176B65] uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#176B65]" />
                  <span>What should you do?</span>
                </div>
                <div className="text-sm text-[#202522] font-medium leading-relaxed">
                  {incident.advisory?.public_action ||
                    'Avoid the affected entrance. Follow local authority instructions.'}
                </div>
              </div>
            </div>

            {/* Middle Grid: Map + Authority Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clean Map View - OpenStreetMap with NO API key required watermark! */}
              <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] overflow-hidden flex flex-col shadow-xs">
                <div className="px-4 py-3 bg-[#FBFBF9] border-b border-[#DFE2DC] text-xs font-semibold text-[#202522]">
                  Affected Area Perimeter
                </div>
                <div className="h-64 w-full">
                  <MapContainer
                    center={[incident.lat, incident.lng]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[incident.lat, incident.lng]}
                      icon={createSeverityIcon(incident.severity)}
                    >
                      <Popup>
                        <div className="text-xs">
                          <strong>{incident.locality}</strong>
                          <div>{incident.title}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="p-3 text-[11px] text-[#777D78] bg-[#FBFBF9]">
                  Observation radius: ~{incident.advisory?.affected_radius_km || 2.0} km perimeter.
                </div>
              </div>

              {/* Official Record */}
              <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
                <div className="text-xs font-semibold text-[#202522] border-b border-[#DFE2DC] pb-2">
                  Official Record Information
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#777D78] block text-[10px] uppercase font-medium">Verifying Authority</span>
                    <span className="text-[#202522] font-semibold">
                      {incident.advisory?.published_by || 'Pune Police Traffic & Safety Command'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#777D78] block text-[10px] uppercase font-medium">Current Status</span>
                    <span className="text-[#38845B] font-semibold capitalize">{incident.status.replace(/_/g, ' ')}</span>
                  </div>

                  <div>
                    <span className="text-[#777D78] block text-[10px] uppercase font-medium">Initial Detection</span>
                    <span className="text-[#202522]">{incident.source}</span>
                  </div>

                  <div>
                    <span className="text-[#777D78] block text-[10px] uppercase font-medium">Situation Summary</span>
                    <p className="text-[#777D78] leading-relaxed mt-0.5">
                      {incident.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202522] flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#176B65]" />
                <span>Incident Updates</span>
              </h3>

              <div className="space-y-4 border-l-2 border-[#DFE2DC] ml-2 pl-4">
                {incident.timeline_updates && incident.timeline_updates.length > 0 ? (
                  incident.timeline_updates.map((upd, idx) => (
                    <div key={idx} className="relative text-xs space-y-1">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#176B65]" />
                      <div className="flex items-center space-x-2">
                        <span className="text-[#202522] font-semibold">{upd.action || 'Status Update'}</span>
                        <span className="text-[10px] text-[#777D78]">
                          {new Date(upd.timestamp || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[#777D78] leading-relaxed">
                        {upd.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#777D78]">
                    No historical updates logged.
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Numbers */}
            <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#D69B32] shrink-0" />
                <div>
                  <div className="font-semibold text-[#202522]">Need Immediate Help?</div>
                  <div className="text-[#777D78] text-[11px]">Free 24x7 emergency response across India</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-[#C94C4C] hover:bg-[#B33F3F] text-white font-medium transition-colors"
                >
                  Dial 112 (National)
                </a>
                <a
                  href="tel:100"
                  className="px-4 py-2 rounded-xl border border-[#DFE2DC] text-[#202522] hover:bg-[#F6F5F0] font-medium transition-colors"
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
