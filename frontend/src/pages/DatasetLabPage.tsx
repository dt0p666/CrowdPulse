import React from 'react'
import { FileSpreadsheet } from 'lucide-react'

export const DatasetLabPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Mode B: Structured Dataset Lab</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SCHEMA VALIDATION, TRAJECTORY RECONSTRUCTION & MULTI-SCENARIO METRICS
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono">
            ENGINE: PANDAS + NUMPY
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['crosswalk.csv (378 rows)', 'fourway.csv (1281 rows)', 'night.csv (565 rows)'].map((name, i) => (
          <div key={i} className="rounded-xl border border-[#1e2638] bg-[#121620] p-4 space-y-2 hover:border-[#2c3852] transition-colors">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-semibold">{name.split(' ')[0]}</span>
              <span className="text-slate-400">{name.split(' ')[1]}</span>
            </div>
            <div className="text-xs text-slate-300">
              Columns: <code className="text-cyan-400 font-mono">x, y, w, h</code> (1:1 Frame-Matched)
            </div>
            <button className="w-full mt-2 py-1.5 rounded bg-[#171d2b] border border-[#2c3852] text-xs font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-600 transition-colors">
              INSPECT DATASET
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
