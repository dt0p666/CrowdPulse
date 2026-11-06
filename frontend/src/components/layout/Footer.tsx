import React from 'react'
import { ShieldAlert, ArrowUp } from 'lucide-react'

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-[#1e2638] bg-[#07090c] py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Research & decision-support platform. Does not guarantee stampede prevention or substitute for on-site crowd safety protocols.
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <span>CrowdPulse v1.0.0</span>
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Back to top"
            aria-label="Back to top"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
