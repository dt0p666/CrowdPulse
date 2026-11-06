import React, { useState, useEffect } from 'react'
import {
  Send,
  Radio,
  MapPin,
  CheckCircle2,
  Shield,
  Smartphone,
  AlertTriangle,
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
      setSuccessMsg('Advisory broadcasted to citizens in the designated perimeter.')
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-white tracking-tight flex items-center space-x-2">
            <Radio className="w-5 h-5 text-amber-500" />
            <span>Broadcast Public Safety Advisory</span>
          </h1>
          <p className="text-sm text-[#6B726C] dark:text-slate-400 mt-0.5">
            Draft, review, and geofence official crowd-divergence alerts directly to the citizen portal.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl border border-[#38845B]/40 bg-[#38845B]/10 text-emerald-600 dark:text-emerald-300 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] p-6 shadow-xl space-y-5 transition-colors">
            <h2 className="font-semibold text-[#111111] dark:text-white text-base flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#176B65]" />
              <span>Advisory Composition</span>
            </h2>

            <form onSubmit={handlePublish} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#6B726C] dark:text-slate-400 mb-1.5">Target Location & Incident</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => handleIncidentSelect(e.target.value)}
                  className="w-full bg-[#F6F5F0] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] rounded-xl p-3 text-[#111111] dark:text-white focus:outline-none focus:border-[#176B65]"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.severity}] {inc.title} — {inc.locality}, {inc.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B726C] dark:text-slate-400 mb-1.5">Broadcast Headline (Clear & Practical)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                  placeholder="e.g., Extreme Congestion: Avoid Main Concourse"
                  className="w-full bg-[#F6F5F0] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] rounded-xl p-3 text-[#111111] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#176B65]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B726C] dark:text-slate-400 mb-1.5">Recommended Public Action</label>
                <textarea
                  value={publicAction}
                  onChange={(e) => setPublicAction(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g., Avoid Station North Exit. Emergency services deployed; please divert via Shivaji Bridge."
                  className="w-full bg-[#F6F5F0] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] rounded-xl p-3 text-[#111111] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#176B65] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B726C] dark:text-slate-400 mb-1.5">Urgency Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#F6F5F0] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] rounded-xl p-3 text-[#111111] dark:text-white focus:outline-none focus:border-[#176B65]"
                  >
                    <option value="YELLOW">Advisory (Elevated Congestion)</option>
                    <option value="RED">High Warning (Critical Avoidance)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#6B726C] dark:text-slate-400">Broadcast Radius</label>
                    <span className="text-xs font-bold text-[#176B65] dark:text-teal-400">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-[#176B65] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F5F0] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] text-xs text-[#6B726C] dark:text-slate-400 flex items-center justify-between">
                <span>Authorized Officer: <strong className="text-[#111111] dark:text-white">{user?.name || 'Insp. Rajesh Deshmukh'}</strong></span>
                <span>Badge: <strong className="text-[#111111] dark:text-white">{user?.badgeId || 'MH-PN-2041'}</strong></span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Transmitting Geofenced Broadcast...' : 'Broadcast Public Safety Advisory'}</span>
              </button>
            </form>
          </div>

          {/* Right Live Citizen Preview (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] p-6 shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[#D8D6CE] dark:border-[#253144] pb-3">
              <span className="text-xs font-semibold text-[#111111] dark:text-slate-300 flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#176B65] dark:text-teal-400" />
                <span>Citizen Live Preview</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 dark:border-emerald-800">
                Live Public View
              </span>
            </div>

            <p className="text-xs text-slate-400">
              This is how your advisory appears to citizens in {selectedIncident?.city || 'Pune'} on smartphones and browsers.
            </p>

            {/* True Civic Card Preview (Warm Off-white styling) */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DFE2DC] shadow-md space-y-3.5 text-[#202522]">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    severity === 'RED'
                      ? 'bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/20'
                      : 'bg-[#D69B32]/10 text-[#D69B32] border border-[#D69B32]/20'
                  }`}
                >
                  {severity === 'RED' ? 'High Warning' : 'Safety Advisory'}
                </span>
                <span className="text-xs text-[#777D78]">Just now</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#202522] leading-snug">
                  {headline || 'Advisory Headline'}
                </h3>
                <p className="text-xs text-[#777D78] mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#176B65] shrink-0" />
                  <span>{selectedIncident?.locality || 'Selected Area'}, {selectedIncident?.city || 'City'}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F5F0] border border-[#DFE2DC] space-y-1">
                <div className="text-[11px] font-bold text-[#176B65] uppercase tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>What should you do?</span>
                </div>
                <div className="text-xs text-[#202522] leading-relaxed">
                  {publicAction || 'Specific safety guidance will appear here.'}
                </div>
              </div>

              <div className="pt-2 border-t border-[#DFE2DC] flex items-center justify-between text-xs text-[#777D78]">
                <span>Pune Emergency Operations</span>
                <span className="font-semibold text-[#176B65]">Within {radiusKm} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
