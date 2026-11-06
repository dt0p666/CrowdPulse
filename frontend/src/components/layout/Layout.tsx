import React, { useEffect, useState } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { fetchHealth } from '../../services/api'
import type { HealthResponse } from '../../services/api'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const check = async () => {
      try {
        setIsChecking(true)
        const data = await fetchHealth()
        if (isMounted) {
          setHealth(data)
          setHealthError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          setHealth(null)
          setHealthError(err.message || 'Engine unreachable')
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    check()
    const interval = setInterval(check, 10000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0c10] text-[#f0f4f8]">
      <Navbar health={health} healthError={healthError} isChecking={isChecking} />
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
