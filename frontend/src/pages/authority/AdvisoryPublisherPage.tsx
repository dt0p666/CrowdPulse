import React, { useState, useEffect } from 'react'
import {
  Send,
  Radio,
  MapPin,
  CheckCircle2,
  Shield,
  Smartphone,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import {
  fetchIncidents,
  publishAdvisory,
  type Incident,
} from '../../services/api'
import { getCurrentUser } from '../../services/auth'

export const AdvisoryPublisherPage: React.FC = () => {
  const user = getCurrentUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('')
  const [headline, setHeadline] = useState('')
  const [publicAction, setPublicAction] = useState('')
  const [severity, setSeverity] = useState<'YELLOW' | 'RED'>('RED')
  const [radiusKm, setRadiusKm] = useState<number>(2.5)
  const [loading, setLoading] = useState<boolean>(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchIncidents().then((data) => {
      setIncidents(data)
      if (data.length > 0) {
        setSelectedIncidentId(data[0].id)
        setHeadline(data[0].title)
        setPublicAction(data[0].advisory?.public_action || 'Avoid active corridor. Use alternate street exits.')
        setSeverity(data[0].severity === 'RED' ? 'RED' : 'YELLOW')
      }
    })
  }, [])

  const handleIncidentSelect = (id: string) => {
    setSelectedIncidentId(id)
    const inc = incidents.find((i) => i.id === id)
    if (inc) {
      setHeadline(inc.title)
      setPublicAction(inc.advisory?.public_action || 'Avoid active corridor. Proceed calmly via alternate exits.')
      setSeverity(inc.severity === 'RED' ? 'RED' : 'YELLOW')
      if (inc.advisory?.affected_radius_km) {
        setRadiusKm(inc.advisory.affected_radius_km)
      }
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncidentId) return

    setLoading(true)
    setSuccessMsg(null)
    try {
      await publishAdvisory(selectedIncidentId, {
        headline,
        public_action: publicAction,
        severity,
        affected_radius_km: radiusKm,
        officer_name: user?.name || 'Insp. Rajesh Deshmukh',
      })
      setSuccessMsg('Advisory successfully broadcasted to all citizens in the target perimeter.')
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId)

  return (
    <AuthorityLayout breadcrumb="Broadcast Public Advisory">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>Public Safety Advisory Broadcast Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Draft, review, and geofence official crowd-divergence alerts directly to the citizen portal.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-800 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0e111a] border border-[#1b2233] p-6 shadow-xl space-y-5">
            <h2 className="font-mono font-bold text-white text-sm uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Advisory Composition</span>
            </h2>

            <form onSubmit={handlePublish} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">TARGET INCIDENT LOCATION</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => handleIncidentSelect(e.target.value)}
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.severity}] {inc.title} — {inc.locality}, {inc.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">BROADCAST HEADLINE (PLAIN-ENGLISH)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                  placeholder="e.g. Extreme Congestion: Avoid Main Concourse"
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RECOMMENDED CITIZEN ACTIONS</label>
                <textarea
                  value={publicAction}
                  onChange={(e) => setPublicAction(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Avoid Station North Exit. Emergency services deployed; please divert via Shivaji Bridge."
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">URGENCY SEVERITY</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white"
                  >
                    <option value="YELLOW">YELLOW (Elevated Congestion)</option>
                    <option value="RED">RED (Critical Avoidance / Danger)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    GEOFENCE RADIUS: <strong className="text-cyan-400">{radiusKm} km</strong>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090b10] border border-[#1b2233] text-[11px] text-slate-400">
                Authorized Officer: <strong className="text-white">{user?.name || 'Insp. Rajesh Deshmukh'}</strong> • Badge: <strong className="text-white">{user?.badgeId || 'MH-PN-2041'}</strong>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-950 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Transmitting Geofenced Broadcast...' : 'Broadcast Public Safety Advisory'}</span>
              </button>
            </form>
          </div>

          {/* Right Live Citizen Preview (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0e111a] border border-[#1b2233] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
              <span className="font-mono text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>CITIZEN FEED LIVE PREVIEW</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                WYSIWYG
              </span>
            </div>

            <p className="text-[11px] font-mono text-slate-400">
              This card renders exactly how an ordinary person in {selectedIncident?.city || 'Pune'} will see the warning on their smartphone or browser.
            </p>

            {/* Mock Citizen Card */}
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-[#121824] space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    severity === 'RED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {severity} ADVISORY
                </span>
                <span className="text-[10px] font-mono text-slate-400">Just Now</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {headline || 'Advisory Headline'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{selectedIncident?.locality || 'Selected Locality'}, {selectedIncident?.city || 'City'}</span>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080b10] border border-[#1b2233] space-y-1">
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  WHAT SHOULD YOU DO?
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">
                  {publicAction || 'Specific safety guidance will appear here.'}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1b2233] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>By Pune Traffic & Safety Command</span>
                <span className="text-cyan-400 font-bold">~1.2 km away</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
