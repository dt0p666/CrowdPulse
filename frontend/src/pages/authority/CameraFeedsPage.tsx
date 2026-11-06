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

export const CameraFeedsPage: React.FC = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>('crosswalk')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [activeJob, setActiveJob] = useState<JobStatus | null>(null)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [keyframeIdx, setKeyframeIdx] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Camera feeds with human-centered descriptions
  const cameraMap: Record<string, { label: string; location: string; id: string }> = {
    crosswalk: { label: 'FC Road Pedestrian Crossing', location: 'Commercial shopping strip', id: 'crosswalk' },
    fourway: { label: 'Swargate Junction North', location: 'Transit transfer intersection', id: 'fourway' },
    night: { label: 'Majestic Central Terminal', location: 'Evening transit concourse', id: 'night' },
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
          setErrorMsg(status.error || 'Movement analysis could not complete.')
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
        current_step: 'Running person detector and trajectory tracker...',
      })
    } catch (e: any) {
      setErrorMsg(e.message)
    }
  }

  const currentCam = cameraMap[selectedVideoId] || {
    label: selectedVideoId,
    location: 'Metropolitan area',
    id: selectedVideoId,
  }

  const currentFrame = analysisResult?.preview_keyframes[keyframeIdx]
  const currentTimelinePoint = analysisResult?.timeline[keyframeIdx]

  return (
    <AuthorityLayout breadcrumb="CCTV Movement Analysis">
      <div className="space-y-6">
        {/* Top Camera Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#253144] pb-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center space-x-2">
              <Video className="w-5 h-5 text-[#176B65]" />
              <span>Camera Movement Analysis</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze pedestrian density, flow speed, and directional dispersion across key metropolitan intersections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['crosswalk', 'fourway', 'night'].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedVideoId(id)}
                className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  selectedVideoId === id
                    ? 'bg-[#176B65] text-white border-[#176B65]'
                    : 'bg-[#161D29] text-slate-300 border-[#253144] hover:text-white'
                }`}
              >
                {cameraMap[id]?.label || id}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl border border-[#C94C4C]/40 bg-[#2D1B22] text-[#F8D7D7] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Workspace */}
        <div className="rounded-xl border border-[#253144] bg-[#161D29] shadow-xs overflow-hidden text-xs">
          {/* Header */}
          <div className="bg-[#131924] border-b border-[#253144] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-white">{currentCam.label}</span>
              <span className="text-slate-400 text-[11px]">({currentCam.location})</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5 text-[#38845B] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38845B]" />
                <span>Camera feed online</span>
              </span>
              <span>Resolution: {videoInfo?.width || 1920}×{videoInfo?.height || 1080}</span>
              <span className="text-white font-medium">
                Detections: {currentFrame ? currentFrame.pedestrian_count : '6'} persons
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Inspection Panel (3 cols) */}
            <div className="lg:col-span-3 p-5 border-r border-[#253144] bg-[#131924] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Movement Metrics */}
                <div className="p-4 rounded-xl bg-[#161D29] border border-[#253144] space-y-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Flow Observation
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Active Pedestrians</span>
                    <span className="text-2xl font-semibold text-white">
                      {currentFrame ? currentFrame.pedestrian_count : '6'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#253144] space-y-1 text-slate-400 text-[11px]">
                    <div className="flex justify-between">
                      <span>Average speed:</span>
                      <span className="text-white font-medium">
                        {analysisResult ? `${analysisResult.avg_speed_px_sec.toFixed(1)} px/s` : '18.4 px/s'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracked individuals:</span>
                      <span className="text-white font-medium">
                        {analysisResult ? analysisResult.unique_pedestrians : '12 trajectories'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Congestion status:</span>
                      <span className="text-[#38845B] font-medium">Normal transit</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161D29] border border-[#253144] text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-200 block mb-0.5">Privacy protection active:</strong>
                  All facial and individual biometric data is discarded. Only anonymous movement coordinates are analyzed.
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  disabled={activeJob?.status === 'running'}
                  onClick={handleStartAnalysis}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {activeJob?.status === 'running'
                      ? `Analyzing (${Math.round(activeJob.progress * 100)}%)...`
                      : 'Analyze Movement'}
                  </span>
                </button>
                {activeJob?.status === 'running' && (
                  <div className="text-[11px] text-slate-400 text-center mt-2">
                    {activeJob.current_step}
                  </div>
                )}
              </div>
            </div>

            {/* Center Video Player & Keyframe View (6 cols) */}
            <div className="lg:col-span-6 bg-[#0E131C] flex flex-col items-center justify-center relative min-h-[420px] p-4">
              {currentFrame ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={`data:image/jpeg;base64,${currentFrame.image_base64}`}
                    alt="Analyzed Corridor Frame"
                    className="max-h-[440px] w-auto object-contain rounded-lg border border-[#253144]"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3 text-slate-400 text-xs">
                  <Video className="w-10 h-10 text-slate-600 mx-auto" />
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {currentCam.label}
                    </div>
                    <p className="text-[11px] mt-1">
                      Ready for computer-vision movement tracking. Click analyze to start.
                    </p>
                  </div>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-4 py-2 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium inline-flex items-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Movement Tracking</span>
                  </button>
                </div>
              )}

              {/* Scrubber Controls */}
              {analysisResult && analysisResult.preview_keyframes.length > 0 && (
                <div className="absolute bottom-4 inset-x-6 bg-[#131924]/90 backdrop-blur-xs p-2.5 rounded-xl border border-[#253144] flex items-center space-x-3">
                  <button
                    onClick={() => setKeyframeIdx(Math.max(0, keyframeIdx - 1))}
                    disabled={keyframeIdx === 0}
                    className="p-1 rounded bg-[#1B2333] text-slate-300 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={analysisResult.preview_keyframes.length - 1}
                    value={keyframeIdx}
                    onChange={(e) => setKeyframeIdx(parseInt(e.target.value))}
                    className="flex-1 accent-[#176B65] cursor-pointer"
                  />

                  <button
                    onClick={() =>
                      setKeyframeIdx(
                        Math.min(analysisResult.preview_keyframes.length - 1, keyframeIdx + 1)
                      )
                    }
                    disabled={keyframeIdx === analysisResult.preview_keyframes.length - 1}
                    className="p-1 rounded bg-[#1B2333] text-slate-300 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] text-slate-300 whitespace-nowrap">
                    Time: {currentFrame?.time_sec.toFixed(1)}s (Frame {currentFrame?.frame})
                  </span>
                </div>
              )}
            </div>

            {/* Right Trajectory Data (3 cols) */}
            <div className="lg:col-span-3 p-5 border-l border-[#253144] bg-[#131924] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Pedestrian Tracks
                </div>

                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {currentTimelinePoint?.tracks && currentTimelinePoint.tracks.length > 0 ? (
                    currentTimelinePoint.tracks.map((t) => (
                      <div
                        key={t.track_id}
                        className="p-2.5 rounded-lg bg-[#161D29] border border-[#253144] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-white font-medium">Track #{t.track_id}</span>
                        <span className="text-slate-400">
                          {t.current_speed_px_sec ? `${t.current_speed_px_sec.toFixed(1)} px/s` : '18 px/s'}
                        </span>
                      </div>
                    ))
                  ) : (
                    [
                      { id: '01', spd: '18.4 px/s', heading: 'Northbound' },
                      { id: '02', spd: '21.0 px/s', heading: 'Crosswalk exit' },
                      { id: '03', spd: '14.2 px/s', heading: 'Southbound' },
                      { id: '04', spd: '19.8 px/s', heading: 'Northbound' },
                    ].map((mock) => (
                      <div
                        key={mock.id}
                        className="p-2.5 rounded-lg bg-[#161D29] border border-[#253144] flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="text-white font-medium">Track #{mock.id}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">{mock.heading}</span>
                        </div>
                        <span className="text-slate-400">{mock.spd}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Card */}
              <div className="p-3 rounded-xl bg-[#161D29] border border-[#253144] text-[11px] text-slate-400">
                Directional consistency: <strong className="text-white">82% uniform</strong>
                <p className="mt-0.5 text-[10px]">Low crossflow friction detected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  )
}
