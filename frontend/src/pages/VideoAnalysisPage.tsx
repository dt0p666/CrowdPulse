import React, { useEffect, useState } from 'react'
import {
  Video,
  UploadCloud,
  Play,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  fetchVideos,
  fetchVideoInfo,
  uploadVideo,
  startVideoAnalysis,
  pollJobStatus,
  fetchAnalysis
} from '../services/api'
import type {
  VideoMeta,
  VideoInfo,
  JobStatus,
  VideoAnalysisResult
} from '../services/api'

export const VideoAnalysisPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoMeta[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string>('crosswalk')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [confThreshold, setConfThreshold] = useState<number>(0.25)
  const [frameStride, setFrameStride] = useState<number>(1)
  const [activeJob, setActiveJob] = useState<JobStatus | null>(null)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [selectedKeyframeIdx, setSelectedKeyframeIdx] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const loadVideos = async () => {
    try {
      const vids = await fetchVideos()
      setVideos(vids)
    } catch (e: any) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (!selectedVideoId) return
    setVideoInfo(null)
    setAnalysisResult(null)
    setActiveJob(null)
    setErrorMsg(null)
    fetchVideoInfo(selectedVideoId)
      .then(setVideoInfo)
      .catch((e: any) => setErrorMsg(e.message))
  }, [selectedVideoId])

  // Polling active background job
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') return

    const interval = setInterval(async () => {
      try {
        const status = await pollJobStatus(activeJob.job_id)
        setActiveJob(status)
        if (status.status === 'completed' && status.result_id) {
          const res = await fetchAnalysis(status.result_id)
          setAnalysisResult(res)
          setSelectedKeyframeIdx(0)
          clearInterval(interval)
        } else if (status.status === 'failed') {
          setErrorMsg(status.error || 'Video analysis failed')
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
    setErrorMsg(null)
    setAnalysisResult(null)
    try {
      const job = await startVideoAnalysis(selectedVideoId, confThreshold, frameStride)
      setActiveJob({
        job_id: job.job_id,
        status: 'running',
        progress: 0.0,
        current_step: 'Starting CV detection thread...',
      })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start analysis')
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMsg(null)
    setUploadSuccess(null)
    try {
      const res = await uploadVideo(file)
      setUploadSuccess(`Uploaded ${res.filename} successfully!`)
      await loadVideos()
      setSelectedVideoId(res.id)
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const currentPreview = analysisResult?.preview_keyframes?.[selectedKeyframeIdx]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <Video className="w-6 h-6 text-cyan-400" />
            <span>Mode A: Recorded Video Computer Vision</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            YOLOV8 PEDESTRIAN DETECTION, ANONYMOUS TRACKING & SPATIOTEMPORAL CV
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer px-3 py-1.5 rounded-md bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-medium text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all flex items-center space-x-1.5">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>UPLOAD VIDEO</span>
            <input type="file" accept=".avi,.mp4,.mov,.mkv" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Video Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#1e2638]">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVideoId(v.id)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center space-x-2 ${
              selectedVideoId === v.id
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 shadow-sm'
                : 'bg-[#121620] text-slate-400 border border-[#1e2638] hover:text-white hover:bg-[#171d2b]'
            }`}
          >
            <span>{v.filename}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400 border border-[#2c3852]">
              {(v.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
            </span>
          </button>
        ))}
      </div>

      {/* Video Info & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata Card */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-slate-300 font-semibold">
            <span>VIDEO TELEMETRY</span>
            <span className="text-cyan-400">{selectedVideoId.toUpperCase()}</span>
          </div>

          {videoInfo ? (
            <div className="space-y-2.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Resolution:</span>
                <span>{videoInfo.width} × {videoInfo.height} px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Framerate:</span>
                <span>{videoInfo.fps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Frames:</span>
                <span className="text-white font-semibold">{videoInfo.total_frames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="text-cyan-400 font-semibold">{videoInfo.duration_sec}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OpenCV Status:</span>
                <span className="text-emerald-400">Decodable (OK)</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">Inspecting video stream...</div>
          )}
        </div>

        {/* Inference Controls */}
        <div className="lg:col-span-2 rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-slate-300 font-semibold">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>COMPUTER VISION INFERENCE PARAMETERS</span>
            </span>
            <span className="text-emerald-400">YOLOv8 + ByteTrack</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">
                Confidence Threshold: <span className="text-cyan-400">{confThreshold.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
                disabled={activeJob?.status === 'running'}
              />
              <div className="text-[10px] text-slate-500 mt-1">Lower = higher recall, Higher = fewer false positives</div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Frame Stride: {frameStride}</label>
              <select
                value={frameStride}
                onChange={(e) => setFrameStride(parseInt(e.target.value))}
                className="w-full bg-[#0a0c10] border border-[#2c3852] rounded p-2 text-slate-200"
                disabled={activeJob?.status === 'running'}
              >
                <option value="1">1 — Maximum precision (every frame)</option>
                <option value="2">2 — Fast processing (every 2nd frame)</option>
                <option value="4">4 — Ultra fast preview (every 4th frame)</option>
              </select>
              <div className="text-[10px] text-slate-500 mt-1">Adjust processing speed on laptops</div>
            </div>
          </div>

          {/* Start Button & Progress */}
          <div className="pt-2">
            {activeJob && activeJob.status === 'running' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>{activeJob.current_step}</span>
                  </span>
                  <span className="font-bold text-cyan-400">{activeJob.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#0a0c10] rounded-full h-2.5 overflow-hidden border border-[#2c3852]">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${activeJob.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartAnalysis}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-black hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>START PEDESTRIAN DETECTION & TRACKING</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">PEAK PEDESTRIAN OCCUPANCY</span>
              <div className="text-xl font-bold text-cyan-400 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{analysisResult.peak_pedestrian_count} people</span>
              </div>
              <div className="text-[10px] text-slate-500">Max concurrent in any frame</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">AVERAGE PEDESTRIAN COUNT</span>
              <div className="text-xl font-bold text-white">
                {analysisResult.avg_pedestrian_count} / frame
              </div>
              <div className="text-[10px] text-slate-500">Across {analysisResult.total_frames} frames</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">UNIQUE ANONYMOUS TRACKS</span>
              <div className="text-xl font-bold text-emerald-400">
                {analysisResult.unique_pedestrians} tracks
              </div>
              <div className="text-[10px] text-slate-500">Discrete trajectories identified</div>
            </div>

            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-1">
              <span className="text-slate-400 text-[11px]">AVERAGE DISPLACEMENT VELOCITY</span>
              <div className="text-xl font-bold text-amber-400">
                {analysisResult.avg_speed_px_sec} px/s
              </div>
              <div className="text-[10px] text-slate-500">Image-space movement rate</div>
            </div>
          </div>

          {/* Visual Scrubbing Preview & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Frame Inspector */}
            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
                <span className="text-white font-semibold flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>ANALYZED FRAME PREVIEW</span>
                </span>
                {currentPreview && (
                  <span className="text-cyan-400">
                    Frame {currentPreview.frame} ({currentPreview.time_sec}s)
                  </span>
                )}
              </div>

              {currentPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-[#2c3852] bg-black aspect-video flex items-center justify-center">
                    <img
                      src={currentPreview.image_base64}
                      alt={`Analysed frame ${currentPreview.frame}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 border border-[#2c3852] text-[10px] font-mono text-emerald-400">
                      Pedestrians: {currentPreview.pedestrian_count}
                    </div>
                  </div>

                  {/* Scrubber slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Timeline Scrubber</span>
                      <span>
                        Keyframe {selectedKeyframeIdx + 1} of {analysisResult.preview_keyframes.length}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={analysisResult.preview_keyframes.length - 1}
                      value={selectedKeyframeIdx}
                      onChange={(e) => setSelectedKeyframeIdx(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No preview frames captured.
                </div>
              )}
            </div>

            {/* Pedestrian Count Over Time Chart */}
            <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e2638] pb-2 text-xs font-mono">
                <span className="text-white font-semibold flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>PEDESTRIAN OCCUPANCY OVER TIME</span>
                </span>
                <span className="text-slate-400 text-[11px]">Timeline Series</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisResult.timeline} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid stroke="#1e2638" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time_sec"
                      name="Time (s)"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      unit="s"
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
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
                      type="stepAfter"
                      dataKey="pedestrian_count"
                      name="Pedestrians"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
