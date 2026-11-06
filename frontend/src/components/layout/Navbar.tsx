import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  Video,
  FileSpreadsheet,
  Box,
  BrainCircuit,
  HelpCircle,
  Settings as SettingsIcon,
  Menu,
  X,
  Server
} from 'lucide-react'
import type { HealthResponse } from '../../services/api'

interface NavbarProps {
  health: HealthResponse | null
  healthError: string | null
  isChecking: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ health, healthError, isChecking }) => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Overview', icon: Activity },
    { to: '/video-analysis', label: 'Video Analysis', icon: Video },
    { to: '/dataset-lab', label: 'Dataset Lab', icon: FileSpreadsheet },
    { to: '/crowd-map', label: '3D Crowd Map', icon: Box },
    { to: '/prediction-lab', label: 'Prediction Lab', icon: BrainCircuit },
    { to: '/explainability', label: 'Explainability', icon: HelpCircle },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  const isConnected = health && !healthError

  return (
    <header className="sticky top-0 z-50 bg-[#0a0c10]/90 backdrop-blur-md border-b border-[#1e2638]">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-black focus:font-semibold focus:rounded"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-black tracking-wider text-sm shadow-sm group-hover:scale-105 transition-transform">
              CP
            </div>
            <div>
              <div className="font-mono text-base font-bold tracking-widest text-slate-100 uppercase">
                CROWDPULSE
              </div>
              <div className="text-[10px] tracking-wider text-slate-400 font-medium">
                SEE THE FLOW. SENSE THE SHIFT.
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#171d2b] text-cyan-400 border border-[#2c3852]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#121620]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Backend Connection Status Pill */}
          <div className="hidden sm:flex items-center space-x-2 pl-4 border-l border-[#1e2638]">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                isConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
              }`}
              title={
                isConnected
                  ? `Engine Online: Python ${health?.environment?.python_version} (${health?.environment?.device})`
                  : `Engine Disconnected: ${healthError || 'Connecting...'}`
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <Server className="w-3 h-3 ml-0.5 opacity-70" />
              <span>
                {isChecking
                  ? 'CHECKING...'
                  : isConnected
                  ? `ONLINE (${health?.environment?.device?.toUpperCase() || 'CPU'})`
                  : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-[#121620] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#1e2638] bg-[#0a0c10] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-[#171d2b] text-cyan-400 border border-[#2c3852]'
                    : 'text-slate-400 hover:text-white hover:bg-[#121620]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[#1e2638] flex items-center justify-between text-xs text-slate-400 font-mono px-3">
            <span>Engine Status:</span>
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isConnected ? 'Connected (Ready)' : 'Disconnected'}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
