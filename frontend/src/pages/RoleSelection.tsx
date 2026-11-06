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
    <div className="min-h-screen bg-[#F6F5F0] text-[#202522] flex flex-col justify-between p-6 sm:p-12 relative">
      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <CrowdPulseLogo size="md" showTagline={true} />
        <Link
          to="/authority/login"
          className="text-xs font-medium text-[#777D78] hover:text-[#176B65] transition-colors"
        >
          Authority sign-in →
        </Link>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-4xl w-full mx-auto my-auto py-12">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#202522]">
            Welcome to CrowdPulse.
          </h1>
          <p className="text-base text-[#777D78] leading-relaxed">
            How would you like to continue?
          </p>
        </div>

        {/* 2 Primary Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Option 1: Public Portal */}
          <div
            onClick={handleContinueAsPublic}
            className="group relative rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-8 sm:p-10 transition-all duration-200 hover:border-[#176B65] hover:shadow-lg flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#EBF4F3] text-[#176B65] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#176B65]">
                  Open Citizen Access
                </span>
                <h2 className="text-2xl font-semibold text-[#202522]">
                  Public Portal
                </h2>
                <p className="text-sm text-[#777D78] leading-relaxed">
                  For people who want to check crowd conditions and receive safety alerts in their area.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#777D78] pt-2">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38845B]" />
                  <span>No account required • Instant guest access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B65]" />
                  <span>Interactive geographic street map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D69B32]" />
                  <span>Verified safety advisories & alternate routes</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#DFE2DC] flex items-center justify-between font-medium text-sm text-[#176B65] group-hover:text-[#12544F]">
              <span>Continue as public citizen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Option 2: Authority Portal */}
          <div
            onClick={() => navigate('/authority/login')}
            className="group relative rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-8 sm:p-10 transition-all duration-200 hover:border-[#176B65] hover:shadow-lg flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#F4F5F2] text-[#202522] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#777D78]">
                  Authorised Personnel
                </span>
                <h2 className="text-2xl font-semibold text-[#202522]">
                  Authority Portal
                </h2>
                <p className="text-sm text-[#777D78] leading-relaxed">
                  For authorised personnel monitoring incidents, verifying surveillance flags, and coordinating responses.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[#777D78] pt-2">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202522]" />
                  <span>Restricted sign-in (Police, Disaster Response, Venue Staff)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B65]" />
                  <span>CCTV feeds with person tracking analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C94C4C]" />
                  <span>Incident verification & public advisory broadcast</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#DFE2DC] flex items-center justify-between font-medium text-sm text-[#202522] group-hover:text-[#176B65]">
              <span>Sign in to Command Center</span>
              <Lock className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer & Administrative Link */}
      <footer className="max-w-5xl w-full mx-auto pt-8 border-t border-[#DFE2DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777D78]">
        <div>
          CrowdPulse • Crowd-Flow Intelligence & Early Risk Prediction
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center space-x-1 hover:text-[#202522] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </button>
        </div>
      </footer>

      {/* Admin Demo Confirmation Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-[#FFFFFF] border border-[#DFE2DC] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-base text-[#202522]">
              Platform Administration
            </h3>
            <p className="text-xs text-[#777D78] leading-relaxed">
              Engineering operations, ground-truth dataset inspection (crosswalk, fourway, night), and ML model benchmarks.
            </p>
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-3 py-1.5 text-xs text-[#777D78] hover:text-[#202522]"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickDemoAdmin}
                className="px-4 py-2 rounded-xl bg-[#176B65] text-white font-medium text-xs hover:bg-[#12544F] transition-colors shadow-sm"
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
