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
} from 'lucide-react'
import { CrowdPulseLogo } from '../components/common/CrowdPulseLogo'
import { ThemeToggle } from '../components/common/ThemeToggle'
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
    <div className="min-h-screen bg-[#ECEAE5] dark:bg-[#0E131C] text-[#111111] dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#176B65] selection:text-white">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#161D29]/95 backdrop-blur-md border-b border-[#D8D6CE] dark:border-[#253144] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="flex items-center">
            <CrowdPulseLogo size="sm" showTagline={false} />
            <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#176B65]/15 dark:bg-[#176B65]/20 text-[#176B65] dark:text-teal-300 border border-[#176B65]/30 dark:border-[#176B65]/40">
              Platform Admin
            </span>
          </Link>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-[#6B726C] dark:text-slate-400 pl-4 border-l border-[#D8D6CE] dark:border-[#253144]">
            <span className="text-[#6B726C] dark:text-slate-400">Infrastructure</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B726C] dark:text-slate-500" />
            <span className="text-[#111111] dark:text-white font-medium">{breadcrumb}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Dedicated Working ThemeToggle button at top right */}
          <ThemeToggle />

          <div className="flex items-center space-x-2.5 pl-2 border-l border-[#D8D6CE] dark:border-[#253144]">
            <div className="w-8 h-8 rounded-full bg-[#176B65] text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <div className="text-[#111111] dark:text-white font-medium">{user?.name || 'Platform Administrator'}</div>
              <div className="text-[11px] text-[#6B726C] dark:text-slate-400 mt-1">Engineering Access</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#101520] border border-[#D8D6CE] dark:border-[#253144] text-[#6B726C] dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#FFFFFF] dark:bg-[#111722] border-r border-[#D8D6CE] dark:border-[#253144] p-4 space-y-1 text-xs hidden md:block">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#6B726C] dark:text-slate-400 uppercase tracking-wider font-mono">
            Admin Modules
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
                    ? 'bg-[#176B65] text-white font-semibold shadow-sm'
                    : 'text-[#6B726C] dark:text-slate-300 hover:text-[#111111] dark:hover:text-white hover:bg-[#F6F5F0] dark:hover:bg-[#161D29]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B726C] dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-8">
            <Link
              to="/authority"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F6F5F0] dark:bg-[#161D29] border border-[#D8D6CE] dark:border-[#253144] text-[#111111] dark:text-slate-300 hover:border-[#176B65] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#176B65] dark:text-teal-400" />
                <span className="font-medium">Authority Operations</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#ECEAE5] dark:bg-[#0E131C] transition-colors">
          {children}
        </main>
      </div>
    </div>
  )
}
