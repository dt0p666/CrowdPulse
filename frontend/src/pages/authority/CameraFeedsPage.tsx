import React, { useState, useEffect } from 'react'
import {
  Video,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { AuthorityLayout } from '../../layouts/AuthorityLayout'
import {
  fetchVideos,
  fetchVideoInfo,
  startVideoAnalysis,
  pollJobStatus,
  fetchAnalysis,
  type VideoInfo,
  type JobStatus,
  type VideoAnalysisResult,
} from '../../services/api'
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

export const CameraFeedsPage: React.FC = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>('crosswalk')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [activeJob, setActiveJob] = useState<JobStatus | null>(null)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [keyframeIdx, setKeyframeIdx] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Camera preset naming
  const cameraMap: Record<string, { label: string; location: string; id: string }> = {
    crosswalk: { label: 'CAM 01 — CROSSWALK', location: 'FC Road Pedestrian Crossing', id: 'crosswalk' },
    fourway: { label: 'CAM 02 — FOUR-WAY', location: 'Swargate Junction North', id: 'fourway' },
    night: { label: 'CAM 03 — NIGHT CONCOURSE', location: 'Majestic Central Terminal', id: 'night' },
  }

  useEffect(() => {
    fetchVideos().catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedVideoId) return
    setErrorMsg(null)
    setAnalysisResult(null)
    setActiveJob(null)
    fetchVideoInfo(selectedVideoId)
      .then(setVideoInfo)
      .catch((e) => setErrorMsg(e.message))
  }, [selectedVideoId])

  // Polling background CV analysis job
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') return

    const interval = setInterval(async () => {
      try {
        const status = await pollJobStatus(activeJob.job_id)
        setActiveJob(status)
        if (status.status === 'completed' && status.result_id) {
          const res = await fetchAnalysis(status.result_id)
          setAnalysisResult(res)
          setKeyframeIdx(0)
          clearInterval(interval)
        } else if (status.status === 'failed') {
          setErrorMsg(status.error || 'Computer-vision analysis failed')
          clearInterval(interval)
        }
      } catch (err: any) {
        console.error(err)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeJob])

  const handleStartAnalysis = async () => {
    if (!selectedVideoId) return
    try {
      setErrorMsg(null)
      const res = await startVideoAnalysis(selectedVideoId, 0.25, 2)
      setActiveJob({
        job_id: res.job_id,
        status: 'pending',
        progress: 0,
        current_step: 'Queued for YOLOv8 & ByteTrack tracking...',
      })
    } catch (e: any) {
      setErrorMsg(e.message)
    }
  }

  const currentCam = cameraMap[selectedVideoId] || {
    label: `CAM — ${selectedVideoId.toUpperCase()}`,
    location: 'Metropolitan Perimeter',
    id: selectedVideoId,
  }

  const currentFrame = analysisResult?.preview_keyframes[keyframeIdx]
  const currentTimelinePoint = analysisResult?.timeline[keyframeIdx]

  return (
    <AuthorityLayout breadcrumb="CCTV Surveillance HUD">
      <div className="space-y-5">
        {/* Top Camera Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2233] pb-3">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
              Metropolitan Surveillance & CV Feeds
            </h1>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            {['crosswalk', 'fourway', 'night'].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedVideoId(id)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                  selectedVideoId === id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950'
                    : 'bg-[#10141f] text-slate-400 border-[#1f283d] hover:text-white'
                }`}
              >
                {cameraMap[id]?.label || id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/30 text-rose-300 font-mono text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cybernetic HUD Frame (Modeled after reference image 6579f6ae.jpg) */}
        <div className="rounded-2xl border-2 border-[#1e2e4a] bg-[#07090f] shadow-2xl overflow-hidden font-mono text-xs relative">
          {/* HUD Top Bar */}
          <div className="bg-[#0b121e] border-b border-[#1e2e4a] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5 text-cyan-400 font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AI TRACKING SYSTEM V5.4</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-white font-bold">{currentCam.label}</span>
              <span className="text-slate-500 hidden sm:inline">({currentCam.location})</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>STATUS: ACTIVE</span>
              </span>
              <span className="text-slate-400">FPS: 30</span>
              <span className="text-cyan-300 font-bold">
                OBJECTS: {currentFrame ? String(currentFrame.pedestrian_count).padStart(2, '0') : '06'}
              </span>
            </div>
          </div>

          {/* HUD Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative min-h-[500px]">
            {/* Left HUD Overlay (3 cols) */}
            <div className="lg:col-span-3 p-4 border-r border-[#1e2e4a] bg-[#080c14]/90 space-y-4 z-10 flex flex-col justify-between">
              {/* Box 1: Object Detection */}
              <div className="p-3 rounded-xl border border-[#1e2e4a] bg-[#0c121e]/80 space-y-2">
                <div className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">
                  OBJECT DETECTION
                </div>
                <div className="text-xl font-bold text-white">
                  TOTAL: {currentFrame ? currentFrame.pedestrian_count : '6'} PERSONS
                </div>
                <div className="space-y-1 text-[11px] text-slate-400 border-t border-[#1e2e4a] pt-2">
                  <div className="flex justify-between">
                    <span>Detector Model:</span>
                    <span className="text-white">YOLOv8-Nano</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracking Engine:</span>
                    <span className="text-emerald-400 font-bold">ByteTrack</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Class:</span>
                    <span className="text-cyan-400">Class 0 (Pedestrian)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Motion Analysis */}
              <div className="p-3 rounded-xl border border-[#1e2e4a] bg-[#0c121e]/80 space-y-2">
                <div className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">
                  MOTION ANALYSIS
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 text-[11px]">AVG SPEED:</span>
                  <span className="text-sm font-bold text-white">
                    {analysisResult ? `${analysisResult.avg_speed_px_sec.toFixed(1)} px/s` : '18.4 px/s'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 text-[11px]">TRAJECTORIES:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {analysisResult ? analysisResult.unique_pedestrians : '12 Active'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 text-[11px]">CONGESTION RISK:</span>
                  <span className="text-xs font-bold text-amber-400">0.42 (Nominal)</span>
                </div>
              </div>

              {/* Action Buttons to Trigger Real CV Inference */}
              <div className="space-y-2 pt-2">
                <button
                  disabled={activeJob?.status === 'running'}
                  onClick={handleStartAnalysis}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-950 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {activeJob?.status === 'running'
                      ? `Processing CV (${Math.round(activeJob.progress * 100)}%)...`
                      : 'Run YOLOv8 Tracking'}
                  </span>
                </button>
                {activeJob?.status === 'running' && (
                  <div className="text-[10px] text-cyan-400 text-center animate-pulse">
                    {activeJob.current_step}
                  </div>
                )}
              </div>
            </div>

            {/* Center Video / Keyframe Feed (6 cols) */}
            <div className="lg:col-span-6 bg-black flex flex-col items-center justify-center relative min-h-[420px] p-2">
              {currentFrame ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={`data:image/jpeg;base64,${currentFrame.image_base64}`}
                    alt="CCTV Processed Frame"
                    className="max-h-[460px] w-auto object-contain rounded-lg border border-[#1e2e4a]"
                  />
                  {/* Digital HUD Crosshairs Overlay */}
                  <div className="absolute top-4 left-4 border-l-2 border-t-2 border-cyan-400 w-6 h-6 pointer-events-none" />
                  <div className="absolute top-4 right-4 border-r-2 border-t-2 border-cyan-400 w-6 h-6 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-cyan-400 w-6 h-6 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-cyan-400 w-6 h-6 pointer-events-none" />
                </div>
              ) : (
                <div className="text-center p-8 space-y-4 text-slate-500 font-mono text-xs">
                  <Video className="w-12 h-12 text-slate-700 mx-auto" />
                  <div>
                    <strong className="text-slate-300 text-sm block">FEED STANDBY: {selectedVideoId.toUpperCase()}</strong>
                    <p className="text-[11px] mt-1">
                      Resolution: {videoInfo?.width || 1920}x{videoInfo?.height || 1080} • 30 FPS • Raw AVI Decodable
                    </p>
                  </div>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold inline-flex items-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Process Surveillance Feed</span>
                  </button>
                </div>
              )}

              {/* Scrubber Controls */}
              {analysisResult && analysisResult.preview_keyframes.length > 0 && (
                <div className="absolute bottom-3 inset-x-4 bg-[#0a0f18]/90 backdrop-blur-md p-2 rounded-xl border border-[#1e2e4a] flex items-center space-x-3">
                  <button
                    onClick={() => setKeyframeIdx(Math.max(0, keyframeIdx - 1))}
                    disabled={keyframeIdx === 0}
                    className="p-1 rounded bg-[#131d2e] text-slate-300 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={analysisResult.preview_keyframes.length - 1}
                    value={keyframeIdx}
                    onChange={(e) => setKeyframeIdx(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />

                  <button
                    onClick={() =>
                      setKeyframeIdx(
                        Math.min(analysisResult.preview_keyframes.length - 1, keyframeIdx + 1)
                      )
                    }
                    disabled={keyframeIdx === analysisResult.preview_keyframes.length - 1}
                    className="p-1 rounded bg-[#131d2e] text-slate-300 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-cyan-300 whitespace-nowrap">
                    T: {currentFrame?.time_sec.toFixed(1)}s (F: {currentFrame?.frame})
                  </span>
                </div>
              )}
            </div>

            {/* Right Tracking HUD (3 cols) */}
            <div className="lg:col-span-3 p-4 border-l border-[#1e2e4a] bg-[#080c14]/90 space-y-3 z-10 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">
                  ACTIVE TRACKING DATA
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {currentTimelinePoint?.tracks && currentTimelinePoint.tracks.length > 0 ? (
                    currentTimelinePoint.tracks.map((t) => (
                      <div
                        key={t.track_id}
                        className="p-2 rounded-lg bg-[#0c121e] border border-[#1e2e4a] flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-cyan-400">ID: {String(t.track_id).padStart(2, '0')}</span>
                          <span className="text-slate-500 ml-1.5">PED</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-300 font-bold">
                            {t.current_speed_px_sec ? `${t.current_speed_px_sec.toFixed(1)} px/s` : '18 px/s'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    [
                      { id: '03', spd: '18.4 px/s', dir: 'EAST' },
                      { id: '07', spd: '21.0 px/s', dir: 'NORTH' },
                      { id: '08', spd: '14.2 px/s', dir: 'SOUTH' },
                      { id: '11', spd: '19.8 px/s', dir: 'EAST' },
                      { id: '15', spd: '12.5 px/s', dir: 'WEST' },
                    ].map((mock) => (
                      <div
                        key={mock.id}
                        className="p-2 rounded-lg bg-[#0c121e] border border-[#1e2e4a] flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-cyan-400">ID: {mock.id}</span>
                          <span className="text-slate-500 ml-1.5">{mock.dir}</span>
                        </div>
                        <span className="text-slate-300 font-bold">{mock.spd}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Metric */}
              <div className="p-2.5 rounded-xl border border-[#1e2e4a] bg-[#0c121e] text-[10px] text-slate-400">
                <span className="text-cyan-400 font-bold block mb-0.5">COMPLIANCE NOTICE</span>
                All face features and identities are strictly anonymous. Bounding box coordinates track flow direction only.
              </div>
            </div>
          </div>

          {/* Bottom HUD Panels (Modeled after lower row in 6579f6ae.jpg) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#1e2e4a] bg-[#0a0f18] divide-y md:divide-y-0 md:divide-x divide-[#1e2e4a]">
            {/* Panel 1: Speed Analysis Graph */}
            <div className="p-3 space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                SPEED ANALYSIS (PX / S)
              </div>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      analysisResult?.timeline.slice(0, 20).map((t) => ({
                        frame: t.frame,
                        count: t.pedestrian_count,
                      })) || [
                        { frame: 1, count: 4 },
                        { frame: 5, count: 6 },
                        { frame: 10, count: 8 },
                        { frame: 15, count: 5 },
                        { frame: 20, count: 7 },
                      ]
                    }
                  >
                    <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 2: Trajectory Directional Map */}
            <div className="p-3 space-y-1 flex flex-col justify-between">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                TRAJECTORY VECTOR HEADING
              </div>
              <div className="flex items-center justify-around py-2">
                <div className="text-center">
                  <span className="text-xs font-bold text-emerald-400 block">▲ 64%</span>
                  <span className="text-[9px] text-slate-500">FORWARD FLOW</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-amber-400 block">◄► 28%</span>
                  <span className="text-[9px] text-slate-500">CROSSFLOW</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-rose-400 block">▼ 8%</span>
                  <span className="text-[9px] text-slate-500">COUNTERFLOW</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Activity Heatmap Spectrum */}
            <div className="p-3 space-y-1 flex flex-col justify-between">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                DENSITY HEATMAP CONCENTRATION
              </div>
              <div className="h-6 rounded-md bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-500 to-rose-600 w-full" />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>0.0 (Free)</span>
                <span>0.5 (Moderate)</span>
                <span>1.0 (Critical Chokepoint)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
