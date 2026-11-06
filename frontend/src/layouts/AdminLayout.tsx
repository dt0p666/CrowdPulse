import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Cpu,
  Database,
  BrainCircuit,
  Sliders,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { getCurrentUser, logoutUser } from '../services/auth'

interface AdminLayoutProps {
  children: React.ReactNode
  breadcrumb?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  breadcrumb = 'System Overview',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()

  const navItems = [
    { label: 'Admin Console', path: '/admin', icon: Cpu },
    { label: 'Ground-Truth Dataset Lab', path: '/admin/datasets', icon: Database },
    { label: 'ML Holdout & Classifiers', path: '/admin/models', icon: BrainCircuit },
    { label: 'Model Explainer (SHAP)', path: '/admin/explainability', icon: Sliders },
  ]

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-b border-[#1b2233] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="flex items-center">
            <CrowdPulseLogo size="sm" showTagline={false} />
            <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              PLATFORM ADMIN
            </span>
          </Link>

          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-400 pl-4 border-l border-[#1b2233]">
            <span className="text-slate-500">Infrastructure</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold">{breadcrumb}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="hidden md:flex items-center space-x-2 text-slate-400 bg-[#121620] px-3 py-1 rounded-xl border border-[#273247]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>FastAPI Backend 1.0 Online</span>
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-[#1b2233]">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center font-bold text-cyan-400">
              AD
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <div className="text-white font-bold">{user?.name || 'Platform Administrator'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Full System Access</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl bg-[#111520] border border-[#222b40] text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0a0c12] border-r border-[#1b2233] p-4 space-y-1 font-mono text-xs hidden md:block">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            ADMIN MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121622]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-8">
            <Link
              to="/authority"
              className="flex items-center justify-between p-3 rounded-xl bg-[#0e121c] border border-[#20293d] text-slate-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Authority Suite</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#07090d]">
          {children}
        </main>
      </div>
    </div>
  )
}
