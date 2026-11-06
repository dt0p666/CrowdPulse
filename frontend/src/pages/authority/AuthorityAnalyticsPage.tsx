import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import { CrowdMap3D } from '../../components/maps/CrowdMap3D'
import { fetchDatasets, processDataset, type DatasetMeta, type DatasetProcessResult } from '../../services/api'

export const AuthorityAnalyticsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('crosswalk')
  const [processResult, setProcessResult] = useState<DatasetProcessResult | null>(null)
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    fetchDatasets().then(setDatasets).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedDatasetId) return
    setCurrentFrameIdx(0)
    processDataset(selectedDatasetId).then(setProcessResult).catch(console.error)
  }, [selectedDatasetId])

  useEffect(() => {
    if (!isPlaying || !processResult || processResult.trajectories.length === 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    let lastTime = performance.now()
    const intervalMs = 1000 / (processResult.fps || 30) / playbackSpeed

    const loop = (now: number) => {
      if (now - lastTime >= intervalMs) {
        lastTime = now
        setCurrentFrameIdx((prev) => {
          if (prev >= processResult.trajectories.length - 1) return 0
          return prev + 1
        })
      }
      animationRef.current = requestAnimationFrame(loop)
    }

    animationRef.current = requestAnimationFrame(loop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, processResult, playbackSpeed])

  const activePoint = processResult?.trajectories[currentFrameIdx]

  return (
    <AuthorityLayout breadcrumb="Venue 3D Spatial Intelligence">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2233] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <span>Venue 3D Spatial Intelligence & Flow Dynamics</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Three.js physical spatial projection of pedestrian vector fields across venue zones
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-500">Corridor:</span>
            {datasets.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDatasetId(d.id)}
                className={`px-3 py-1 rounded-lg border font-bold transition-colors ${
                  selectedDatasetId === d.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                    : 'bg-[#121620] text-slate-400 border-[#1e2638] hover:text-white'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas View */}
        <div className="rounded-2xl border border-[#1b2233] bg-[#0c0e14] overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-[#1b2233] bg-[#0e121c] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-cyan-400 font-bold">SPATIAL 3D VENUE GRID</span>
              <span className="text-slate-500">
                Frame {currentFrameIdx + 1} / {processResult?.total_frames || 0}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
                className="px-2 py-1 rounded bg-[#181f2e] text-slate-300 hover:text-white text-[11px]"
              >
                {playbackSpeed}x
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded-lg bg-[#181f2e] text-slate-200 hover:text-white flex items-center space-x-1"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setCurrentFrameIdx(0)}
                className="p-1 rounded-lg bg-[#181f2e] text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[460px] w-full bg-[#05070a]">
            <CrowdMap3D
              gridOccupancy={processResult?.grid_occupancy}
              trajectories={processResult?.trajectories || []}
              currentFrameIdx={currentFrameIdx}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          </div>

          <div className="p-4 border-t border-[#1b2233] bg-[#090c12] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT SPEED</span>
              <span className="text-cyan-400 font-bold text-sm">
                {activePoint ? `${activePoint.speed_px_sec.toFixed(1)} px/s` : '0 px/s'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AVG SPEED</span>
              <span className="text-white font-bold text-sm">
                {processResult ? `${processResult.avg_speed_px_sec.toFixed(1)} px/s` : '0 px/s'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL DISPLACEMENT</span>
              <span className="text-emerald-400 font-bold text-sm">
                {processResult ? `${processResult.total_displacement_px.toFixed(0)} px` : '0 px'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SPATIAL COVERAGE</span>
              <span className="text-amber-400 font-bold text-sm">
                {processResult ? `${processResult.spatial_coverage_pct.toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
