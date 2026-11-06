import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  RefreshCw,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import {
  fetchIncidents,
  verifyIncident,
  resolveIncident,
  publishAdvisory,
  type Incident,
} from '../../services/api'
import { getCurrentUser } from '../../services/auth'

export const IncidentManagementPage: React.FC = () => {
  const user = getCurrentUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [activeTab, setActiveTab] = useState<'AWAITING_REVIEW' | 'VERIFIED' | 'RESOLVED'>('AWAITING_REVIEW')

  // Verification modal state
  const [verifyingModalOpen, setVerifyingModalOpen] = useState(false)
  const [verifyDecision, setVerifyDecision] = useState<'verified' | 'dismissed'>('verified')
  const [officerNotes, setOfficerNotes] = useState('')

  // Resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [resolveNotes, setResolveNotes] = useState('')

  // Advisory modal state
  const [advisoryModalOpen, setAdvisoryModalOpen] = useState(false)
  const [advHeadline, setAdvHeadline] = useState('')
  const [advAction, setAdvAction] = useState('')
  const [advSeverity, setAdvSeverity] = useState('RED')
  const [advRadius, setAdvRadius] = useState(2.5)

  const [actionLoading, setActionLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const loadIncidents = async () => {
    try {
      setLoading(true)
      const data = await fetchIncidents()
      setIncidents(data)
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0])
      }
    } catch (err) {
      console.error('Failed to load incidents', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
  }, [])

  const handleVerifySubmit = async () => {
    if (!selectedIncident) return
    setActionLoading(true)
    try {
      const updated = await verifyIncident(selectedIncident.id, {
        decision: verifyDecision,
        officer_name: user?.name || 'Insp. Rajesh Deshmukh',
        officer_badge: user?.badgeId || 'MH-PN-2041',
        notes: officerNotes || 'Verified via corridor surveillance feed.',
      })
      setSelectedIncident(updated)
      setStatusMessage(`Incident successfully marked as ${verifyDecision}.`)
      setVerifyingModalOpen(false)
      setOfficerNotes('')
      await loadIncidents()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveSubmit = async () => {
    if (!selectedIncident) return
    setActionLoading(true)
    try {
      const updated = await resolveIncident(selectedIncident.id, {
        officer_name: user?.name || 'Insp. Rajesh Deshmukh',
        resolution_notes: resolveNotes || 'Pedestrian density returned to nominal. Choke point cleared.',
      })
      setSelectedIncident(updated)
      setStatusMessage('Incident successfully marked as resolved.')
      setResolveModalOpen(false)
      setResolveNotes('')
      await loadIncidents()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAdvisorySubmit = async () => {
    if (!selectedIncident) return
    setActionLoading(true)
    try {
      const updated = await publishAdvisory(selectedIncident.id, {
        headline: advHeadline || selectedIncident.title,
        public_action: advAction || 'Divert to alternate corridors; avoid active bottlenecks.',
        severity: advSeverity,
        affected_radius_km: advRadius,
        officer_name: user?.name || 'Insp. Rajesh Deshmukh',
      })
      setSelectedIncident(updated)
      setStatusMessage('Public safety advisory broadcasted live.')
      setAdvisoryModalOpen(false)
      await loadIncidents()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    if (activeTab === 'AWAITING_REVIEW') {
      return inc.status === 'detected_by_system' || inc.status === 'awaiting_review'
    }
    if (activeTab === 'VERIFIED') {
      return inc.status === 'verified' || inc.status === 'advisory_published'
    }
    if (activeTab === 'RESOLVED') {
      return inc.status === 'resolved' || inc.status === 'dismissed'
    }
    return true
  })

  return (
    <AuthorityLayout breadcrumb="Incident Verification Queue">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#253144] pb-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#176B65]" />
              <span>Incident Verification & Response Queue</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review flagged crowd conditions, confirm footage observations, and dispatch public advisories.
            </p>
          </div>

          <button
            onClick={loadIncidents}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#161D29] border border-[#253144] hover:border-[#176B65] text-xs font-medium text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#176B65]' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl border border-[#38845B]/40 bg-[#38845B]/10 text-[#D1EBDD] text-xs flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-[#A8B9A7] font-semibold ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('AWAITING_REVIEW')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'AWAITING_REVIEW'
                ? 'bg-[#176B65] text-white'
                : 'text-slate-400 hover:text-white bg-[#161D29] border border-[#253144]'
            }`}
          >
            Awaiting Review ({incidents.filter((i) => i.status === 'detected_by_system' || i.status === 'awaiting_review').length})
          </button>

          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'VERIFIED'
                ? 'bg-[#176B65] text-white'
                : 'text-slate-400 hover:text-white bg-[#161D29] border border-[#253144]'
            }`}
          >
            Active & Verified ({incidents.filter((i) => i.status === 'verified' || i.status === 'advisory_published').length})
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'RESOLVED'
                ? 'bg-[#176B65] text-white'
                : 'text-slate-400 hover:text-white bg-[#161D29] border border-[#253144]'
            }`}
          >
            Closed ({incidents.filter((i) => i.status === 'resolved' || i.status === 'dismissed').length})
          </button>
        </div>

        {/* Main Grid: Queue List + Detailed Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Queue items (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#161D29] border border-[#253144] text-center text-xs text-slate-500">
                No incidents in this status queue.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B2333] border-[#176B65] shadow-xs ring-1 ring-[#176B65]/30'
                        : 'bg-[#161D29] border-[#253144] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          inc.severity === 'RED'
                            ? 'bg-[#C94C4C]/20 text-[#F8D7D7]'
                            : inc.severity === 'YELLOW'
                            ? 'bg-[#D69B32]/20 text-[#FBEAC9]'
                            : 'bg-[#38845B]/20 text-[#D1EBDD]'
                        }`}
                      >
                        {inc.severity === 'RED' ? 'Critical' : inc.severity === 'YELLOW' ? 'Moderate' : 'Normal'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-white leading-snug">{inc.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{inc.locality}, {inc.city}</p>

                    <div className="mt-3 pt-2 border-t border-[#253144] flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 capitalize">{inc.status.replace(/_/g, ' ')}</span>
                      {inc.is_verified ? (
                        <span className="text-[#38845B] flex items-center space-x-1 font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[#D69B32] font-medium">Needs Review</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right: Detailed Inspection & Operational Actions (7 cols) */}
          <div className="lg:col-span-7">
            {selectedIncident ? (
              <div className="rounded-xl bg-[#161D29] border border-[#253144] p-6 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#253144] pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          selectedIncident.severity === 'RED'
                            ? 'bg-[#C94C4C]/20 text-[#F8D7D7]'
                            : selectedIncident.severity === 'YELLOW'
                            ? 'bg-[#D69B32]/20 text-[#FBEAC9]'
                            : 'bg-[#38845B]/20 text-[#D1EBDD]'
                        }`}
                      >
                        {selectedIncident.severity}
                      </span>
                      <span className="text-xs text-slate-500">Record #{selectedIncident.id}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-white">{selectedIncident.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedIncident.locality}, {selectedIncident.city}, {selectedIncident.state}
                    </p>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Verify button */}
                    {!selectedIncident.is_verified && selectedIncident.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setVerifyDecision('verified')
                          setVerifyingModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Incident</span>
                      </button>
                    )}

                    {/* Publish / update advisory */}
                    {selectedIncident.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setAdvHeadline(selectedIncident.title)
                          setAdvAction(selectedIncident.advisory?.public_action || 'Avoid active corridor.')
                          setAdvSeverity(selectedIncident.severity)
                          setAdvisoryModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1B2333] hover:bg-[#253144] text-slate-200 border border-[#2B3950] font-medium text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-[#176B65]" />
                        <span>{selectedIncident.advisory ? 'Update Advisory' : 'Draft Advisory'}</span>
                      </button>
                    )}

                    {/* Mark Resolved */}
                    {selectedIncident.status !== 'resolved' && (
                      <button
                        onClick={() => setResolveModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl border border-[#253144] text-slate-300 hover:text-white text-xs font-medium transition-colors"
                      >
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Supporting Sensor & CV Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Observed Movement Indicators
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#131924] border border-[#253144]">
                      <span className="text-[10px] text-slate-500 uppercase block">Detection Source</span>
                      <span className="text-white font-medium">{selectedIncident.source}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#131924] border border-[#253144]">
                      <span className="text-[10px] text-slate-500 uppercase block">Pedestrians Detected</span>
                      <span className="text-white font-semibold">
                        {selectedIncident.supporting_metrics?.detected_pedestrians || '142 count'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#131924] border border-[#253144]">
                      <span className="text-[10px] text-slate-500 uppercase block">Flow Congestion</span>
                      <span className="text-[#D69B32] font-semibold">
                        {selectedIncident.supporting_metrics?.conflict_index || '0.74 (Elevated)'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#131924] border border-[#253144]">
                      <span className="text-[10px] text-slate-500 uppercase block">Traversal Pace</span>
                      <span className="text-white font-semibold">
                        {selectedIncident.supporting_metrics?.velocity || '14.2 px/s'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Situation Details
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Current Active Advisory */}
                {selectedIncident.advisory && (
                  <div className="p-4 rounded-xl border border-[#176B65]/40 bg-[#176B65]/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#A8B9A7] font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <Send className="w-3.5 h-3.5 text-[#176B65]" />
                        <span>Active Public Advisory Broadcast</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedIncident.advisory.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">{selectedIncident.advisory.headline}</div>
                    <div className="text-slate-300">
                      <strong>Instructions:</strong> {selectedIncident.advisory.public_action}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Coverage: {selectedIncident.advisory.affected_radius_km} km radius • Issued by {selectedIncident.advisory.published_by}
                    </div>
                  </div>
                )}

                {/* Action Audit Timeline */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Response Timeline & Log
                  </h4>
                  <div className="space-y-3 border-l-2 border-[#253144] ml-2 pl-4 text-xs">
                    {selectedIncident.timeline_updates?.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#176B65]" />
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{item.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        {item.message && (
                          <p className="text-slate-400 text-xs mt-0.5">{item.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-xl bg-[#161D29] border border-[#253144] text-center text-xs text-slate-500">
                Select an incident from the queue to inspect.
              </div>
            )}
          </div>
        </div>

        {/* Verification Modal */}
        {verifyingModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-md w-full bg-[#161D29] border border-[#253144] rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <h3 className="font-semibold text-white text-base">Verify Incident Observation</h3>
              <p className="text-slate-400">
                Confirm whether footage observations indicate genuine crowd congestion for <strong>{selectedIncident.locality}</strong>.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('verified')}
                    className={`py-2 rounded-xl font-medium border transition-colors ${
                      verifyDecision === 'verified'
                        ? 'bg-[#176B65] text-white border-[#176B65]'
                        : 'bg-[#131924] text-slate-400 border-[#253144]'
                    }`}
                  >
                    Confirm Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('dismissed')}
                    className={`py-2 rounded-xl font-medium border transition-colors ${
                      verifyDecision === 'dismissed'
                        ? 'bg-[#C94C4C] text-white border-[#C94C4C]'
                        : 'bg-[#131924] text-slate-400 border-[#253144]'
                    }`}
                  >
                    Dismiss (False Alarm)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Officer Notes</label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g. Visual confirmation of bottlenecking at Deccan exit. Density exceeding safety threshold."
                  rows={3}
                  className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#176B65]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setVerifyingModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[#253144] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleVerifySubmit}
                  className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Commit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advisory Modal */}
        {advisoryModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-md w-full bg-[#161D29] border border-[#253144] rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <h3 className="font-semibold text-white text-base">Broadcast Public Safety Advisory</h3>
              <p className="text-slate-400">
                This advisory will appear immediately on the public portal for citizens within the selected radius.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Headline</label>
                <input
                  type="text"
                  value={advHeadline}
                  onChange={(e) => setAdvHeadline(e.target.value)}
                  className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Recommended Citizen Action</label>
                <textarea
                  value={advAction}
                  onChange={(e) => setAdvAction(e.target.value)}
                  placeholder="e.g. Avoid North concourse; proceed via Deccan Gymkhana connector."
                  rows={2}
                  className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Severity</label>
                  <select
                    value={advSeverity}
                    onChange={(e) => setAdvSeverity(e.target.value)}
                    className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2 text-white"
                  >
                    <option value="YELLOW">Moderate (Yellow)</option>
                    <option value="RED">Critical / Avoid (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Radius (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="15"
                    value={advRadius}
                    onChange={(e) => setAdvRadius(parseFloat(e.target.value))}
                    className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setAdvisoryModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[#253144] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleAdvisorySubmit}
                  className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Broadcasting...' : 'Broadcast to Public'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resolve Modal */}
        {resolveModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-md w-full bg-[#161D29] border border-[#253144] rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <h3 className="font-semibold text-white text-base">Resolve Incident</h3>
              <p className="text-slate-400">
                Marking this incident resolved will withdraw the active public warning and archive the event.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Resolution Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Swargate corridor crowd cleared; normal traffic flow restored."
                  rows={3}
                  className="w-full bg-[#131924] border border-[#253144] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setResolveModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[#253144] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleResolveSubmit}
                  className="px-4 py-2 rounded-xl bg-[#38845B] hover:bg-[#2F704D] text-white font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Closing...' : 'Close Incident'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthorityLayout>
  )
}
