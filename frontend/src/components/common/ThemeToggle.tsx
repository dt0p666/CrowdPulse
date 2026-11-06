import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-[#161D29] border-[#253144] text-amber-300 hover:text-white hover:border-amber-400/50'
          : 'bg-[#FFFFFF] border-[#DFE2DC] text-[#202522] hover:text-[#176B65] hover:border-[#176B65]/40 shadow-2xs'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  )
}
