import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Bell,
  Navigation,
  ChevronDown,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { ThemeToggle } from '../components/common/ThemeToggle'

interface PublicLayoutProps {
  children: React.ReactNode
  selectedCity: string
  onSelectCity: (city: string) => void
  onUseGPS: () => void
  overallStatus: 'GREEN' | 'YELLOW' | 'RED'
  activeAlertsCount: number
  notifications: Array<{
    id: string
    title: string
    locality: string
    severity: string
    time: string
    action: string
  }>
}

export const INDIAN_CITIES = [
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
]

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  selectedCity,
  onSelectCity,
  onUseGPS,
  overallStatus,
  activeAlertsCount,
  notifications,
}) => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [indexMenuOpen, setIndexMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#ECEAE5] dark:bg-[#0E131C] text-[#111111] dark:text-[#F8FAFC] transition-colors">
      {/* Top Editorial Civic Navigation (Figma-Matched) */}
      <header className="sticky top-0 z-40 bg-[#ECEAE5]/95 dark:bg-[#0E131C]/95 backdrop-blur-md border-b border-[#D8D6CE] dark:border-[#253144] px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <CrowdPulseLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Center: Editorial Page Identifier (Figma 01 HOME) */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono tracking-widest uppercase">
          <span className="text-[#111111] dark:text-[#F8FAFC] font-bold border-b-2 border-[#111111] dark:border-[#CEF03C] pb-0.5">
            01 HOME
          </span>
          <a
            href="#live-operations"
            className="text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-[#F8FAFC] transition-colors"
          >
            02 LIVE ALERTS
          </a>
          <Link
            to="/authority"
            className="text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-[#F8FAFC] transition-colors"
          >
            03 AUTHORITY
          </Link>
        </div>

        {/* Right Controls: Location, Theme Toggle, Alerts, and INDEX Menu */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Location Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] font-medium text-[#111111] dark:text-[#F8FAFC] hover:border-[#176B65] transition-colors shadow-2xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#176B65] dark:text-[#CEF03C]" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-[#6B726C] dark:text-[#94A3B8]" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-44 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] py-1.5 shadow-xl z-50">
                <div className="px-3 py-1 text-[10px] text-[#6B726C] dark:text-[#94A3B8] uppercase tracking-wider font-mono">
                  Select Metro Area
                </div>
                {INDIAN_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      onSelectCity(c.name)
                      setCityDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-[#F6F5F0] dark:hover:bg-[#1E2837] transition-colors cursor-pointer ${
                      selectedCity === c.name
                        ? 'text-[#176B65] dark:text-[#CEF03C] font-semibold bg-[#176B65]/10'
                        : 'text-[#111111] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-[#6B726C] dark:text-[#94A3B8]">{c.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Quick Button */}
          <button
            onClick={onUseGPS}
            title="Detect location"
            className="hidden sm:flex p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] text-[#6B726C] dark:text-[#94A3B8] hover:text-[#176B65] transition-colors cursor-pointer shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          {/* Regional Status Pill */}
          <div
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              overallStatus === 'RED'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : overallStatus === 'YELLOW'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                overallStatus === 'RED'
                  ? 'bg-rose-500 animate-pulse'
                  : overallStatus === 'YELLOW'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span>{overallStatus === 'RED' ? 'Surge Alert' : overallStatus === 'YELLOW' ? 'Moderate' : 'Fluid Flow'}</span>
          </div>

          {/* Alerts Bell */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] text-[#111111] dark:text-[#F8FAFC] hover:border-[#176B65] transition-colors cursor-pointer shadow-2xs"
            aria-label="View safety alerts"
            title="View safety alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C94C4C] text-white text-[10px] font-bold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Dedicated Dark / Light Mode Toggle Button */}
          <ThemeToggle />

          {/* Figma-Style INDEX Menu Button */}
          <button
            onClick={() => setIndexMenuOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] text-xs font-mono font-bold tracking-wider text-[#111111] dark:text-[#F8FAFC] hover:border-[#111111] dark:hover:border-white transition-colors cursor-pointer shadow-2xs"
          >
            <span>INDEX</span>
            <div className="flex flex-col space-y-0.5 justify-center">
              <span className="w-3.5 h-[1.5px] bg-current" />
              <span className="w-3.5 h-[1.5px] bg-current" />
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#D8D6CE] dark:border-[#253144] bg-[#ECEAE5] dark:bg-[#0E131C] px-6 py-8 text-xs font-mono text-[#6B726C] dark:text-[#94A3B8] transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#111111] dark:text-[#F8FAFC]">CROWDPULSE</span>
            <span>•</span>
            <span>SEE THE FLOW. SENSE THE SHIFT.</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link to="/" className="hover:text-[#111111] dark:hover:text-white transition-colors">Role Gateway</Link>
            <Link to="/authority" className="hover:text-[#111111] dark:hover:text-white transition-colors">Authority Operations</Link>
            <Link to="/admin" className="hover:text-[#111111] dark:hover:text-white transition-colors">System Admin</Link>
            <span>Emergency Dial: <strong>112</strong> / <strong>100</strong></span>
          </div>
        </div>
      </footer>

      {/* INDEX Slide-Over Directory Modal */}
      {indexMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#ECEAE5] dark:bg-[#121722] border-l border-[#D8D6CE] dark:border-[#253144] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#D8D6CE] dark:border-[#253144] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B726C] dark:text-[#94A3B8]">
                    NAVIGATION DIRECTORY
                  </span>
                  <h3 className="text-lg font-bold text-[#111111] dark:text-white font-mono">
                    CrowdPulse Index
                  </h3>
                </div>
                <button
                  onClick={() => setIndexMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#6B726C] dark:text-[#94A3B8] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <Link
                  to="/public"
                  onClick={() => setIndexMenuOpen(false)}
                  className="block p-3.5 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] hover:border-[#176B65] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] dark:text-white group-hover:text-[#176B65]">01 / PUBLIC CITIZEN PORTAL</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] mt-1 font-sans">
                    Spatial Flow hero, verified incidents map, and live safety advisories near you.
                  </p>
                </Link>

                <Link
                  to="/authority"
                  onClick={() => setIndexMenuOpen(false)}
                  className="block p-3.5 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] hover:border-[#176B65] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] dark:text-white group-hover:text-[#176B65]">02 / AUTHORITY COMMAND CENTER</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] mt-1 font-sans">
                    Live city operations, CCTV trajectory analysis, incident verification queue, and advisory broadcast.
                  </p>
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setIndexMenuOpen(false)}
                  className="block p-3.5 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] hover:border-[#176B65] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] dark:text-white group-hover:text-[#176B65]">03 / PLATFORM & ML LABS</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] mt-1 font-sans">
                    Ground-truth datasets, Random Forest holdout metrics, and SHAP explainability.
                  </p>
                </Link>

                <Link
                  to="/"
                  onClick={() => setIndexMenuOpen(false)}
                  className="block p-3.5 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF] dark:bg-[#161D29] hover:border-[#176B65] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] dark:text-white group-hover:text-[#176B65]">04 / ROLE SELECTION GATEWAY</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] mt-1 font-sans">
                    Switch between Public Citizen access and Authorized Emergency Personnel mode.
                  </p>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D8D6CE] dark:border-[#253144] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6B726C] dark:text-[#94A3B8]">Interface Theme:</span>
                <ThemeToggle />
              </div>
              <div className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] font-mono text-center">
                CrowdPulse v2.0 • Pune Metropolitan Operations
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Alerts Drawer */}
      {notificationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#161D29] border-l border-[#D8D6CE] dark:border-[#253144] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8D6CE] dark:border-[#253144] pb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#C94C4C]" />
                  <h3 className="font-semibold text-base text-[#111111] dark:text-white">Active Crowd Advisories</h3>
                </div>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#6B726C] dark:text-[#94A3B8] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B726C] dark:text-[#94A3B8] space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-[#38845B] mx-auto" />
                  <p>All monitored concourses in {selectedCity} are currently operating with fluid flow.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#F6F5F0] dark:bg-[#111722] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            n.severity === 'RED'
                              ? 'bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/20'
                              : 'bg-[#D69B32]/10 text-[#D69B32] border border-[#D69B32]/20'
                          }`}
                        >
                          {n.severity === 'RED' ? 'Avoid Area' : 'Caution'}
                        </span>
                        <span className="text-[10px] text-[#6B726C] dark:text-[#94A3B8] font-mono">{n.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#111111] dark:text-white">{n.title}</h4>
                      <p className="text-xs text-[#6B726C] dark:text-[#94A3B8]">{n.action}</p>
                      <div className="text-[10px] text-[#176B65] dark:text-[#CEF03C] font-semibold">{n.locality}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#D8D6CE] dark:border-[#253144] text-xs text-center text-[#6B726C] dark:text-[#94A3B8]">
              For police, fire, or ambulance assistance, call <strong>112</strong> immediately.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
