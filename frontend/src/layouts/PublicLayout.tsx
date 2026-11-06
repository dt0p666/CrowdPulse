import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Bell,
  Navigation,
  ShieldAlert,
  ChevronDown,
  X,
  ArrowRight,
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
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F0] text-[#202522]">
      {/* Top Civic Navigation */}
      <header className="sticky top-0 z-40 bg-[#F6F5F0]/95 backdrop-blur-md border-b border-[#DFE2DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/public" className="flex items-center">
              <CrowdPulseLogo size="md" showTagline={false} />
            </Link>

            {/* Center: My Location Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DFE2DC] text-xs font-medium text-[#202522] hover:border-[#176B65] transition-colors shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#176B65]" />
                  <span>{selectedCity}, India</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#777D78]" />
                </button>

                {cityDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-48 rounded-xl border border-[#DFE2DC] bg-[#FFFFFF] py-1.5 text-xs shadow-lg z-50">
                    <div className="px-3 py-1 text-[10px] text-[#777D78] uppercase tracking-wider font-medium">
                      Select Region
                    </div>
                    {INDIAN_CITIES.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          onSelectCity(c.name)
                          setCityDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F6F5F0] transition-colors ${
                          selectedCity === c.name
                            ? 'text-[#176B65] font-semibold bg-[#EBF4F3]'
                            : 'text-[#202522]'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-[#777D78]">{c.state}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Button */}
              <button
                onClick={onUseGPS}
                title="Locate my position via device GPS"
                className="p-2 rounded-full bg-[#FFFFFF] border border-[#DFE2DC] text-[#777D78] hover:text-[#176B65] hover:border-[#176B65] transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Navigation Links & Status */}
            <div className="flex items-center space-x-4 text-xs font-medium">
              {/* How it Works link */}
              <button
                onClick={() => setHowItWorksOpen(true)}
                className="hidden md:inline-block text-[#777D78] hover:text-[#202522] transition-colors"
              >
                How it works
              </button>

              {/* Overall Status Pill */}
              <div
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  overallStatus === 'RED'
                    ? 'bg-[#FDF2F2] text-[#C94C4C] border-[#F8D7D7]'
                    : overallStatus === 'YELLOW'
                    ? 'bg-[#FEF8ED] text-[#D69B32] border-[#FBEAC9]'
                    : 'bg-[#EEF7F2] text-[#38845B] border-[#D1EBDD]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    overallStatus === 'RED'
                      ? 'bg-[#C94C4C]'
                      : overallStatus === 'YELLOW'
                      ? 'bg-[#D69B32]'
                      : 'bg-[#38845B]'
                  }`}
                />
                <span>
                  {overallStatus === 'RED'
                    ? 'High Congestion Active'
                    : overallStatus === 'YELLOW'
                    ? 'Moderate Density'
                    : 'Normal Flow'}
                </span>
              </div>

              {/* Alerts Bell */}
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative p-2 rounded-full bg-[#FFFFFF] border border-[#DFE2DC] text-[#202522] hover:border-[#176B65] transition-colors shadow-2xs"
                aria-label="View safety alerts"
              >
                <Bell className="w-4 h-4 text-[#202522]" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C94C4C] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeAlertsCount}
                  </span>
                )}
              </button>

              {/* Authority Sign In link */}
              <Link
                to="/authority/login"
                className="hidden lg:inline-flex items-center space-x-1 text-[#176B65] hover:text-[#12544F] transition-colors pl-3 border-l border-[#DFE2DC]"
              >
                <span>Authority Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Public Civic Footer */}
      <footer className="border-t border-[#DFE2DC] bg-[#ECEDE8] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#777D78] mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-[#202522]">
            <ShieldAlert className="w-4 h-4 text-[#D69B32] shrink-0" />
            <span>
              National Emergency Services: <strong>112</strong> | Police: <strong>100</strong> | Ambulance: <strong>108</strong>
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-[#777D78]">
            <span>Demonstration Safety Portal • India</span>
            <Link to="/authority/login" className="hover:text-[#176B65] transition-colors font-medium">
              Authorised Control Room Login
            </Link>
            <Link to="/" className="hover:text-[#202522] transition-colors">
              Switch Role
            </Link>
          </div>
        </div>
      </footer>

      {/* Slide-over Notification Drawer */}
      {notificationDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-2xs flex justify-end">
          <div className="w-full max-w-md bg-[#FFFFFF] border-l border-[#DFE2DC] h-full flex flex-col p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DFE2DC] pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[#176B65]" />
                <span className="font-semibold text-[#202522] text-sm">
                  Active Public Advisories
                </span>
              </div>
              <button
                onClick={() => setNotificationDrawerOpen(false)}
                className="p-1 rounded text-[#777D78] hover:text-[#202522]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              {notifications.length === 0 ? (
                <div className="py-16 text-center text-[#777D78]">
                  No active crowd-safety advisories for {selectedCity}.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-xl border border-[#DFE2DC] bg-[#F6F5F0] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          notif.severity === 'RED'
                            ? 'bg-[#FDF2F2] text-[#C94C4C]'
                            : notif.severity === 'YELLOW'
                            ? 'bg-[#FEF8ED] text-[#D69B32]'
                            : 'bg-[#EEF7F2] text-[#38845B]'
                        }`}
                      >
                        {notif.severity === 'RED' ? 'Red Alert' : notif.severity === 'YELLOW' ? 'Moderate Congestion' : 'Normal'}
                      </span>
                      <span className="text-[10px] text-[#777D78]">{notif.time}</span>
                    </div>

                    <h4 className="font-semibold text-[#202522] text-sm">{notif.title}</h4>
                    <p className="text-[#777D78] text-xs">{notif.locality}</p>

                    <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#DFE2DC] text-[#202522] text-[11px] leading-relaxed">
                      <strong className="text-[#176B65]">Action:</strong> {notif.action}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#DFE2DC] text-[11px] text-[#777D78] text-center">
              Alerts update as verified by local traffic and emergency authorities.
            </div>
          </div>
        </div>
      )}

      {/* How it Works Modal */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DFE2DC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE2DC] pb-3">
              <h3 className="font-semibold text-[#202522] text-base">
                How CrowdPulse Works
              </h3>
              <button
                onClick={() => setHowItWorksOpen(false)}
                className="text-[#777D78] hover:text-[#202522]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#777D78] leading-relaxed">
              <p>
                CrowdPulse aggregates verified crowd movement updates and pedestrian density observations from municipal safety and traffic authorities.
              </p>
              <div className="p-3 rounded-xl bg-[#F6F5F0] border border-[#DFE2DC] space-y-1.5 text-[#202522]">
                <div className="font-semibold text-[#176B65]">4 Simple Answers:</div>
                <ul className="space-y-1 text-xs text-[#777D78]">
                  <li>• <strong>What</strong> is happening nearby</li>
                  <li>• <strong>Where</strong> the congestion or choke point is</li>
                  <li>• <strong>How close</strong> it is to your selected location</li>
                  <li>• <strong>What to do</strong> to bypass delays safely</li>
                </ul>
              </div>
              <p className="text-[11px]">
                No personal data, camera footage, or facial recognition is ever shared with the public. All tracking is completely anonymous.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setHowItWorksOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#176B65] text-white text-xs font-medium hover:bg-[#12544F] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
