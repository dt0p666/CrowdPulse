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
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Authentication failed')
  }
  const data = await res.json()
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

export async function loginDemoUser(email: string, password: string): Promise<UserSession> {
  return loginAuthority(email, password)
}
