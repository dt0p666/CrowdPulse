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
    <div className="min-h-screen bg-[#F6F5F0] text-[#202522] flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center mb-1">
            <CrowdPulseLogo size="lg" showTagline={false} />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF4F3] border border-[#D0E5E3] text-[#176B65] text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Restricted Command Access</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#202522]">
            Authority Operations Suite
          </h1>
          <p className="text-xs text-[#777D78] max-w-sm mx-auto">
            Designated for law enforcement, disaster management, and metropolitan safety control rooms.
          </p>
        </div>

        <div className="rounded-2xl border border-[#DFE2DC] bg-[#FFFFFF] p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl border border-[#F8D7D7] bg-[#FDF2F2] text-[#C94C4C] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777D78] mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777D78] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@punepolice.gov.in"
                  required
                  className="w-full bg-[#F6F5F0] border border-[#DFE2DC] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#202522] placeholder-[#9BA19C] focus:outline-none focus:border-[#176B65] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D78] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777D78] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#F6F5F0] border border-[#DFE2DC] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#202522] placeholder-[#9BA19C] focus:outline-none focus:border-[#176B65] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#176B65] hover:bg-[#12544F] text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Command Suite'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-Fill Options */}
          <div className="pt-4 border-t border-[#DFE2DC] space-y-2">
            <div className="text-[11px] font-medium text-[#777D78] text-center">
              Demonstration 1-Click Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={fillAuthorityDemo}
                className="p-3 rounded-xl bg-[#F6F5F0] hover:bg-[#EBF4F3] border border-[#DFE2DC] text-left transition-colors"
              >
                <div className="font-semibold text-[#176B65] flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authority Demo</span>
                </div>
                <div className="text-[10px] text-[#777D78] mt-0.5 truncate">Pune Police Traffic</div>
              </button>

              <button
                type="button"
                onClick={fillAdminDemo}
                className="p-3 rounded-xl bg-[#F6F5F0] hover:bg-[#EBF4F3] border border-[#DFE2DC] text-left transition-colors"
              >
                <div className="font-semibold text-[#202522] flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Demo</span>
                </div>
                <div className="text-[10px] text-[#777D78] mt-0.5 truncate">System Console</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center text-xs">
          <Link to="/" className="text-[#777D78] hover:text-[#202522] transition-colors">
            ← Return to role selection
          </Link>
        </div>
      </div>
    </div>
  )
}
