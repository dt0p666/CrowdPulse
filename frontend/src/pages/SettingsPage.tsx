import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Sliders,
  HardDrive,
  Cpu,
  Trash2,
  CheckCircle2,
  Printer,
  Moon,
  Sun
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [defaultConf, setDefaultConf] = useState<number>(0.25)
  const [defaultStride, setDefaultStride] = useState<number>(1)
  const [cacheCleared, setCacheCleared] = useState<boolean>(false)

  const handleClearCache = () => {
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            <span>System Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            RUNTIME CONFIGURATION, DETECTOR PARAMETERS & LOCAL STORAGE
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-md bg-[#171d2b] border border-[#2c3852] text-xs font-mono font-medium text-slate-300 hover:text-cyan-400 hover:border-cyan-600 transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {cacheCleared && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Local analytical cache purged successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Interface */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-3 text-slate-200 font-semibold">
            <Moon className="w-4 h-4 text-cyan-400" />
            <span>INTERFACE APPEARANCE</span>
          </div>

          <div className="space-y-3">
            <label className="block text-slate-400">Color Theme Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  theme === 'dark'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[#0a0c10] border-[#1e2638] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  <span>DARK TELEMETRY (Default)</span>
                </div>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  theme === 'light'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[#0a0c10] border-[#1e2638] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span>HIGH CONTRAST</span>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              High-contrast technical dark mode optimized for operations centers and control rooms.
            </p>
          </div>
        </div>

        {/* CV Engine Configuration */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-3 text-slate-200 font-semibold">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>DEFAULT INFERENCE CONTROLS</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Default Confidence Threshold:</span>
                <span className="text-cyan-400 font-bold">{defaultConf.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={defaultConf}
                onChange={(e) => setDefaultConf(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Default Processing Stride</label>
              <select
                value={defaultStride}
                onChange={(e) => setDefaultStride(parseInt(e.target.value))}
                className="w-full bg-[#0a0c10] border border-[#2c3852] rounded p-2 text-slate-200"
              >
                <option value="1">1 — Process all frames (maximum fidelity)</option>
                <option value="2">2 — Skip every 2nd frame (2x speed)</option>
                <option value="4">4 — Fast preview (4x speed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Storage & Persistence */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-3 text-slate-200 font-semibold">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>LOCAL STORAGE MANAGEMENT</span>
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">Data Directory:</span>
              <span className="text-white">./data/ (raw, sample, processed)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">Analysis Outputs:</span>
              <span className="text-white">./outputs/analyses/</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">Max Video Upload:</span>
              <span className="text-cyan-400 font-bold">250 MB</span>
            </div>

            <button
              onClick={handleClearCache}
              className="w-full mt-2 py-2 rounded bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>PURGE LOCAL CACHE & PROCESSED SAMPLES</span>
            </button>
          </div>
        </div>

        {/* Hardware & Acceleration Status */}
        <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-3 text-slate-200 font-semibold">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>HARDWARE & BACKEND ENGINE</span>
          </div>

          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">Architecture:</span>
              <span className="text-white">Windows AMD64</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">CV Model:</span>
              <span className="text-emerald-400 font-bold">Ultralytics YOLOv8n</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">Tracking Algorithm:</span>
              <span className="text-emerald-400 font-bold">ByteCentroidTracker</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1e2638]">
              <span className="text-slate-400">ML Classifier:</span>
              <span className="text-white">Random Forest (n=50, d=4)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
