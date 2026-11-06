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
import { ThemeToggle } from '../components/common/ThemeToggle'
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
    { label: 'CCTV Feeds & Movement', path: '/authority/cameras', icon: Video },
    { label: 'Broadcast Advisory', path: '/authority/advisory', icon: Send },
    { label: 'Venue Spatial View', path: '/authority/analytics', icon: Box },
    { label: 'Audit & Accountability', path: '/authority/audit', icon: FileText },
  ]

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#ECEAE5] dark:bg-[#0E131C] text-[#111111] dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#176B65] selection:text-white">
      {/* Top Operations Command Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#131924]/95 backdrop-blur-md border-b border-[#D8D6CE] dark:border-[#222E40] px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-[#F6F5F0] dark:bg-[#1B2333] text-[#6B726C] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/authority" className="flex items-center">
            <CrowdPulseLogo size="sm" showTagline={false} />
            <span className="hidden lg:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#176B65]/15 dark:bg-[#176B65]/30 text-[#176B65] dark:text-[#A8B9A7] border border-[#176B65]/30 dark:border-[#176B65]/50">
              Command Suite
            </span>
          </Link>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#6B726C] dark:text-slate-400 pl-4 border-l border-[#D8D6CE] dark:border-[#222E40]">
            <span className="text-[#6B726C] dark:text-slate-500">Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-slate-600" />
            <span className="text-[#111111] dark:text-white font-medium">{breadcrumb}</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-6 relative text-xs">
          <Search className="w-3.5 h-3.5 text-[#6B726C] dark:text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search incidents, assets, locations..."
            className="w-full bg-[#F6F5F0] dark:bg-[#1B2333] border border-[#D8D6CE] dark:border-[#2B3950] rounded-xl pl-8 pr-3 py-1.5 text-[#111111] dark:text-slate-200 placeholder-[#6B726C] dark:placeholder-slate-500 focus:outline-none focus:border-[#176B65] transition-colors"
          />
        </div>

        {/* Right: Emergency Mode Button + Notifications + ThemeToggle + Profile */}
        <div className="flex items-center space-x-3">
          {/* Emergency Mode Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#C94C4C] hover:bg-[#B33F3F] text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency Override</span>
          </button>

          {/* Bell */}
          <button className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2333] border border-[#D8D6CE] dark:border-[#2B3950] text-[#6B726C] dark:text-slate-300 hover:text-[#111111] dark:hover:text-white transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38845B]" />
          </button>

          {/* Working Dark / Light Mode Toggle Button */}
          <ThemeToggle />

          {/* User Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-[#D8D6CE] dark:border-[#222E40]">
            <div className="w-8 h-8 rounded-full bg-[#176B65] text-white flex items-center justify-center text-xs font-semibold">
              {user ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="text-left text-xs leading-none">
              <div className="text-[#111111] dark:text-white font-medium">{user?.name || 'Authorized Officer'}</div>
              <div className="text-[10px] text-[#6B726C] dark:text-slate-400 mt-0.5">{user?.badgeId || 'Badge #MH-PN-2041'}</div>
            </div>
          </div>

          {/* Logout / Switch */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2333] border border-[#D8D6CE] dark:border-[#2B3950] text-[#6B726C] dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 pt-16 w-60 bg-[#FFFFFF] dark:bg-[#101622] border-r border-[#D8D6CE] dark:border-[#222E40] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:pt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1 text-xs">
            <div className="px-3 py-2 text-[10px] font-semibold text-[#6B726C] dark:text-slate-500 uppercase tracking-wider font-mono">
              Control Modules
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
                      ? 'bg-[#176B65] text-white shadow-xs'
                      : 'text-[#6B726C] dark:text-slate-400 hover:text-[#111111] dark:hover:text-slate-200 hover:bg-[#F6F5F0] dark:hover:bg-[#1B2333]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B726C] dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="p-4 mt-auto border-t border-[#D8D6CE] dark:border-[#222E40] text-xs space-y-2">
            <div className="text-[10px] text-[#6B726C] dark:text-slate-500 uppercase tracking-wider font-semibold font-mono">
              System Network
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B726C] dark:text-slate-400">Analysis Engine:</span>
              <span className="text-[#176B65] dark:text-[#A8B9A7] font-medium">YOLOv8 + ByteTrack</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B726C] dark:text-slate-400">Jurisdiction:</span>
              <span className="text-[#111111] dark:text-white font-medium">Pune Traffic HQ</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#ECEAE5] dark:bg-[#0E131C] transition-colors">
          {children}
        </main>
      </div>

      {/* Emergency Mode Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#161D29] border border-[#C94C4C]/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D6CE] dark:border-[#222E40] pb-3">
              <div className="flex items-center space-x-2 text-[#C94C4C]">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-semibold text-[#111111] dark:text-white text-base">Emergency Protocol Override</h3>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="p-1 text-[#6B726C] dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#6B726C] dark:text-slate-300 leading-relaxed font-sans">
                Triggering Emergency Override broadcasts highest-priority siren alerts, notifies all field patrol units, and prioritizes live CCTV tracking channels.
              </p>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-[#2D1B22] border border-[#C94C4C]/40 text-[#C94C4C] dark:text-[#F8D7D7] text-xs">
                <strong>Attention Officer:</strong> All manual overrides are permanently logged into the state accountability audit trail with your badge identifier.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D8D6CE] dark:border-[#2B3950] text-[#6B726C] dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Emergency broadcast transmitted to Metropolitan Control Center.')
                    setEmergencyModalOpen(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C94C4C] hover:bg-[#B33F3F] text-white font-medium shadow-sm cursor-pointer"
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
