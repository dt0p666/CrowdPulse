import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Shield,
  Sliders,
  ArrowRight,
  AlertTriangle,
  Lock,
  Sparkles,
  Info
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { setActiveSession } from '../services/auth'

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate()
  const [showDemoModal, setShowDemoModal] = useState(false)

  const handleContinueAsPublic = () => {
    setActiveSession({ role: 'public_guest', name: 'Citizen Guest' })
    navigate('/public')
  }

  const handleQuickDemoAuthority = () => {
    setActiveSession({
      role: 'authority_officer',
      name: 'Inspector S. Kulkarni',
      badge: 'MH-PUN-4012',
      department: 'Pune Metropolitan Police & Disaster Management',
      city: 'Pune',
      token: 'demo-token-authority'
    })
    navigate('/authority')
  }

  const handleQuickDemoAdmin = () => {
    setActiveSession({
      role: 'admin',
      name: 'System Admin (Dev Mode)',
      badge: 'SYS-ROOT-01',
      department: 'Platform Engineering & Research',
      city: 'Pune Central Hub',
      token: 'demo-token-admin'
    })
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#07090c] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Wave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-950/20 via-emerald-950/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <CrowdPulseLogo size="md" showTagline={true} />
        <button
          onClick={() => setShowDemoModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#121620] border border-[#2c3852] text-xs font-mono text-cyan-400 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Demo Credentials</span>
        </button>
      </header>

      {/* Main Choice Container */}
      <main className="max-w-5xl w-full mx-auto my-auto py-10 z-10 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#121620] border border-[#1e2638] text-cyan-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY SAFETY & OPERATIONAL RESPONSE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
            How would you like to continue?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-sans">
            CrowdPulse connects real-time crowd dynamics with verified authority advisories to keep citizens safe and decision-makers informed.
          </p>
        </div>

        {/* The 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Public Portal */}
          <div
            onClick={handleContinueAsPublic}
            className="group relative rounded-2xl border border-[#1e2638] bg-[#0c0e14] hover:bg-[#121620] p-7 transition-all duration-300 hover:border-cyan-500/80 hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
                  PUBLIC PORTAL
                </span>
                <h3 className="text-xl font-bold text-white font-mono">I'm a Member of the Public</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check local crowd conditions, view verified incidents nearby, inspect affected routes on a clean map, and receive official safety advisories.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">No login required</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Location-aware</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Safety alerts</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1e2638] flex items-center justify-between text-xs font-mono font-semibold text-cyan-400 group-hover:text-cyan-300">
              <span>CONTINUE AS GUEST</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Authority Portal */}
          <div
            onClick={() => navigate('/authority/login')}
            className="group relative rounded-2xl border border-[#1e2638] bg-[#0c0e14] hover:bg-[#121620] p-7 transition-all duration-300 hover:border-emerald-500/80 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                  RESTRICTED OPERATIONS
                </span>
                <h3 className="text-xl font-bold text-white font-mono">Authorised Personnel</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated workspace for police, disaster response, and venue safety managers. Inspect surveillance feeds, verify AI flags, and broadcast official public alerts.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Role authenticated</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Live CCTV analysis</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Advisory publisher</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1e2638] flex items-center justify-between text-xs font-mono font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>AUTHORITY SIGN-IN</span>
              <Lock className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Platform Admin */}
          <div
            onClick={handleQuickDemoAdmin}
            className="group relative rounded-2xl border border-[#1e2638] bg-[#0c0e14] hover:bg-[#121620] p-7 transition-all duration-300 hover:border-amber-500/80 hover:shadow-xl hover:shadow-amber-950/30 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-400 tracking-wider uppercase">
                  SYSTEM & DATA CORE
                </span>
                <h3 className="text-xl font-bold text-white font-mono">Platform Admin</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspect raw reference datasets (crosswalk, fourway, night), review AI model evaluation benchmarks, manage camera registries, and audit operational history.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Dataset Lab</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">ML Benchmarks</span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-[#1e2638]">Audit history</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1e2638] flex items-center justify-between text-xs font-mono font-semibold text-amber-400 group-hover:text-amber-300">
              <span>ADMIN CONSOLE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center font-mono text-xs text-slate-500 py-4 border-t border-[#1e2638] z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>CrowdPulse public safety and authority intelligence platform.</span>
        </div>
        <div>v2.0 • SEE THE FLOW. SENSE THE SHIFT.</div>
      </footer>

      {/* Demo Credentials Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-[#2c3852] bg-[#0c0e14] p-6 space-y-5 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <span className="font-bold text-white text-sm">Instant Demonstration Access</span>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              For rapid local testing without typing passwords, click any role below to instantly log in as a pre-configured verified persona:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowDemoModal(false)
                  handleQuickDemoAuthority()
                }}
                className="w-full p-3 rounded-lg border border-emerald-800 bg-emerald-950/40 text-left hover:bg-emerald-900/60 transition-colors"
              >
                <div className="font-bold text-emerald-300">Authority: Inspector S. Kulkarni</div>
                <div className="text-[11px] text-slate-400">Pune Police & Disaster Operations (Badge #MH-PUN-4012)</div>
              </button>

              <button
                onClick={() => {
                  setShowDemoModal(false)
                  handleQuickDemoAdmin()
                }}
                className="w-full p-3 rounded-lg border border-amber-800 bg-amber-950/40 text-left hover:bg-amber-900/60 transition-colors"
              >
                <div className="font-bold text-amber-300">Platform Administrator</div>
                <div className="text-[11px] text-slate-400">Full system & dataset management privileges</div>
              </button>

              <button
                onClick={() => {
                  setShowDemoModal(false)
                  handleContinueAsPublic()
                }}
                className="w-full p-3 rounded-lg border border-cyan-800 bg-cyan-950/40 text-left hover:bg-cyan-900/60 transition-colors"
              >
                <div className="font-bold text-cyan-300">Public Citizen Portal (Guest)</div>
                <div className="text-[11px] text-slate-400">No credentials needed, location-based safety feed</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
