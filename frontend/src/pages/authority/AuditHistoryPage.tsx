import React, { useState, useEffect } from 'react'
import {
  Search,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import { fetchAuditTrail, type AuditEntry } from '../../services/api'

export const AuditHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadAudit = async () => {
    try {
      setLoading(true)
      const data = await fetchAuditTrail()
      setLogs(data.audit_log || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudit()
  }, [])

  const filteredLogs = logs.filter((entry) => {
    const q = searchTerm.toLowerCase()
    return (
      entry.officer_name.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.incident_id.toLowerCase().includes(q) ||
      entry.details.toLowerCase().includes(q)
    )
  })

  return (
    <AuthorityLayout breadcrumb="Incident Audit Log">
      <div className="space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#253144] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Metropolitan Incident Audit & History</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Verified record of authority actions, verifications, and broadcast advisories.
            </p>
          </div>

          <button
            onClick={loadAudit}
            className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#161D29] border border-[#253144] hover:border-[#176B65] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh records</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md text-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by officer, action, or incident ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161D29] border border-[#253144] rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#176B65]"
            />
          </div>
          <span className="text-xs text-slate-400">{filteredLogs.length} events logged</span>
        </div>

        {/* Audit Table */}
        <div className="rounded-2xl bg-[#161D29] border border-[#253144] shadow-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#111722] border-b border-[#253144] text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Authorized Officer</th>
                  <th className="py-3.5 px-4">Badge / Role</th>
                  <th className="py-3.5 px-4">Action Taken</th>
                  <th className="py-3.5 px-4">Incident Reference</th>
                  <th className="py-3.5 px-4">Operational Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253144]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No logged events match your filter query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[#1a2332] transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-xs">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        {log.officer_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {log.officer_badge}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            log.action.includes('verified')
                              ? 'bg-[#38845B]/15 text-emerald-400 border border-[#38845B]/30'
                              : log.action.includes('advisory')
                              ? 'bg-[#176B65]/15 text-teal-300 border border-[#176B65]/30'
                              : log.action.includes('resolved')
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-[#C94C4C]/15 text-rose-300 border border-[#C94C4C]/30'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                        {log.incident_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
