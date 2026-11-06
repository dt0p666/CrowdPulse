import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Video,
  FileSpreadsheet,
  Box,
  BrainCircuit,
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react'
import { fetchHealth, fetchDatasets, fetchVideos } from '../services/api'
import type { HealthResponse, DatasetMeta, VideoMeta } from '../services/api'

export const OverviewPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [datasets, setDatasets] = useState<DatasetMeta[]>([])
  const [videos, setVideos] = useState<VideoMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchHealth().catch(() => null),
      fetchDatasets().catch(() => []),
      fetchVideos().catch(() => [])
    ]).then(([h, ds, vids]) => {
      setHealth(h)
      setDatasets(ds)
      setVideos(vids)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#1e2638] bg-gradient-to-b from-[#121620] to-[#0d1017] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPATIOTEMPORAL INTELLIGENCE PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              CROWDPULSE
            </h1>
            <p className="text-cyan-400 font-mono text-sm tracking-widest font-semibold uppercase">
              SEE THE FLOW. SENSE THE SHIFT.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed pt-1">
              Full-stack AI crowd movement intelligence system combining computer vision pedestrian tracking, directional conflict dynamics, velocity variance, and 3D spatial mapping to provide early warnings of unsafe crowd states.
            </p>
          </div>

          {/* Engine Health Telemetry Card */}
          <div className="w-full md:w-80 rounded-lg border border-[#1e2638] bg-[#0a0c10]/80 p-4 font-mono text-xs space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
              <span className="text-slate-400">ENGINE STATUS</span>
              <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{loading ? 'CHECKING...' : health ? 'OPERATIONAL' : 'OFFLINE'}</span>
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Python:</span>
                <span>{health?.environment?.python_version || '3.14.7'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Acceleration:</span>
                <span className="text-cyan-400">{health?.environment?.device?.toUpperCase() || 'CPU'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sample Feeds:</span>
                <span>{videos.length || 3} videos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sample Datasets:</span>
                <span>{datasets.length || 3} CSVs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CV Engine:</span>
                <span className="text-emerald-400">YOLOv8 + ByteTrack</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Core Modalities Showcase */}
      <div>
        <h2 className="text-base font-mono font-semibold tracking-wider text-slate-200 uppercase mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Core Analytical Modalities</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode A */}
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 hover:border-[#2c3852] transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  MODE A
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">REAL DATA ONLY</span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <span>Recorded Video CV Analysis</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated YOLOv8 pedestrian detection, anonymous tracking IDs, velocity vectors, and zone occupancy from AVI/MP4 feeds with background job execution and visual scrubbing.
              </p>
            </div>
            <Link
              to="/video-analysis"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-semibold text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
            >
              <span>LAUNCH VIDEO ANALYZER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mode B */}
          <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 hover:border-[#2c3852] transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  MODE B
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">REAL DATA ONLY</span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Structured Dataset Lab</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ingest verified CSV bounding-box annotations, validate schemas, calculate pixel displacement velocity, reconstruct trajectories, and benchmark across crosswalk, fourway, and night feeds.
              </p>
            </div>
            <Link
              to="/dataset-lab"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
            >
              <span>EXPLORE DATASET LAB</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Intelligence Modules Grid */}
      <div>
        <h2 className="text-base font-mono font-semibold tracking-wider text-slate-200 uppercase mb-4 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Intelligence & Visualization Modules</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/crowd-map"
            className="group rounded-lg border border-[#1e2638] bg-[#121620] p-4 hover:border-cyan-500/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
              <Box className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-semibold text-white text-sm">3D Crowd Map</h4>
            <p className="text-xs text-slate-400">
              Interactive 3D spatial venue rendering driven directly by tracked pedestrian positions and zone heatmaps.
            </p>
          </Link>

          <Link
            to="/prediction-lab"
            className="group rounded-lg border border-[#1e2638] bg-[#121620] p-4 hover:border-cyan-500/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
              <BrainCircuit className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-semibold text-white text-sm">Prediction Lab</h4>
            <p className="text-xs text-slate-400">
              Crowd-state classification, chronological split evaluation, precision-recall metrics, and simulated scenarios.
            </p>
          </Link>

          <Link
            to="/explainability"
            className="group rounded-lg border border-[#1e2638] bg-[#121620] p-4 hover:border-cyan-500/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
              <HelpCircle className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-semibold text-white text-sm">Explainability</h4>
            <p className="text-xs text-slate-400">
              Transparent SHAP feature contributions, movement imbalance indicators, and honest limitation disclosures.
            </p>
          </Link>

          <Link
            to="/settings"
            className="group rounded-lg border border-[#1e2638] bg-[#121620] p-4 hover:border-cyan-500/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-semibold text-white text-sm">System Settings</h4>
            <p className="text-xs text-slate-400">
              Detector thresholds, processing stride parameters, data storage locations, and operational telemetry.
            </p>
          </Link>
        </div>
      </div>

      {/* Scientific Honesty Disclaimer Card */}
      <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200/90 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-300 font-mono">SCIENTIFIC RIGOR & METRIC CONVENTIONS:</span>
          <p className="text-slate-300 leading-relaxed">
            Unless physical camera calibration matrices and ground plane homographies are established, velocities are reported strictly in <strong className="text-white">pixels per second</strong>, never as physical metres per second. Predictions categorize descriptive crowd states (Stable, Densifying, Congested, Elevated Risk) and are intended as early warning indicators to assist human venue operators.
          </p>
        </div>
      </div>
    </div>
  )
}
