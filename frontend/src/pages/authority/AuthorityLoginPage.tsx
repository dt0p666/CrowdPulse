import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { CrowdPulseLogo } from '../../components/common/CrowdPulseLogo'
import { loginDemoUser } from '../../services/auth'

export const AuthorityLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await loginDemoUser(email, password)
      if (user.role === 'public') {
        setError('This portal is restricted to authorized personnel and administrators.')
        return
      }
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/authority')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const fillAuthorityDemo = () => {
    setEmail('officer@punepolice.gov.in')
    setPassword('authority2026')
    setError(null)
  }

  const fillAdminDemo = () => {
    setEmail('admin@crowdpulse.internal')
    setPassword('admin2026')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center mb-2">
            <CrowdPulseLogo size="lg" showTagline={false} />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>AUTHORITY & COMMAND ACCESS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Restricted Operations Suite
          </h1>
          <p className="text-xs text-slate-400">
            Law enforcement, disaster management, and metropolitan safety control rooms.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1e2638] bg-[#0c0e14]/90 backdrop-blur-md p-6 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl border border-rose-900 bg-rose-950/40 text-rose-300 font-mono text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                OFFICIAL WORK EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@punepolice.gov.in"
                  required
                  className="w-full bg-[#121620] border border-[#2c3852] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                SECURITY PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#121620] border border-[#2c3852] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-Fill Options */}
          <div className="pt-4 border-t border-[#1e2638] space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 text-center">
              Demonstration 1-Click Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={fillAuthorityDemo}
                className="p-2 rounded-lg bg-[#121620] hover:bg-[#181e2b] border border-[#2c3852] text-left transition-colors"
              >
                <div className="font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authority Demo</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Pune Police Traffic</div>
              </button>

              <button
                type="button"
                onClick={fillAdminDemo}
                className="p-2 rounded-lg bg-[#121620] hover:bg-[#181e2b] border border-[#2c3852] text-left transition-colors"
              >
                <div className="font-bold text-cyan-400 flex items-center space-x-1">
                  <KeyRound className="w-3 h-3" />
                  <span>Platform Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">System Operator</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center font-mono text-xs">
          <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Role Selection Screen
          </Link>
        </div>
      </div>
    </div>
  )
}
