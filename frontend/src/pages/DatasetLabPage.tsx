import React, { useEffect, useState } from 'react'
import {
  FileSpreadsheet,
  UploadCloud,
  Layers,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Table,
  Maximize2,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'
import {
  fetchDatasets,
  inspectDataset,
  processDataset,
  compareDatasets,
  uploadDataset,
} from '../services/api'
import type {
  DatasetMeta,
  DatasetInspection,
  DatasetProcessResult,
  ScenarioComparison,
} from '../services/api'

export const DatasetLabPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([])
  const [selectedId, setSelectedId] = useState<string>('crosswalk')
  const [inspection, setInspection] = useState<DatasetInspection | null>(null)
  const [processResult, setProcessResult] = useState<DatasetProcessResult | null>(null)
  const [comparisons, setComparisons] = useState<ScenarioComparison[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const list = await fetchDatasets()
      setDatasets(list)
      const comps = await compareDatasets()
      setComparisons(comps)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setInspection(null)
    setProcessResult(null)
    inspectDataset(selectedId)
      .then((data) => {
        setInspection(data)
        // Automatically process trajectory
        setProcessing(true)
        processDataset(selectedId)
          .then(setProcessResult)
          .catch(console.error)
          .finally(() => setProcessing(false))
      })
      .catch(console.error)
  }, [selectedId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadSuccess(null)
    try {
      const meta = await uploadDataset(file)
      setUploadSuccess(`Successfully ingested dataset: ${meta.name}`)
      await loadInitialData()
      setSelectedId(meta.id)
    } catch (err: any) {
      setUploadError(err.message || 'Dataset upload failed')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Mode B: Structured Dataset Lab</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SCHEMA VALIDATION, TRAJECTORY RECONSTRUCTION & MULTI-SCENARIO METRICS
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {processing && (
            <span className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>PROCESSING TRAJECTORY...</span>
            </span>
          )}
          {loading && (
            <span className="text-xs font-mono text-slate-500">Loading datasets...</span>
          )}
          <label className="cursor-pointer px-3 py-1.5 rounded-md bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all flex items-center space-x-1.5">
            <UploadCloud className="w-4 h-4" />
            <span>IMPORT CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Dataset Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#1e2638]">
        {datasets.map((ds) => (
          <button
            key={ds.id}
            onClick={() => setSelectedId(ds.id)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center space-x-2 ${
              selectedId === ds.id
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-sm'
                : 'bg-[#121620] text-slate-400 border border-[#1e2638] hover:text-white hover:bg-[#171d2b]'
            }`}
          >
            <span>{ds.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400 border border-[#2c3852]">
              {ds.row_count} frames
            </span>
          </button>
        ))}
      </div>

      {/* Inspection & Telemetry Grid */}
      {inspection && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">ROW COUNT / FRAMES</span>
            <div className="text-xl font-bold text-white">{inspection.row_count}</div>
            <div className="text-[10px] text-slate-500">1:1 matched to video</div>
          </div>
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">ESTIMATED DURATION</span>
            <div className="text-xl font-bold text-cyan-400">{inspection.estimated_duration_sec}s</div>
            <div className="text-[10px] text-slate-500">Calculated @ 30.0 FPS</div>
          </div>
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">DUPLICATE RECORDS</span>
            <div className="text-xl font-bold text-amber-400">{inspection.duplicate_rows}</div>
            <div className="text-[10px] text-slate-500">Consecutive static frames</div>
          </div>
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
            <span className="text-slate-400 text-[11px]">OUT-OF-BOUNDS BOXES</span>
            <div className="text-xl font-bold text-rose-400">{inspection.out_of_bounds_count}</div>
            <div className="text-[10px] text-slate-500">&lt;0 or &gt;1920x1080 canvas</div>
          </div>
        </div>
      )}

      {/* Coordinate Ranges Table */}
      {inspection && (
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span>COORDINATE BOUNDS & DISTRIBUTION (PIXEL SPACE)</span>
            </span>
            <span className="text-[11px] text-slate-500">Canvas: 1920 × 1080 px</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-slate-400 text-[11px]">
                  <th className="py-2">AXIS / DIM</th>
                  <th className="py-2">MIN</th>
                  <th className="py-2">MAX</th>
                  <th className="py-2">MEAN</th>
                  <th className="py-2">MEDIAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-slate-300">
                {['x', 'y', 'w', 'h'].map((col) => {
                  const stat = inspection.coordinate_ranges[col]
                  return (
                    <tr key={col}>
                      <td className="py-2 font-bold text-cyan-400">{col.toUpperCase()}</td>
                      <td className="py-2">{stat.min} px</td>
                      <td className="py-2">{stat.max} px</td>
                      <td className="py-2">{stat.mean.toFixed(1)} px</td>
                      <td className="py-2">{stat.median.toFixed(1)} px</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trajectory Reconstruction & Velocity Charts */}
      {processResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spatial Trajectory Path */}
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
              <span className="text-white font-semibold flex items-center space-x-1.5">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>2D TRAJECTORY PATH (CENTER X vs CENTER Y)</span>
              </span>
              <span className="text-slate-500 text-[11px]">Inverted Y (Video Canvas)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid stroke="#1e2638" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="center_x"
                    name="X (px)"
                    domain={[0, 1920]}
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="center_y"
                    name="Y (px)"
                    domain={[0, 1080]}
                    reversed
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                  />
                  <ZAxis type="number" dataKey="speed_px_sec" range={[15, 60]} name="Speed (px/s)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0c10',
                      border: '1px solid #2c3852',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Scatter name="Pedestrian Trajectory" data={processResult.trajectories} fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Speed Over Time */}
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
              <span className="text-white font-semibold flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>IMAGE-SPACE VELOCITY (PIXELS / SEC)</span>
              </span>
              <span className="text-emerald-400 font-bold">
                Avg: {processResult.avg_speed_px_sec} px/s
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processResult.trajectories} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid stroke="#1e2638" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time_sec"
                    name="Time (s)"
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                    unit="s"
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" px/s" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0c10',
                      border: '1px solid #2c3852',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed_px_sec"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Spatial Grid Occupancy (Heatmap Matrix) */}
      {processResult && (
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
            <span className="text-white font-semibold flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>SPATIAL COVERAGE & ZONE HEATMAP (4×4 GRID MATRIX)</span>
            </span>
            <span className="text-cyan-400 font-mono text-xs">
              Coverage: {processResult.spatial_coverage_pct}% of scene
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {processResult.grid_occupancy.occupancy_matrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const intensity = Math.min(val / (processResult.total_frames / 4), 1)
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="p-4 rounded-lg border border-[#1e2638] flex flex-col items-center justify-center space-y-1 font-mono transition-all"
                    style={{
                      backgroundColor: `rgba(6, 182, 212, ${Math.max(0.05, intensity * 0.75)})`,
                    }}
                  >
                    <span className="text-[10px] text-slate-400">
                      R{rIdx}C{cIdx}
                    </span>
                    <span className="text-xs font-bold text-white">{val} frames</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Cross-Scenario Comparison Table */}
      {comparisons.length > 0 && (
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
            <span className="text-white font-semibold flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>CROSS-SCENARIO MOVEMENT BENCHMARK</span>
            </span>
            <span className="text-slate-400 text-[11px]">Normalized Comparison</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] text-slate-400 text-[11px]">
                  <th className="py-2">SCENARIO</th>
                  <th className="py-2">FRAMES</th>
                  <th className="py-2">DURATION</th>
                  <th className="py-2">AVG SPEED</th>
                  <th className="py-2">MEDIAN SPEED (P50)</th>
                  <th className="py-2">PEAK BURST (P95)</th>
                  <th className="py-2">TOTAL DISPLACEMENT</th>
                  <th className="py-2">SPATIAL SPREAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-slate-300">
                {comparisons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#171d2b]/50">
                    <td className="py-2.5 font-bold text-white flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-2.5">{c.frames}</td>
                    <td className="py-2.5">{c.duration_sec}s</td>
                    <td className="py-2.5 text-cyan-400 font-semibold">{c.avg_speed_px_sec} px/s</td>
                    <td className="py-2.5">{c.speed_p50} px/s</td>
                    <td className="py-2.5 text-amber-400 font-semibold">{c.speed_p95} px/s</td>
                    <td className="py-2.5">{c.total_displacement_px} px</td>
                    <td className="py-2.5 text-emerald-400">{c.spatial_coverage_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
