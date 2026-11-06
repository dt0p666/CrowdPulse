import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}

export const CrowdPulseLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const iconSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
  const titleClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Bespoke Echelon Pulse Vector SVG Mark */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizeClass} shrink-0 drop-shadow-sm`}
      >
        <defs>
          <linearGradient id="cpGradMark" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="waveGradMark" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Shield Frame */}
        <rect width="48" height="48" rx="12" fill="#0C0E14" />
        <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1E2638" />

        {/* Outer Sensory Radar Pulse Arc */}
        <path
          d="M 12 24 A 12 12 0 0 1 36 24"
          stroke="url(#waveGradMark)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 3"
          opacity="0.6"
        />
        <path
          d="M 8 24 A 16 16 0 0 1 40 24"
          stroke="url(#waveGradMark)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 4"
          opacity="0.4"
        />

        {/* Core Crowd Pulse Flow Vectors */}
        <path
          d="M 14 28 L 22 20 L 26 24 L 34 16"
          stroke="url(#cpGradMark)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 17 32 L 23 26 L 27 29 L 33 23"
          stroke="#06B6D4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />

        {/* Shift Beacon Nodes */}
        <circle cx="26" cy="24" r="3" fill="#10B981" />
        <circle cx="26" cy="24" r="5" stroke="#10B981" strokeWidth="1" opacity="0.4" />
        <circle cx="34" cy="16" r="2.5" fill="#06B6D4" />
      </svg>

      {/* Typography */}
      <div>
        <div className={`font-mono font-extrabold tracking-widest text-white leading-none ${titleClass}`}>
          CROWD<span className="text-cyan-400">PULSE</span>
        </div>
        {showTagline && (
          <div className="text-[10px] tracking-widest font-mono text-slate-400 font-medium uppercase mt-1">
            SEE THE FLOW. SENSE THE SHIFT.
          </div>
        )}
      </div>
    </div>
  )
}
