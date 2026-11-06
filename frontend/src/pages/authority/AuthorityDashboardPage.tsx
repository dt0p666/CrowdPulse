import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import { fetchIncidents, type Incident } from '../../services/api'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createSeverityIcon } from '../../utils/leafletIcons'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts'

export const AuthorityDashboardPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [layerPanelOpen, setLayerPanelOpen] = useState<boolean>(false)
  const [layers, setLayers] = useState({
    traffic: true,
    incidents: true,
    publicSafety: true,
    cctv: true,
    closures: true,
    emergency: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchIncidents()
      setIncidents(data)
    } catch (err) {
      console.error('Failed to load incidents', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAlerts = incidents.filter((inc) => {
    if (alertFilter === 'CRITICAL') return inc.severity === 'RED'
    if (alertFilter === 'WARNING') return inc.severity === 'YELLOW'
    if (alertFilter === 'INFO') return inc.severity === 'GREEN'
    return true
  })

  // Mock Trend Chart Data (Pedestrian Volume by hour)
  const hourlyData = [
    { time: '00:00', vol: 120, speed: 45 },
    { time: '03:00', vol: 60, speed: 55 },
    { time: '06:00', vol: 280, speed: 42 },
    { time: '09:00', vol: 840, speed: 28 },
    { time: '12:00', vol: 920, speed: 24 },
    { time: '15:00', vol: 780, speed: 30 },
    { time: '18:00', vol: 1150, speed: 19 },
    { time: '21:00', vol: 620, speed: 38 },
  ]

  const responseTimeData = [
    { hour: '12 AM', mins: 8.5 },
    { hour: '4 AM', mins: 5.2 },
    { hour: '8 AM', mins: 9.1 },
    { hour: '12 PM', mins: 6.4 },
    { hour: '4 PM', mins: 7.2 },
    { hour: '8 PM', mins: 5.8 },
  ]

  return (
    <AuthorityLayout breadcrumb="City Overview">
      <div className="space-y-6">
        {/* Top 5 KPI Cards (Matching 84100ca5.jpg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Active Incidents */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Active Incidents</span>
              <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/60">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs yday</span>
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {incidents.filter((i) => i.status !== 'resolved').length}
              </span>
              <span className="text-xs font-mono text-slate-500">cases flagged</span>
            </div>
          </div>

          {/* Card 2: Crowd Flow Index */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Crowd Flow Index</span>
              <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
                <TrendingUp className="w-3 h-3" />
                <span>+8% flow</span>
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">78</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Card 3: Public Safety Score */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Public Safety Score</span>
              <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
                <TrendingUp className="w-3 h-3" />
                <span>+5% safe</span>
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">92</span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Card 4: CCTV Network Status */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">CCTV Tracking HUD</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900/60">
                All Active
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">3 / 3</span>
              <span className="text-xs font-mono text-slate-500">feeds online</span>
            </div>
          </div>

          {/* Card 5: Citizen Advisories Active */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Public Advisories</span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/60">
                Broadcasted
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {incidents.filter((i) => i.advisory).length}
              </span>
              <span className="text-xs font-mono text-slate-500">geofenced live</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Live City Operations Map + Real Time Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0e111a] border border-[#1b2233] overflow-hidden flex flex-col min-h-[480px] shadow-xl relative">
            <div className="px-5 py-3.5 border-b border-[#1b2233] bg-[#121622] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">Live City Operations Map</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg bg-[#181e2b] border border-[#273247] text-slate-300 hover:text-white transition-colors"
                  title="Refresh live operations data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                </button>

                {/* Layer Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLayerPanelOpen(!layerPanelOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#181e2b] border border-[#273247] text-slate-200 text-xs font-mono hover:border-emerald-500 transition-colors"
                  >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Layers</span>
                </button>

                {layerPanelOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#0c0e14] border border-[#273247] p-3 shadow-2xl z-50 font-mono text-xs space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      MAP DATA LAYERS
                    </div>
                    {Object.entries(layers).map(([k, v]) => (
                      <label
                        key={k}
                        className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={v}
                          onChange={() =>
                            setLayers((prev) => ({ ...prev, [k]: !prev[k as keyof typeof layers] }))
                          }
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Container */}
            <div className="flex-1 w-full relative min-h-[420px]">
              <MapContainer
                center={[18.5204, 73.8567]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', minHeight: '420px', width: '100%', background: '#0a0c10' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {incidents.map((inc) => (
                  <Marker
                    key={inc.id}
                    position={[inc.lat, inc.lng]}
                    icon={createSeverityIcon(inc.severity)}
                  >
                    <Popup>
                      <div className="font-mono text-xs p-1">
                        <div className="font-bold text-slate-900">{inc.title}</div>
                        <div className="text-[10px] text-slate-600">{inc.locality}</div>
                        <div className="mt-1 text-[10px] font-bold text-emerald-700">
                          Status: {inc.status}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Real Time Alerts Table (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0e111a] border border-[#1b2233] flex flex-col shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1b2233] bg-[#121622] flex items-center justify-between">
              <h2 className="font-mono font-bold text-white text-sm">Real Time Alerts</h2>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 font-mono text-[11px]">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAlertFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      alertFilter === tab
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'ALL' ? 'View All' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto max-h-[460px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-[#1b2233] text-[10px] text-slate-500 uppercase bg-[#090b10] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Alert</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2233]">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        No alerts matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((inc) => (
                      <tr key={inc.id} className="hover:bg-[#131826] transition-colors">
                        <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(inc.updated_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white line-clamp-1">{inc.title}</div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              inc.severity === 'RED'
                                ? 'bg-rose-950 text-rose-300'
                                : inc.severity === 'YELLOW'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                          {inc.locality}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to="/authority/incidents"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#181f2e] hover:bg-emerald-600 hover:text-black border border-[#2b374f] text-[11px] font-bold text-slate-200 transition-colors"
                          >
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#1b2233] bg-[#0c0e14] flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Showing {filteredAlerts.length} system flags</span>
              <Link
                to="/authority/incidents"
                className="text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>Open Incident Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Trend Graphs (Matching bottom row in 84100ca5.jpg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Volume Trend */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Pedestrian Volume Trend</span>
              <span className="text-emerald-400 font-bold">1,248 /hr</span>
            </div>
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <Bar dataKey="vol" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Tooltip
                    contentStyle={{ background: '#0c0e14', border: '1px solid #1e2638', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Crowd Flow Trend */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Flow Velocity Curve</span>
              <span className="text-cyan-400 font-bold">▲ 8% smooth</span>
            </div>
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <Area type="monotone" dataKey="speed" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.15)" strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#0c0e14', border: '1px solid #1e2638', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Emergency Response Time */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Emergency Dispatch</span>
              <span className="text-emerald-400 font-bold">6m 24s avg</span>
            </div>
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <Line type="monotone" dataKey="mins" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                  <Tooltip
                    contentStyle={{ background: '#0c0e14', border: '1px solid #1e2638', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4: Advisory Acceptance Rate */}
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-[#1b2233] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Citizen Compliance Rate</span>
              <span className="text-amber-400 font-bold">94.6%</span>
            </div>
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <Area type="monotone" dataKey="speed" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.15)" strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#0c0e14', border: '1px solid #1e2638', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
