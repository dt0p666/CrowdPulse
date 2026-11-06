import React from 'react'
import { BrainCircuit } from 'lucide-react'

export const PredictionLabPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>Spatiotemporal Prediction Lab</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            CROWD-STATE ESTIMATES & CHRONOLOGICAL ML EVALUATION
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white font-mono">DESCRIPTIVE CROWD STATES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { state: 'Stable', color: 'emerald', desc: 'Uniform velocities, low conflict' },
            { state: 'Densifying', color: 'cyan', desc: 'Rising occupancy, velocity compression' },
            { state: 'Congested', color: 'amber', desc: 'Localized accumulation, stagnation' },
            { state: 'Elevated Risk', color: 'rose', desc: 'Multi-directional flow conflict' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg border border-[#1e2638] bg-[#0a0c10] space-y-1">
              <span className={`text-xs font-mono font-bold text-${item.color}-400`}>{item.state}</span>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
