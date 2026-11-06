import React from 'react'
import { Box } from 'lucide-react'

export const CrowdMapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-2">
            <Box className="w-6 h-6 text-cyan-400" />
            <span>Interactive 3D Crowd Map</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            THREE.JS & REACT THREE FIBER SPATIAL FLOW VISUALIZATION
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
            R3F / WEBGL
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-8 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center">
        <Box className="w-16 h-16 text-cyan-400/40 animate-pulse" />
        <h3 className="text-base font-bold text-white font-mono">3D Spatial Scene Container</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Connected to analyzed pedestrian coordinate streams, spatial zoning bounds, and density gradients.
        </p>
      </div>
    </div>
  )
}
