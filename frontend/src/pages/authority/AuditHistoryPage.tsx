import React, { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  RefreshCw,
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
    <AuthorityLayout breadcrumb="Accountability Audit Trail">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2233] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Metropolitan Incident Audit & Accountability Trail</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Immutable chain-of-custody logging for all authority reviews, verifications, and broadcast advisories.
            </p>
          </div>

          <button
            onClick={loadAudit}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#121620] border border-[#273247] hover:border-emerald-500 font-mono text-xs text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Audit</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 max-w-md font-mono text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by officer, action, incident ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0e111a] border border-[#1b2233] rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="font-mono text-xs text-slate-500">{filteredLogs.length} entries recorded</span>
        </div>

        {/* Audit Table */}
        <div className="rounded-2xl bg-[#0e111a] border border-[#1b2233] shadow-xl overflow-hidden font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#090b10] border-b border-[#1b2233] text-[10px] text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Authorized Officer</th>
                  <th className="py-3 px-4">Badge / Role</th>
                  <th className="py-3 px-4">Action Recorded</th>
                  <th className="py-3 px-4">Target Incident</th>
                  <th className="py-3 px-4">Assessment / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2233]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No audit events match your query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[#121724] transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {log.officer_name}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 whitespace-nowrap">
                        {log.officer_badge}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('verified')
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.action.includes('advisory')
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : log.action.includes('resolved')
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300 whitespace-nowrap">
                        {log.incident_id}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-sm truncate text-[11px]">
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
