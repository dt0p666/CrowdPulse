import React from 'react'
import { HelpCircle } from 'lucide-react'

export const ExplainabilityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <span>Explainability & Assessment Factors</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SHAP CONTRIBUTIONS, FEATURE IMPORTANCE & CONFIDENCE DECOMPOSITION
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e2638] bg-[#121620] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white font-mono">PRIMARY RISK INDICATOR FACTORS</h3>
        <p className="text-xs text-slate-400">
          Explaining the contributing weights that cause an automated crowd state shift.
        </p>
      </div>
    </div>
  )
}
