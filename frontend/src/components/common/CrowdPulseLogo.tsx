import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  inverted?: boolean
  className?: string
}

export const CrowdPulseLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
  const titleClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'

  const textColor = inverted ? 'text-white' : 'text-[#202522]'
  const tagColor = inverted ? 'text-slate-400' : 'text-[#777D78]'

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Refined Geometric Flow Emblem */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} shrink-0`}
      >
        <rect
          width="36"
          height="36"
          rx="9"
          fill={inverted ? '#1E2522' : '#176B65'}
        />
        {/* Harmonious flow vectors */}
        <path
          d="M10 23C13 23 15 15 20 15C24 15 25 18 27 18"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 18C12 18 14 12 18 12C22 12 24 15 26 15"
          stroke="#A8B9A7"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <circle cx="27" cy="18" r="2.2" fill="#FFFFFF" />
      </svg>

      {/* Brand Typography */}
      <div>
        <div className={`font-semibold tracking-tight leading-none ${textColor} ${titleClass}`}>
          Crowd<span className="text-[#176B65] font-bold">Pulse</span>
        </div>
        {showTagline && (
          <div className={`text-[10px] tracking-normal font-medium mt-0.5 ${tagColor}`}>
            See the flow. Sense the shift.
          </div>
        )}
      </div>
    </div>
  )
}
