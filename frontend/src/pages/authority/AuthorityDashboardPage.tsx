import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
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
    trafficCondition: true,
    incidents: true,
    publicSafety: true,
    energyInfrastructure: false,
    environmentSensors: true,
    cctvCameras: true,
    roadClosures: true,
    emergencyServices: true,
  })

  const loadData = () => {
    setLoading(true)
    fetchIncidents()
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false))
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

  // Hourly Pedestrian Traffic Volume
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
    <AuthorityLayout breadcrumb="City Operations Overview">
      <div className="space-y-6">
        {/* Top 5 Contextual Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono">
          {/* Card 1: Active Incidents */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-1.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#6B726C] dark:text-slate-400">
              <span>Active Incidents</span>
              <span className="text-[10px] font-semibold text-[#C94C4C] bg-[#C94C4C]/10 px-1.5 py-0.5 rounded border border-[#C94C4C]/25">
                +1 new flag
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111111] dark:text-white">
              {incidents.filter((i) => i.status !== 'resolved').length}
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">
              {incidents.filter((i) => i.severity === 'RED').length} high congestion zones
            </p>
          </div>

          {/* Card 2: Crowd Flow Index */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-1.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#6B726C] dark:text-slate-400">
              <span>Crowd Flow Stability</span>
              <span className="text-[10px] font-semibold text-[#38845B] bg-[#38845B]/10 px-1.5 py-0.5 rounded border border-[#38845B]/25">
                Stable
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111111] dark:text-white">
              78<span className="text-sm font-normal text-[#6B726C] dark:text-slate-500"> / 100</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">
              Average speed: 1.1 m/s across corridors
            </p>
          </div>

          {/* Card 3: Public Safety Score */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-1.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#6B726C] dark:text-slate-400">
              <span>Regional Safety Index</span>
              <span className="text-[10px] font-semibold text-[#38845B] bg-[#38845B]/10 px-1.5 py-0.5 rounded border border-[#38845B]/25">
                Low risk
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111111] dark:text-white">
              92<span className="text-sm font-normal text-[#6B726C] dark:text-slate-500"> / 100</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">
              No stampede hazard indicators detected
            </p>
          </div>

          {/* Card 4: CCTV Network Status */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-1.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#6B726C] dark:text-slate-400">
              <span>Monitored Cameras</span>
              <span className="text-[10px] font-semibold text-[#176B65] dark:text-[#CEF03C] bg-[#176B65]/10 dark:bg-[#176B65]/25 px-1.5 py-0.5 rounded border border-[#176B65]/30">
                Online
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111111] dark:text-white">
              3 <span className="text-sm font-normal text-[#6B726C] dark:text-slate-500">of 3 Active</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">
              Crosswalk, Fourway & Night Concourse
            </p>
          </div>

          {/* Card 5: Citizen Advisories Active */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-1.5 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#6B726C] dark:text-slate-400">
              <span>Public Advisories</span>
              <span className="text-[10px] font-semibold text-[#D69B32] bg-[#D69B32]/10 px-1.5 py-0.5 rounded border border-[#D69B32]/30">
                Active
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111111] dark:text-white">
              {incidents.filter((i) => i.advisory).length}
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">
              Broadcasting to affected perimeters
            </p>
          </div>
        </div>

        {/* Middle Section: Live City Operations Map + Real Time Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (7 cols) - Clean OpenStreetMap, NO API Key watermark! */}
          <div className="lg:col-span-7 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] overflow-hidden flex flex-col shadow-xs transition-colors">
            <div className="px-5 py-3.5 border-b border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#131924] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#38845B]" />
                <span className="font-semibold text-[#111111] dark:text-white">Live City Operations Map</span>
                <span className="text-[#6B726C] dark:text-slate-400 text-[11px]">Pune Metropolitan Region</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2333] border border-[#D8D6CE] dark:border-[#2B3950] text-[#6B726C] dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Refresh live map markers"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#176B65]' : ''}`} />
                </button>

                {/* Layer Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLayerPanelOpen(!layerPanelOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2333] border border-[#D8D6CE] dark:border-[#2B3950] text-[#111111] dark:text-slate-200 text-xs hover:border-[#176B65] transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#176B65] dark:text-[#CEF03C]" />
                    <span>Map Layers</span>
                  </button>

                  {layerPanelOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#2B3950] p-3 shadow-xl z-50 text-xs space-y-2">
                      <div className="text-[10px] text-[#6B726C] dark:text-slate-400 uppercase tracking-wider font-semibold font-mono">
                        Layer Visibility
                      </div>
                      {Object.entries(layers).map(([k, v]) => (
                        <label
                          key={k}
                          className="flex items-center space-x-2 cursor-pointer text-[#111111] dark:text-slate-300 hover:text-[#176B65] dark:hover:text-white"
                        >
                          <input
                            type="checkbox"
                            checked={v}
                            onChange={() =>
                              setLayers((prev) => ({ ...prev, [k]: !prev[k as keyof typeof layers] }))
                            }
                            className="rounded border-[#D8D6CE] dark:border-[#2B3950] text-[#176B65] focus:ring-0"
                          />
                          <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map Container with OpenStreetMap Tiles */}
            <div className="h-[430px] w-full relative">
              <MapContainer
                center={[18.5204, 73.8567]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {incidents.map((inc) => (
                  <Marker
                    key={inc.id}
                    position={[inc.lat, inc.lng]}
                    icon={createSeverityIcon(inc.severity)}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <div className="font-semibold text-slate-900">{inc.title}</div>
                        <div className="text-[10px] text-slate-600">{inc.locality}</div>
                        <div className="mt-1 text-[10px] font-medium text-[#176B65]">
                          Status: {inc.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="px-5 py-2.5 border-t border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#131924] text-[11px] text-[#6B726C] dark:text-slate-400 flex items-center justify-between font-mono">
              <span>Real geographical street layout of Pune</span>
              <span>Click any marker to inspect incident record</span>
            </div>
          </div>

          {/* Real Time Alerts Table (5 cols) */}
          <div className="lg:col-span-5 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] flex flex-col shadow-xs overflow-hidden transition-colors">
            <div className="px-5 py-3.5 border-b border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#131924] flex items-center justify-between">
              <h2 className="font-semibold text-[#111111] dark:text-white text-sm">Real-Time Incident Queue</h2>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 text-xs">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAlertFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] cursor-pointer ${
                      alertFilter === tab
                        ? 'bg-[#176B65] text-white font-medium'
                        : 'text-[#6B726C] dark:text-slate-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab === 'ALL' ? 'All' : tab === 'CRITICAL' ? 'Critical' : tab === 'WARNING' ? 'Warning' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-y-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D8D6CE] dark:border-[#253144] text-[10px] text-[#6B726C] dark:text-slate-400 uppercase bg-[#F6F5F0] dark:bg-[#101622] sticky top-0 font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Alert</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D6CE] dark:divide-[#253144]">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#6B726C] dark:text-slate-500">
                        No alerts matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((inc) => (
                      <tr key={inc.id} className="hover:bg-[#F6F5F0] dark:hover:bg-[#1B2433] transition-colors">
                        <td className="py-3 px-4 text-[#6B726C] dark:text-slate-400 text-[11px] whitespace-nowrap font-mono">
                          {new Date(inc.updated_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#111111] dark:text-white line-clamp-1">{inc.title}</div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                              inc.severity === 'RED'
                                ? 'bg-[#C94C4C]/15 text-[#C94C4C] dark:text-[#F8D7D7]'
                                : inc.severity === 'YELLOW'
                                ? 'bg-[#D69B32]/15 text-[#D69B32] dark:text-[#FBEAC9]'
                                : 'bg-[#38845B]/15 text-[#38845B] dark:text-[#D1EBDD]'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6B726C] dark:text-slate-400 text-[11px] truncate max-w-[120px]">
                          {inc.locality}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            to="/authority/incidents"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F6F5F0] dark:bg-[#1B2333] hover:bg-[#176B65] hover:text-white border border-[#D8D6CE] dark:border-[#2B3950] text-[11px] font-medium text-[#111111] dark:text-slate-200 transition-colors"
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

            <div className="p-3 border-t border-[#D8D6CE] dark:border-[#253144] bg-[#FBFBF9] dark:bg-[#131924] flex items-center justify-between text-xs text-[#6B726C] dark:text-slate-400">
              <span className="font-mono">Showing {filteredAlerts.length} flags</span>
              <Link
                to="/authority/incidents"
                className="text-[#176B65] dark:text-[#A8B9A7] hover:underline flex items-center space-x-1 font-medium"
              >
                <span>Open Verification Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Meaningful Trends (Answering Questions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Question 1: How is volume changing? */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-2 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[#6B726C] dark:text-slate-400">Pedestrian Volume Trend</span>
              <span className="text-[#111111] dark:text-white font-medium">1,248 /hr peak</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">Hourly foot traffic across monitored corridors</p>
            <div className="h-24 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <Bar dataKey="vol" fill="#176B65" radius={[2, 2, 0, 0]} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question 2: Is transit flow slowing down? */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-2 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[#6B726C] dark:text-slate-400">Transit Flow Velocity</span>
              <span className="text-[#38845B] font-medium">+8% steady</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">Average traversal pace: 1.2 m/s</p>
            <div className="h-24 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <Area type="monotone" dataKey="speed" stroke="#38845B" fill="rgba(56, 132, 91, 0.15)" strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question 3: How quickly are field teams responding? */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-2 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[#6B726C] dark:text-slate-400">Field Response Dispatch</span>
              <span className="text-[#111111] dark:text-white font-medium">6m 24s avg</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">Decreased by 15% over last 24 hours</p>
            <div className="h-24 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <Line type="monotone" dataKey="mins" stroke="#D69B32" strokeWidth={2} dot={{ r: 2 }} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question 4: Are citizens following alternate routes? */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] space-y-2 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[#6B726C] dark:text-slate-400">Advisory Route Divergence</span>
              <span className="text-[#38845B] font-medium">94.6%</span>
            </div>
            <p className="text-[11px] text-[#6B726C] dark:text-slate-400 font-sans">Pedestrians successfully bypassing bottlenecks</p>
            <div className="h-24 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <Area type="monotone" dataKey="speed" stroke="#176B65" fill="rgba(23, 107, 101, 0.15)" strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
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
