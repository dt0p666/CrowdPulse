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
    <AuthorityLayout breadcrumb="Spatial Dynamics">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#253144] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Box className="w-5 h-5 text-teal-400" />
              <span>Venue Spatial Intelligence & Flow Dynamics</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Physical spatial projection of pedestrian trajectories across key venue zones
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Venue camera:</span>
            {datasets.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDatasetId(d.id)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  selectedDatasetId === d.id
                    ? 'bg-[#176B65] text-white border-[#176B65]'
                    : 'bg-[#161D29] text-slate-300 border-[#253144] hover:text-white'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas View */}
        <div className="rounded-2xl border border-[#253144] bg-[#161D29] overflow-hidden shadow-xl">
          <div className="p-3.5 border-b border-[#253144] bg-[#111722] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-white font-semibold">Spatial Venue Model</span>
              <span className="text-slate-400">
                Frame {currentFrameIdx + 1} of {processResult?.total_frames || 0}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
                className="px-2.5 py-1 rounded-lg bg-[#161D29] border border-[#253144] text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                {playbackSpeed}x
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-lg bg-[#176B65] text-white hover:bg-[#12544F] flex items-center space-x-1.5 cursor-pointer font-medium"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setCurrentFrameIdx(0)}
                className="p-1.5 rounded-lg bg-[#161D29] border border-[#253144] text-slate-400 hover:text-white cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[460px] w-full">
            <CrowdMap3D
              gridOccupancy={processResult?.grid_occupancy}
              trajectories={processResult?.trajectories || []}
              currentFrameIdx={currentFrameIdx}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          </div>

          <div className="p-4 border-t border-[#253144] bg-[#111722] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Current Velocity</span>
              <span className="text-white font-semibold text-base">
                {activePoint ? `${activePoint.speed_px_sec.toFixed(1)} px/s` : '0 px/s'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Average Corridor Speed</span>
              <span className="text-white font-semibold text-base">
                {processResult ? `${processResult.avg_speed_px_sec.toFixed(1)} px/s` : '0 px/s'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Total Displacement</span>
              <span className="text-emerald-400 font-semibold text-base">
                {processResult ? `${processResult.total_displacement_px.toFixed(0)} px` : '0 px'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Spatial Floor Coverage</span>
              <span className="text-amber-400 font-semibold text-base">
                {processResult ? `${processResult.spatial_coverage_pct.toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
