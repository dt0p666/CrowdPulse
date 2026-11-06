import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users,
  Shield,
  ArrowRight,
  Lock,
  Settings,
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { ThemeToggle } from '../components/common/ThemeToggle'
import { setActiveSession } from '../services/auth'

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate()
  const [showAdminModal, setShowAdminModal] = useState(false)

  const handleContinueAsPublic = () => {
    setActiveSession({ role: 'public_guest', name: 'Citizen Guest' })
    navigate('/public')
  }

  const handleQuickDemoAdmin = () => {
    setActiveSession({
      role: 'admin',
      name: 'System Administrator',
      badge: 'SYS-ROOT-01',
      department: 'Platform Engineering & Research',
      city: 'Central Hub',
      token: 'demo-token-admin',
    })
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#ECEAE5] dark:bg-[#0E131C] text-[#111111] dark:text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-12 relative transition-colors selection:bg-[#176B65] selection:text-white">
      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <CrowdPulseLogo size="md" showTagline={true} />

        <div className="flex items-center space-x-4">
          <Link
            to="/authority/login"
            className="text-xs font-mono font-medium text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            Authority sign-in →
          </Link>

          {/* Working Dark / Light Mode Toggle Button at Top Right */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-4xl w-full mx-auto my-auto py-12">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white">
            Welcome to CrowdPulse.
          </h1>
          <p className="text-base text-[#6B726C] dark:text-[#94A3B8] leading-relaxed font-sans">
            How would you like to continue?
          </p>
        </div>

        {/* 2 Primary Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Option 1: Public Portal */}
          <div
            onClick={handleContinueAsPublic}
            className="group relative rounded-2xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] p-8 sm:p-10 transition-all duration-200 hover:border-[#176B65] dark:hover:border-[#CEF03C] hover:shadow-xl flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#176B65]/10 dark:bg-[#176B65]/20 text-[#176B65] dark:text-[#CEF03C] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#176B65] dark:text-[#CEF03C]">
                  Open Citizen Access
                </span>
                <h2 className="text-2xl font-bold text-[#111111] dark:text-white">
                  Public Portal
                </h2>
                <p className="text-sm text-[#6B726C] dark:text-[#94A3B8] leading-relaxed font-sans">
                  For people who want to check crowd flow, inspect spatial dynamics, and receive verified safety alerts in their area.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#6B726C] dark:text-[#94A3B8] pt-2 font-sans">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38845B]" />
                  <span>No account required • Instant guest access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B65] dark:bg-[#CEF03C]" />
                  <span>Interactive 3D spatial flow & Pune street map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D69B32]" />
                  <span>Verified safety advisories & alternate routes</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#D8D6CE] dark:border-[#253144] flex items-center justify-between font-semibold text-sm text-[#176B65] dark:text-[#CEF03C] group-hover:translate-x-0.5 transition-transform">
              <span>Continue as public citizen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Authority Portal */}
          <div
            onClick={() => navigate('/authority/login')}
            className="group relative rounded-2xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] p-8 sm:p-10 transition-all duration-200 hover:border-[#176B65] dark:hover:border-[#CEF03C] hover:shadow-xl flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 text-[#111111] dark:text-white flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#6B726C] dark:text-[#94A3B8]">
                  Authorised Personnel
                </span>
                <h2 className="text-2xl font-bold text-[#111111] dark:text-white">
                  Authority Portal
                </h2>
                <p className="text-sm text-[#6B726C] dark:text-[#94A3B8] leading-relaxed font-sans">
                  For emergency responders monitoring crowd density, verifying surveillance flags, and coordinating divergence advisories.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#6B726C] dark:text-[#94A3B8] pt-2 font-sans">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111] dark:bg-white" />
                  <span>Restricted sign-in (Police, Disaster Response, Venue Staff)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B65] dark:bg-[#CEF03C]" />
                  <span>CCTV feeds with person tracking analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C94C4C]" />
                  <span>Incident verification & public advisory broadcast</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#D8D6CE] dark:border-[#253144] flex items-center justify-between font-semibold text-sm text-[#111111] dark:text-white group-hover:text-[#176B65] dark:group-hover:text-[#CEF03C]">
              <span>Sign in to Command Center</span>
              <Lock className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer & Administrative Link */}
      <footer className="max-w-5xl w-full mx-auto pt-8 border-t border-[#D8D6CE] dark:border-[#253144] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6B726C] dark:text-[#94A3B8]">
        <div>
          CrowdPulse • See the flow. Sense the shift.
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center space-x-1.5 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </button>
        </div>
      </footer>

      {/* Admin Demo Confirmation Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-base text-[#111111] dark:text-white">
              Platform Administration
            </h3>
            <p className="text-xs text-[#6B726C] dark:text-[#94A3B8] leading-relaxed font-sans">
              Engineering operations, ground-truth dataset inspection (crosswalk, fourway, night), and ML model benchmarks.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickDemoAdmin}
                className="px-4 py-2 rounded-xl bg-[#176B65] text-white font-medium text-xs hover:bg-[#12544F] transition-colors shadow-sm cursor-pointer"
              >
                Open Admin Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
