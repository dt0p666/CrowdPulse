import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, ArrowRight, ArrowDown } from 'lucide-react'

interface AgentParticle {
  id: number
  x: number // percentage 0-100
  y: number // percentage 0-100
  vx: number
  vy: number
  angle: number
  speed: number
  length: number
}

interface FigmaSpatialHeroProps {
  onExploreClick?: () => void
}

export const FigmaSpatialHero: React.FC<FigmaSpatialHeroProps> = ({ onExploreClick }) => {
  const [activeView, setActiveView] = useState<'Density' | 'Velocity' | 'Flow' | 'Risk'>('Flow')
  const [activeScenario, setActiveScenario] = useState<'Normal Flow' | 'High Density' | 'Congestion'>('High Density')
  const [activeZone, setActiveZone] = useState<'ZA' | 'ZB' | 'ZC'>('ZB')
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [scrubberSec, setScrubberSec] = useState<number>(1278) // 00:21:18
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number | null>(null)

  // Particles state for the interactive perspective spatial canvas
  const agentsRef = useRef<AgentParticle[]>([])

  useEffect(() => {
    // Generate ~65 particles representing pedestrian vectors
    const particles: AgentParticle[] = []
    for (let i = 0; i < 65; i++) {
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.4 // mostly moving up-forward
      const baseSpeed = activeScenario === 'Normal Flow' ? 0.35 : activeScenario === 'High Density' ? 0.22 : 0.12
      particles.push({
        id: i,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 75,
        vx: Math.cos(angle) * (baseSpeed + Math.random() * 0.15),
        vy: -Math.sin(angle) * (baseSpeed + Math.random() * 0.15),
        angle: angle,
        speed: baseSpeed + Math.random() * 0.1,
        length: 4 + Math.random() * 8,
      })
    }
    agentsRef.current = particles
  }, [activeScenario])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      // Resize canvas to match display size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const w = canvas.width
      const h = canvas.height

      // Perspective horizon lines
      ctx.lineWidth = 0.75
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'

      // Draw perspective grid floor
      const numLines = 14
      for (let i = 0; i <= numLines; i++) {
        const xStart = (w * 0.2) + (i / numLines) * (w * 0.6)
        const xEnd = (w * 0.05) + (i / numLines) * (w * 0.9)
        ctx.beginPath()
        ctx.moveTo(xStart, h * 0.25)
        ctx.lineTo(xEnd, h * 0.95)
        ctx.stroke()
      }

      // Horizontal depth lines
      for (let j = 0; j < 9; j++) {
        const ratio = Math.pow(j / 8, 1.6)
        const y = h * 0.25 + ratio * (h * 0.7)
        const xLeft = (w * 0.2) - ratio * (w * 0.15)
        const xRight = (w * 0.8) + ratio * (w * 0.1)
        ctx.beginPath()
        ctx.moveTo(xLeft, y)
        ctx.lineTo(xRight, y)
        ctx.stroke()
      }

      // Draw Zone Outlines
      // Zone A (Left)
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.25)'
      ctx.strokeRect(w * 0.16, h * 0.32, w * 0.18, h * 0.12)
      // Zone B (Center / Focus)
      ctx.strokeStyle = activeScenario === 'Congestion' ? 'rgba(201, 76, 76, 0.6)' : 'rgba(163, 198, 20, 0.7)'
      ctx.strokeRect(w * 0.38, h * 0.42, w * 0.24, h * 0.28)
      // Zone C (Right)
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.25)'
      ctx.strokeRect(w * 0.68, h * 0.35, w * 0.16, h * 0.14)

      // Draw Radiant Glow for Density/Flow in Zone B
      if (activeView === 'Density' || activeView === 'Flow') {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.62, 10, w * 0.5, h * 0.62, w * 0.22)
        if (activeScenario === 'Congestion') {
          grad.addColorStop(0, 'rgba(201, 76, 76, 0.45)')
          grad.addColorStop(0.5, 'rgba(214, 155, 50, 0.20)')
          grad.addColorStop(1, 'rgba(201, 76, 76, 0)')
        } else {
          grad.addColorStop(0, 'rgba(206, 240, 60, 0.50)')
          grad.addColorStop(0.4, 'rgba(206, 240, 60, 0.18)')
          grad.addColorStop(1, 'rgba(206, 240, 60, 0)')
        }
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      // Draw Pedestrian Agents & Vector Trails
      const isDark = document.documentElement.classList.contains('dark')
      agentsRef.current.forEach((p) => {
        if (isPlaying) {
          p.x += p.vx * dt * 35
          p.y += p.vy * dt * 35

          // Wrap boundaries
          if (p.y < 20) p.y = 95
          if (p.y > 96) p.y = 22
          if (p.x < 10) p.x = 90
          if (p.x > 90) p.x = 12
        }

        const px = (p.x / 100) * w
        const py = (p.y / 100) * h

        // In Zone B, check if slowdown applies
        const inZoneB = p.x > 38 && p.x < 62 && p.y > 42 && p.y < 70

        // Agent color
        let agentColor = isDark ? '#F1F5F9' : '#111111'
        if (activeView === 'Velocity') {
          agentColor = inZoneB ? '#D69B32' : '#38845B'
        } else if (activeView === 'Risk') {
          agentColor = inZoneB ? '#C94C4C' : '#176B65'
        }

        // Vector direction tail
        const tailLen = inZoneB && activeScenario !== 'Normal Flow' ? p.length * 0.6 : p.length
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px - Math.cos(p.angle) * tailLen, py + Math.sin(p.angle) * tailLen)
        ctx.stroke()

        // Pedestrian Dot / Head
        ctx.fillStyle = agentColor
        ctx.beginPath()
        ctx.arc(px, py, 2.2, 0, Math.PI * 2)
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying, activeView, activeScenario])

  // Scrubber timer tick
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setScrubberSec((prev) => (prev >= 2520 ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying])

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600)
    const mins = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#ECEAE5] dark:bg-[#0E131C] text-[#111111] dark:text-[#F8FAFC] transition-colors border-b border-[#D8D6CE] dark:border-[#253144]">
      {/* Perspective Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Status & View Selector Sub-Bar */}
      <div className="relative z-10 px-6 sm:px-10 pt-5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="tracking-widest uppercase text-[10px] text-[#6B726C] dark:text-[#94A3B8]">
            CROWDPULSE / SPATIAL INTELLIGENCE
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#111111] dark:text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#38845B] dark:bg-[#4ADE80] animate-pulse" />
            <span className="tracking-wide">ANONYMOUS MOTION / AGGREGATED SIGNAL</span>
          </div>
        </div>

        {/* View Switcher: Density | Velocity | Flow | Risk */}
        <div className="flex items-center self-start md:self-auto border border-[#D8D6CE] dark:border-[#253144] rounded-lg overflow-hidden bg-[#FFFFFF]/70 dark:bg-[#161D29]/70 backdrop-blur-md shadow-2xs">
          <span className="px-3 py-1.5 font-bold text-[10px] uppercase text-[#6B726C] dark:text-[#94A3B8] border-r border-[#D8D6CE] dark:border-[#253144] tracking-wider">
            VIEW
          </span>
          {(['Density', 'Velocity', 'Flow', 'Risk'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeView === v
                  ? 'bg-[#111111] text-white dark:bg-[#FFFFFF] dark:text-[#0E131C]'
                  : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Live Simulation indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-semibold tracking-wide text-[#6B726C] dark:text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#38845B] dark:bg-[#4ADE80]" />
          <span>LIVE SIMULATION / SIMULATED DATA</span>
        </div>
      </div>

      {/* Hero Headline Section */}
      <div className="relative z-10 px-6 sm:px-10 pt-4 pb-8 max-w-4xl space-y-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] uppercase">
          <div>UNDERSTAND THE</div>
          <div>MOVEMENT.</div>
          <div className="flex items-center space-x-3">
            <span>ANTICIPATE THE</span>
            <span className="text-stroke-hollow">RISK.</span>
          </div>
        </h1>

        <p className="text-sm sm:text-base text-[#6B726C] dark:text-[#94A3B8] max-w-xl font-normal leading-relaxed">
          See how people move, where pressure develops and why a space may require attention.
        </p>
      </div>

      {/* Floating Tactical Widgets (Bottom Section) */}
      <div className="relative z-10 px-6 sm:px-10 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        {/* Card 1 (Bottom Left): Reading The Scene */}
        <div className="lg:col-span-3 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF]/85 dark:bg-[#161D29]/85 backdrop-blur-md p-4 space-y-3 shadow-md text-xs font-mono">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B726C] dark:text-[#94A3B8]">
            READING THE SCENE
          </div>

          <div className="space-y-2 text-[11px] divide-y divide-[#E5E3DB] dark:divide-[#253144]">
            <div className="pt-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full border border-current" />
                <span className="font-semibold">DENSITY</span>
              </span>
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Spacing / accumulation</span>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="font-bold">—</span>
                <span className="font-semibold">DIRECTION</span>
              </span>
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Travel path</span>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="font-bold">—</span>
                <span className="font-semibold">VELOCITY</span>
              </span>
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Trail length / tone</span>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="font-bold tracking-tighter">❚❚</span>
                <span className="font-semibold">BOTTLENECK</span>
              </span>
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Constrained flow</span>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C94C4C]" />
                <span className="font-semibold">ELEVATED RISK</span>
              </span>
              <span className="text-[#6B726C] dark:text-[#94A3B8]">Model estimate</span>
            </div>
          </div>

          <div className="pt-2 text-[9px] uppercase tracking-wider text-[#6B726C] dark:text-[#94A3B8] flex items-center space-x-1">
            <span>OBSERVE / ANALYSE / ANTICIPATE / ACT</span>
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2 (Bottom Center): Scrubber & Scenario */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-3">
          {/* Scenario Selector */}
          <div className="flex items-center border border-[#D8D6CE] dark:border-[#253144] rounded-lg overflow-hidden bg-[#FFFFFF]/85 dark:bg-[#161D29]/85 backdrop-blur-md shadow-xs text-xs font-mono">
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#6B726C] dark:text-[#94A3B8] border-r border-[#D8D6CE] dark:border-[#253144]">
              SCENARIO
            </span>
            {(['Normal Flow', 'High Density', 'Congestion'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveScenario(s)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors cursor-pointer ${
                  activeScenario === s
                    ? 'bg-[#CEF03C] text-[#111111] font-bold shadow-xs'
                    : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Timeline Scrubber Bar */}
          <div className="w-full rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF]/85 dark:bg-[#161D29]/85 backdrop-blur-md px-4 py-2.5 flex items-center space-x-4 shadow-md font-mono text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-[#111111] dark:text-[#F8FAFC]"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <span className="text-[11px] text-[#111111] dark:text-[#F8FAFC]">
              {formatTime(scrubberSec)}
            </span>

            {/* Slider track with yellow handle */}
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="2520"
                value={scrubberSec}
                onChange={(e) => setScrubberSec(parseInt(e.target.value))}
                className="w-full h-1 bg-[#D8D6CE] dark:bg-[#253144] rounded-lg appearance-none cursor-pointer accent-[#CEF03C]"
              />
            </div>

            <span className="text-[11px] text-[#6B726C] dark:text-[#94A3B8]">
              00:42:00
            </span>
          </div>
        </div>

        {/* Card 3 (Bottom Right): Current Context / Zone B */}
        <div className="lg:col-span-4 rounded-xl border border-[#D8D6CE] dark:border-[#253144] bg-[#FFFFFF]/85 dark:bg-[#161D29]/85 backdrop-blur-md p-5 space-y-3 shadow-md text-xs font-mono">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B726C] dark:text-[#94A3B8] border-b border-[#D8D6CE] dark:border-[#253144] pb-2">
            CURRENT CONTEXT / ZONE {activeZone.replace('Z', '')}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#111111] dark:text-[#F8FAFC]">
              ZONE {activeZone.replace('Z', '')}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CEF03C]/25 text-[#738C0D] dark:text-[#CEF03C] border border-[#CEF03C]/50">
              {activeScenario === 'Congestion' ? 'CRITICAL BOTTLENECK' : activeScenario === 'High Density' ? 'ELEVATED DENSITY' : 'STEADY FLOW'}
            </span>
          </div>

          <p className="text-[11px] text-[#6B726C] dark:text-[#94A3B8] leading-relaxed font-sans">
            {activeScenario === 'Congestion'
              ? 'Severe egress restriction detected. Pedestrian traversal pace reduced below 0.3 m/s with backpressure.'
              : activeScenario === 'High Density'
              ? 'Pedestrian inflow is exceeding outflow. Movement speed is decreasing, creating a potential bottleneck.'
              : 'Pedestrian flow is fluid across concourse zones with no measurable deceleration or backpressure.'}
          </p>

          <div className="space-y-1.5 border-t border-[#D8D6CE] dark:border-[#253144] pt-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">PEOPLE REPRESENTED</span>
              <span className="font-bold text-[#111111] dark:text-[#F8FAFC]">
                {activeScenario === 'Congestion' ? '1,420' : activeScenario === 'High Density' ? '812' : '340'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">AVERAGE SPEED</span>
              <span className="font-bold text-[#111111] dark:text-[#F8FAFC]">
                {activeScenario === 'Congestion' ? '0.28 m/s' : activeScenario === 'High Density' ? '0.72 m/s' : '1.38 m/s'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">HIGHEST DENSITY</span>
              <span className="font-bold text-[#111111] dark:text-[#F8FAFC]">
                {activeScenario === 'Congestion' ? 'ZONE B / 4.2 p/m²' : activeScenario === 'High Density' ? 'ZONE B / 2.8 p/m²' : 'ZONE A / 0.9 p/m²'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">BOTTLENECK</span>
              <span className="font-bold text-[#111111] dark:text-[#F8FAFC]">
                {activeScenario === 'Congestion' ? 'ACUTE SURGE' : activeScenario === 'High Density' ? 'DEVELOPING' : 'NOMINAL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B726C] dark:text-[#94A3B8]">MODEL EST. RISK</span>
              <span className={`font-bold ${activeScenario === 'Congestion' ? 'text-[#C94C4C]' : activeScenario === 'High Density' ? 'text-[#D69B32]' : 'text-[#38845B]'}`}>
                {activeScenario === 'Congestion' ? 'HIGH WARNING' : activeScenario === 'High Density' ? 'WATCH' : 'LOW RISK'}
              </span>
            </div>
          </div>

          {/* Observed vs Predicted footer bar */}
          <div className="border-t border-[#D8D6CE] dark:border-[#253144] pt-2 flex items-center justify-between text-[9px] uppercase tracking-wider text-[#6B726C] dark:text-[#94A3B8]">
            <span>OBSERVED / DENSITY + VELOCITY</span>
            <span>PREDICTED / RISK ESTIMATE</span>
          </div>

          {/* Zone Selector Buttons & Explore Link */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center border border-[#D8D6CE] dark:border-[#253144] rounded-lg overflow-hidden bg-[#FFFFFF]/70 dark:bg-[#161D29]/70">
              {(['ZA', 'ZB', 'ZC'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    activeZone === z
                      ? 'bg-[#111111] text-white dark:bg-[#FFFFFF] dark:text-[#0E131C]'
                      : 'text-[#6B726C] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            <button
              onClick={onExploreClick}
              className="flex items-center space-x-1.5 text-xs font-bold tracking-tight text-[#111111] dark:text-white hover:text-[#176B65] dark:hover:text-[#CEF03C] transition-colors cursor-pointer"
            >
              <span>EXPLORE LIVE INTELLIGENCE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
