export type UserRole = 'public' | 'public_guest' | 'authority' | 'authority_officer' | 'admin'

export interface UserSession {
  role: UserRole
  name: string
  badgeId?: string
  badge?: string
  department?: string
  city?: string
  token?: string
}

const STORAGE_KEY = 'crowdpulse_user_session'

const rawApiBase = (import.meta as any).env?.VITE_API_URL
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/$/, '')
  : ''
const API_BASE = rawApiBase ? `${rawApiBase}/api` : '/api'

const DEMO_USERS: Record<
  string,
  {
    password: string
    role: UserRole
    name: string
    badge: string
    department: string
    city: string
  }
> = {
  'officer@punepolice.gov.in': {
    password: 'authority2026',
    role: 'authority_officer',
    name: 'Inspector S. Kulkarni',
    badge: 'MH-PUN-4012',
    department: 'Pune Metropolitan Police & Disaster Management',
    city: 'Pune',
  },
  'admin@crowdpulse.internal': {
    password: 'admin2026',
    role: 'admin',
    name: 'Platform Administrator',
    badge: 'SYS-ADM-01',
    department: 'CrowdPulse Core Platform Administration',
    city: 'All',
  },
}

export function getActiveSession(): UserSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...parsed,
        badgeId: parsed.badgeId || parsed.badge || 'MH-PN-2041',
      }
    }
  } catch (e) {
    console.error('Failed to parse user session', e)
  }
  return { role: 'public_guest', name: 'Citizen Guest', badgeId: '' }
}

export function getCurrentUser(): UserSession {
  return getActiveSession()
}

export function setActiveSession(session: UserSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function logoutUser(): void {
  clearSession()
}

export async function loginAuthority(username: string, password: string): Promise<UserSession> {
  const cleanUser = username.trim().toLowerCase()
  const cleanPass = password.trim()

  // 1. Attempt server-side authentication if backend API is connected
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.role) {
        const session: UserSession = {
          role: data.role,
          name: data.name,
          badgeId: data.badge || 'MH-PN-2041',
          badge: data.badge,
          department: data.department,
          city: data.city,
          token: data.token,
        }
        setActiveSession(session)
        return session
      }
    }
  } catch (e) {
    // API endpoint unreachable (e.g. standalone Vercel preview / static SPA deployment)
  }

  // 2. Client-side authentication fallback for authorized demonstration credentials
  const demoMatch = DEMO_USERS[cleanUser]
  if (demoMatch && demoMatch.password === cleanPass) {
    const session: UserSession = {
      role: demoMatch.role,
      name: demoMatch.name,
      badgeId: demoMatch.badge,
      badge: demoMatch.badge,
      department: demoMatch.department,
      city: demoMatch.city,
      token: `cp-auth-${demoMatch.role}-demo-token`,
    }
    setActiveSession(session)
    return session
  }

  throw new Error('Invalid email or password. Please use the demonstration credentials.')
}

export async function loginDemoUser(email: string, password: string): Promise<UserSession> {
  return loginAuthority(email, password)
}
