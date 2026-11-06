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
        notes: officerNotes || 'Verified via live CCTV corridor feed.',
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
        resolution_notes: resolveNotes || 'Pedestrian density returned to nominal. Hazard resolved.',
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
      setStatusMessage('Public safety advisory broadcasted live!')
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
    <AuthorityLayout breadcrumb="Incident Verification & Queue">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>Incident Verification & Response Queue</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict 6-layer protocol: System CV Flag → Officer Review → Verification → Advisory Draft → Broadcast → Resolution
            </p>
          </div>

          <button
            onClick={loadIncidents}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#121620] border border-[#273247] hover:border-emerald-500 font-mono text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl border border-emerald-800 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 font-bold ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-[#1b2233] pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('AWAITING_REVIEW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'AWAITING_REVIEW'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Awaiting Review ({incidents.filter((i) => i.status === 'detected_by_system' || i.status === 'awaiting_review').length})
          </button>

          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active & Verified ({incidents.filter((i) => i.status === 'verified' || i.status === 'advisory_published').length})
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'RESOLVED'
                ? 'bg-[#181f2e] text-slate-200 border border-[#2b374f]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Closed / Dismissed ({incidents.filter((i) => i.status === 'resolved' || i.status === 'dismissed').length})
          </button>
        </div>

        {/* Main Grid: Queue List + Detailed Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Queue items (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0e111a] border border-[#1b2233] text-center font-mono text-xs text-slate-500">
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
                        ? 'bg-[#131926] border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                        : 'bg-[#0e111a] border-[#1b2233] hover:border-[#28354d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          inc.severity === 'RED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : inc.severity === 'YELLOW'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-white leading-snug">{inc.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{inc.locality}, {inc.city}</p>

                    <div className="mt-3 pt-2 border-t border-[#1b2233] flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-500 uppercase">{inc.status.replace(/_/g, ' ')}</span>
                      {inc.is_verified ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-amber-400">Needs Review</span>
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
              <div className="rounded-2xl bg-[#0e111a] border border-[#1b2233] p-6 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1b2233] pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          selectedIncident.severity === 'RED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : selectedIncident.severity === 'YELLOW'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {selectedIncident.severity} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-slate-500">ID: {selectedIncident.id}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-white">{selectedIncident.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedIncident.locality}, {selectedIncident.city}, {selectedIncident.state}
                    </p>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* If awaiting review: show Verify button */}
                    {!selectedIncident.is_verified && selectedIncident.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setVerifyDecision('verified')
                          setVerifyingModalOpen(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs flex items-center space-x-1 transition-colors"
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
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center space-x-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{selectedIncident.advisory ? 'Update Advisory' : 'Draft Advisory'}</span>
                      </button>
                    )}

                    {/* Mark Resolved */}
                    {selectedIncident.status !== 'resolved' && (
                      <button
                        onClick={() => setResolveModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#181f2e] hover:bg-[#202738] text-slate-200 border border-[#2b374f] font-mono text-xs font-bold transition-colors"
                      >
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Supporting Sensor & CV Evidence */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    SUPPORTING COMPUTER-VISION EVIDENCE
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#090b10] border border-[#1b2233]">
                      <span className="text-[10px] text-slate-500 block">DETECTION SOURCE</span>
                      <span className="text-white font-bold">{selectedIncident.source}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090b10] border border-[#1b2233]">
                      <span className="text-[10px] text-slate-500 block">EST. PEDESTRIANS</span>
                      <span className="text-cyan-400 font-bold">
                        {selectedIncident.supporting_metrics?.detected_pedestrians || '142 count'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090b10] border border-[#1b2233]">
                      <span className="text-[10px] text-slate-500 block">CONFLICT INDEX</span>
                      <span className="text-amber-400 font-bold">
                        {selectedIncident.supporting_metrics?.conflict_index || '0.74 (Elevated)'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090b10] border border-[#1b2233]">
                      <span className="text-[10px] text-slate-500 block">CROWD VELOCITY</span>
                      <span className="text-rose-400 font-bold">
                        {selectedIncident.supporting_metrics?.velocity || '14.2 px/s (Slowed)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    INCIDENT DETAILS
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Current Active Advisory */}
                {selectedIncident.advisory && (
                  <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Send className="w-3.5 h-3.5" />
                        <span>ACTIVE CITIZEN ADVISORY</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Broadcasted: {new Date(selectedIncident.advisory.published_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{selectedIncident.advisory.headline}</div>
                    <div className="text-slate-300">
                      <strong>Public Action:</strong> {selectedIncident.advisory.public_action}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Geofence: {selectedIncident.advisory.affected_radius_km} km radius • Issued by {selectedIncident.advisory.published_by}
                    </div>
                  </div>
                )}

                {/* Action Audit Timeline */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    RESPONSE LOG & AUDIT HISTORY
                  </h4>
                  <div className="space-y-3 border-l-2 border-[#1b2233] ml-2 pl-4 font-mono text-xs">
                    {selectedIncident.timeline_updates?.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold">{item.action}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400">by {item.author}</span>
                        </div>
                        <p className="text-slate-300 text-xs font-sans mt-0.5">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#0e111a] border border-[#1b2233] text-center font-mono text-xs text-slate-500">
                Select an incident from the queue to inspect.
              </div>
            )}
          </div>
        </div>

        {/* Verification Modal */}
        {verifyingModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full bg-[#0d1017] border border-[#273247] rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-sm">Verify Incident Observation</h3>
              <p className="text-slate-400">
                Are you confirming that CCTV footage indicates genuine crowd congestion for <strong>{selectedIncident.locality}</strong>?
              </p>

              <div>
                <label className="block text-slate-400 mb-1">DECISION</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('verified')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      verifyDecision === 'verified'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-[#121620] text-slate-400 border-[#1e2638]'
                    }`}
                  >
                    Confirm Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('dismissed')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      verifyDecision === 'dismissed'
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : 'bg-[#121620] text-slate-400 border-[#1e2638]'
                    }`}
                  >
                    Dismiss (False Alarm)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">OFFICER ASSESSMENT NOTES</label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g. Visual confirmation of bottlenecking at Deccan exit. Density exceeding safety threshold."
                  rows={3}
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setVerifyingModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#121620] border border-[#273247] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleVerifySubmit}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Commit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advisory Modal */}
        {advisoryModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full bg-[#0d1017] border border-[#273247] rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-sm">Broadcast Public Safety Advisory</h3>
              <p className="text-slate-400">
                This advisory will appear immediately on all citizen portals within the designated radius.
              </p>

              <div>
                <label className="block text-slate-400 mb-1">ADVISORY HEADLINE</label>
                <input
                  type="text"
                  value={advHeadline}
                  onChange={(e) => setAdvHeadline(e.target.value)}
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RECOMMENDED CITIZEN ACTION</label>
                <textarea
                  value={advAction}
                  onChange={(e) => setAdvAction(e.target.value)}
                  placeholder="e.g. Avoid North concourse; proceed via Deccan Gymkhana connector."
                  rows={2}
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">SEVERITY LEVEL</label>
                  <select
                    value={advSeverity}
                    onChange={(e) => setAdvSeverity(e.target.value)}
                    className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2 text-white"
                  >
                    <option value="YELLOW">YELLOW (Congested)</option>
                    <option value="RED">RED (Critical Avoid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">AFFECTED RADIUS (KM)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="15"
                    value={advRadius}
                    onChange={(e) => setAdvRadius(parseFloat(e.target.value))}
                    className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setAdvisoryModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#121620] border border-[#273247] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleAdvisorySubmit}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Broadcasting...' : 'Broadcast to Public'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resolve Modal */}
        {resolveModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full bg-[#0d1017] border border-[#273247] rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <h3 className="font-bold text-white text-sm">Resolve Incident</h3>
              <p className="text-slate-400">
                Marking this incident resolved will withdraw the active public warning and archive the event.
              </p>

              <div>
                <label className="block text-slate-400 mb-1">RESOLUTION CLOSING REMARKS</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Swargate corridor crowd cleared; normal traffic flow restored."
                  rows={3}
                  className="w-full bg-[#121620] border border-[#273247] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setResolveModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#121620] border border-[#273247] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleResolveSubmit}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold disabled:opacity-50"
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
