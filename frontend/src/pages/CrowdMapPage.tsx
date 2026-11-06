import React, { useEffect, useState, useRef } from 'react'
import {
  Box,
  Play,
  Pause,
  RotateCcw,
  Info
} from 'lucide-react'
import { CrowdMap3D } from '../components/maps/CrowdMap3D'
import { fetchDatasets, processDataset } from '../services/api'
import type { DatasetMeta, DatasetProcessResult } from '../services/api'

export const CrowdMapPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('crosswalk')
  const [processResult, setProcessResult] = useState<DatasetProcessResult | null>(null)
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    fetchDatasets()
      .then(setDatasets)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedDatasetId) return
    setCurrentFrameIdx(0)
    processDataset(selectedDatasetId)
      .then(setProcessResult)
      .catch(console.error)
  }, [selectedDatasetId])

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !processResult || processResult.trajectories.length === 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    let lastTime = performance.now()
    const intervalMs = (1000 / (processResult.fps || 30)) / playbackSpeed

    const loop = (now: number) => {
      if (now - lastTime >= intervalMs) {
        lastTime = now
        setCurrentFrameIdx((prev) => {
          if (prev >= processResult.trajectories.length - 1) {
            return 0 // loop
          }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <Box className="w-6 h-6 text-cyan-400" />
            <span>Interactive 3D Crowd Spatial Map</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            THREE.JS & REACT THREE FIBER VENUE OCCUPANCY & TRAJECTORY PROJECTION
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
            WEBGL RENDERER (R3F)
          </span>
        </div>
      </div>

      {/* Dataset & Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#1e2638] bg-[#121620] font-mono text-xs">
        {/* Dataset Selection */}
        <div className="flex items-center space-x-3">
          <span className="text-slate-400">DATASET:</span>
          <div className="flex space-x-2">
            {datasets.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDatasetId(d.id)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  selectedDatasetId === d.id
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'bg-[#0a0c10] text-slate-300 border border-[#2c3852] hover:text-white'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500 hover:text-black transition-colors"
            title={isPlaying ? 'Pause playback' : 'Play trajectory'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => setCurrentFrameIdx(0)}
            className="p-2 rounded bg-[#0a0c10] text-slate-400 border border-[#2c3852] hover:text-white transition-colors"
            title="Reset to frame 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 pl-2 border-l border-[#1e2638]">
            <span className="text-slate-500">SPEED:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded text-[10px] ${
                  playbackSpeed === spd
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div className="h-[480px] w-full">
        {processResult ? (
          <CrowdMap3D
            trajectories={processResult.trajectories}
            currentFrameIdx={currentFrameIdx}
            gridOccupancy={processResult.grid_occupancy}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
          />
        ) : (
          <div className="w-full h-full rounded-xl border border-[#1e2638] bg-[#07090c] flex items-center justify-center text-slate-500 font-mono text-xs">
            Loading spatial coordinates and 3D scene...
          </div>
        )}
      </div>

      {/* Scrubber & Telemetry Grid */}
      {processResult && activePoint && (
        <div className="space-y-4">
          {/* Frame Scrubber */}
          <div className="p-4 rounded-xl border border-[#1e2638] bg-[#121620] space-y-2 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">
                FRAME SCRUBBER: <span className="text-cyan-400">{currentFrameIdx}</span> / {processResult.total_frames - 1}
              </span>
              <span className="text-slate-400">
                TIME: <span className="text-emerald-400">{activePoint.time_sec}s</span> / {processResult.duration_sec}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={processResult.total_frames - 1}
              value={currentFrameIdx}
              onChange={(e) => {
                setIsPlaying(false)
                setCurrentFrameIdx(parseInt(e.target.value))
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Active Agent Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">COORDINATE POSITION</span>
              <div className="text-base font-bold text-white">
                ({activePoint.center_x.toFixed(0)}, {activePoint.center_y.toFixed(0)}) px
              </div>
              <div className="text-[10px] text-slate-500">2D video space</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">DISPLACEMENT VELOCITY</span>
              <div className="text-base font-bold text-cyan-400">
                {activePoint.speed_px_sec} px/s
              </div>
              <div className="text-[10px] text-slate-500">Instantaneous movement rate</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">HEADING ANGLE</span>
              <div className="text-base font-bold text-emerald-400">
                {activePoint.direction_deg}°
              </div>
              <div className="text-[10px] text-slate-500">Directional orientation</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">ACTIVE VENUE ZONE</span>
              <div className="text-base font-bold text-amber-400">
                {selectedZone ? selectedZone.toUpperCase() : 'ALL ZONES'}
              </div>
              <div className="text-[10px] text-slate-500">Click floor zone to filter</div>
            </div>
          </div>
        </div>
      )}

      {/* Scientific Honesty Disclaimer Banner */}
      <div className="p-4 rounded-lg border border-[#1e2638] bg-[#0a0c10] text-xs text-slate-400 font-mono flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Spatial Projection Note:</strong> Pedestrian positions and density pillars in this 3D view are directly driven by actual video bounding-box centroids normalized onto the architectural concourse plane. Without 3D camera calibration homographies, positions reflect image-space coordinates rather than true geographic GPS coordinates.
        </p>
      </div>
    </div>
  )
}
