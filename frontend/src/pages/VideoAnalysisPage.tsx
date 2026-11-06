import React from 'react'
import { Video, UploadCloud, Settings } from 'lucide-react'

export const VideoAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <Video className="w-6 h-6 text-cyan-400" />
            <span>Mode A: Recorded Video Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            PEDESTRIAN DETECTION, ANONYMOUS TRACKING & SPATIOTEMPORAL CV
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
            ENGINE: YOLOV8 + BYTETRACK
          </span>
        </div>
      </div>

      {/* Upload & Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
            <span className="text-sm font-semibold text-white">Video Source Ingestion</span>
            <span className="text-xs font-mono text-slate-400">Supported: .avi, .mp4, .mov</span>
          </div>

          <div className="border-2 border-dashed border-[#2c3852] rounded-xl p-8 text-center space-y-3 hover:border-cyan-500/50 transition-colors cursor-pointer bg-[#0a0c10]/40">
            <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drag and drop a surveillance or pedestrian recording here
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                or choose from sample feeds: crosswalk.avi, fourway.avi, night.avi
              </p>
            </div>
            <button className="px-4 py-2 rounded-md bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-medium text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
              SELECT VIDEO FILE
            </button>
          </div>
        </div>

        {/* Inference Settings */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-3 text-slate-200 font-semibold">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>INFERENCE PARAMETERS</span>
          </div>

          <div className="space-y-4 text-slate-300">
            <div>
              <label className="block text-slate-400 mb-1">Confidence Threshold: 0.25</label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                defaultValue="0.25"
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Frame Stride: 1 (Process all)</label>
              <select className="w-full bg-[#0a0c10] border border-[#2c3852] rounded p-2 text-slate-200">
                <option value="1">1 — Maximum precision (every frame)</option>
                <option value="2">2 — High performance (every 2nd frame)</option>
                <option value="5">5 — Fast preview (every 5th frame)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Detector Target</label>
              <div className="p-2 rounded bg-[#0a0c10] border border-[#2c3852] text-slate-300">
                Class 0: Person (Pedestrians only)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
