import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Bell,
  Navigation,
  ShieldAlert,
  ChevronDown,
  X,
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'

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

  return (
    <div className="min-h-screen flex flex-col bg-[#090b0e] text-slate-100">
      {/* Top Civic Navigation */}
      <header className="sticky top-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/public" className="flex items-center">
              <CrowdPulseLogo size="md" showTagline={false} />
              <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                CITIZEN PORTAL
              </span>
            </Link>

            {/* Center: Location Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121620] border border-[#2c3852] text-xs font-mono text-slate-200 hover:border-cyan-500 transition-colors shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold">{selectedCity}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {cityDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 w-48 rounded-xl border border-[#2c3852] bg-[#0c0e14] py-1.5 font-mono text-xs shadow-xl z-50">
                    <div className="px-3 py-1 text-[10px] text-slate-500 uppercase tracking-wider">
                      SELECT CITY (INDIA)
                    </div>
                    {INDIAN_CITIES.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          onSelectCity(c.name)
                          setCityDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#171d2b] transition-colors ${
                          selectedCity === c.name ? 'text-cyan-400 font-bold bg-[#121620]' : 'text-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-500">{c.state}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Button */}
              <button
                onClick={onUseGPS}
                title="Use current GPS location"
                className="p-1.5 rounded-lg bg-[#121620] border border-[#2c3852] text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Alert Status Pill & Notifications Bell */}
            <div className="flex items-center space-x-3">
              {/* Overall Status Badge */}
              <div
                className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  overallStatus === 'RED'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse'
                    : overallStatus === 'YELLOW'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    overallStatus === 'RED'
                      ? 'bg-rose-500'
                      : overallStatus === 'YELLOW'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {overallStatus === 'RED'
                    ? 'AVOID ACTIVE ZONES'
                    : overallStatus === 'YELLOW'
                    ? 'CONGESTION REPORTED'
                    : 'ALL AREAS NORMAL'}
                </span>
              </div>

              {/* Notification Drawer Bell */}
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative p-2 rounded-lg bg-[#121620] border border-[#2c3852] text-slate-300 hover:text-white transition-colors"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {activeAlertsCount}
                  </span>
                )}
              </button>

              {/* Role Switch */}
              <Link
                to="/"
                className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline-block pl-2 border-l border-[#1e2638]"
              >
                Switch Role
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#1e2638] bg-[#07090c] py-6 px-4 sm:px-6 lg:px-8 font-mono text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              EMERGENCY DIAL: <strong className="text-white">112</strong> (National) | <strong className="text-white">100</strong> (Police) | <strong className="text-white">108</strong> (Ambulance)
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-500">
            <span>Demonstration Safety Portal • India</span>
            <Link to="/authority/login" className="hover:text-emerald-400 transition-colors">
              Authorised Authority Login
            </Link>
          </div>
        </div>
      </footer>

      {/* In-App Notification Slide-Over Drawer */}
      {notificationDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0c0e14] border-l border-[#1e2638] h-full flex flex-col p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white text-sm">Public Safety Alerts</span>
              </div>
              <button
                onClick={() => setNotificationDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No active public safety advisories for {selectedCity}.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl border border-[#1e2638] bg-[#121620] space-y-2 hover:border-[#2c3852] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          notif.severity === 'RED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : notif.severity === 'YELLOW'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {notif.severity} ALERT
                      </span>
                      <span className="text-[10px] text-slate-500">{notif.time}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                    <p className="text-slate-400 text-xs">{notif.locality}</p>

                    <div className="p-2 rounded bg-[#0a0c10] border border-[#2c3852] text-slate-300 text-[11px] leading-relaxed">
                      <strong className="text-cyan-400">Action:</strong> {notif.action}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#1e2638] text-[11px] font-mono text-slate-500 text-center">
              Alerts update in real-time as verified by metropolitan safety authorities.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
