import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            <span>System Settings & Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            ENVIRONMENT RUNTIME, THRESHOLDS & STORAGE MANAGEMENT
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-semibold text-white">CORE APPLICATION PREFERENCES</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex justify-between items-center py-2 border-b border-[#1e2638]">
            <span>Theme Mode</span>
            <span className="text-cyan-400 font-bold">Dark (Technical High-Contrast)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#1e2638]">
            <span>Default Processing Stride</span>
            <span className="text-slate-400">1 (Every frame)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#1e2638]">
            <span>Storage Root</span>
            <span className="text-slate-400">./data/ & ./outputs/</span>
          </div>
        </div>
      </div>
    </div>
  )
}
