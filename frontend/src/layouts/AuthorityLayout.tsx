import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldAlert,
  Video,
  Send,
  Box,
  FileText,
  LogOut,
  Bell,
  Search,
  PhoneCall,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { getCurrentUser, logoutUser } from '../services/auth'

interface AuthorityLayoutProps {
  children: React.ReactNode
  breadcrumb?: string
}

export const AuthorityLayout: React.FC<AuthorityLayoutProps> = ({
  children,
  breadcrumb = 'Operations Overview',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false)

  const navItems = [
    { label: 'City Operations', path: '/authority', icon: LayoutDashboard },
    { label: 'Incident Review & Queue', path: '/authority/incidents', icon: ShieldAlert },
    { label: 'CCTV Feeds & CV HUD', path: '/authority/cameras', icon: Video },
    { label: 'Broadcast Advisory', path: '/authority/advisory', icon: Send },
    { label: 'Venue 3D Intelligence', path: '/authority/analytics', icon: Box },
    { label: 'Accountability Audit', path: '/authority/audit', icon: FileText },
  ]

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Operations Command Bar (matching reference 84100ca5.jpg) */}
      <header className="sticky top-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-b border-[#1b2233] px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-[#121620] text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/authority" className="flex items-center">
            <CrowdPulseLogo size="sm" showTagline={false} />
            <span className="hidden lg:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              COMMAND CENTER
            </span>
          </Link>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-400 pl-4 border-l border-[#1b2233]">
            <span className="text-slate-500">Main Center</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold">{breadcrumb}</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-6 relative font-mono text-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search incidents, assets, locations..."
            className="w-full bg-[#111520] border border-[#222b40] rounded-xl pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Right: Emergency Mode Button + Notifications + Profile */}
        <div className="flex items-center space-x-3">
          {/* Emergency Mode Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-rose-950/50 animate-pulse"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency Mode</span>
          </button>

          {/* Bell */}
          <button className="p-2 rounded-xl bg-[#111520] border border-[#222b40] text-slate-300 hover:text-white transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {/* User Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-[#1b2233]">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
              {user ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="font-mono text-left text-xs leading-none">
              <div className="text-white font-bold">{user?.name || 'Authorized Officer'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{user?.badgeId || 'Badge #MH-PN-2041'}</div>
            </div>
          </div>

          {/* Logout / Switch */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl bg-[#111520] border border-[#222b40] text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 pt-16 w-64 bg-[#0a0c12] border-r border-[#1b2233] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:pt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1 font-mono text-xs">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              COMMAND MODULES
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121622]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="p-4 mt-auto border-t border-[#1b2233] font-mono text-xs space-y-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">SYSTEM STATUS</div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">CV Model:</span>
              <span className="text-emerald-400 font-bold">YOLOv8 + ByteTrack</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Station:</span>
              <span className="text-white">Pune Traffic HQ</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#07090d]">
          {children}
        </main>
      </div>

      {/* Emergency Mode Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-lg w-full bg-[#0d1017] border border-rose-600 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <h3 className="font-mono font-bold text-white text-base">EMERGENCY PROTOCOL OVERRIDE</h3>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="text-slate-300 leading-relaxed">
                Triggering Emergency Override broadcasts highest-priority siren alerts, notifies all field patrol units, and prioritizes live CCTV tracking channels.
              </p>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
                <strong>Attention Officer:</strong> All manual overrides are permanently logged into the state accountability audit trail with your badge identifier.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#121620] border border-[#2c3852] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Emergency broadcast transmitted to Metropolitan Control Center.')
                    setEmergencyModalOpen(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950"
                >
                  Confirm Emergency Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
