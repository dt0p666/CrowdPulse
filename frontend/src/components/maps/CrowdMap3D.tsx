import React, { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { TrajectoryPoint, SpatialGridSummary } from '../../services/api'

interface CrowdMap3DProps {
  trajectories: TrajectoryPoint[]
  currentFrameIdx: number
  gridOccupancy?: SpatialGridSummary
  selectedZone: string | null
  onSelectZone: (zoneId: string | null) => void
}

// 4 Venue Zones mapped to 3D coordinates [-10 to +10 on X, -6 to +6 on Z]
const ZONES_3D = [
  { id: 'zone_1', name: 'Zone 1: Ingress Gate', color: '#06b6d4', minX: -10, maxX: 0, minZ: -6, maxZ: 0 },
  { id: 'zone_2', name: 'Zone 2: Concourse Crossflow', color: '#3b82f6', minX: 0, maxX: 10, minZ: -6, maxZ: 0 },
  { id: 'zone_3', name: 'Zone 3: Central Concourse', color: '#10b981', minX: -10, maxX: 0, minZ: 0, maxZ: 6 },
  { id: 'zone_4', name: 'Zone 4: Bottleneck Egress', color: '#f59e0b', minX: 0, maxX: 10, minZ: 0, maxZ: 6 },
]

function map2Dto3D(cx: number, cy: number): [number, number, number] {
  // Map 1920x1080 to [-10, 10] on X and [-6, 6] on Z
  const x3d = (cx / 1920) * 20 - 10
  const z3d = (cy / 1080) * 12 - 6
  return [x3d, 0.4, z3d]
}

const PedestrianAgent: React.FC<{ point: TrajectoryPoint }> = ({ point }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const pos = useMemo(() => map2Dto3D(point.center_x, point.center_y), [point.center_x, point.center_y])

  // Color gradient based on speed
  const color = point.speed_px_sec > 60 ? '#10b981' : point.speed_px_sec > 25 ? '#06b6d4' : '#f59e0b'

  return (
    <group position={pos}>
      {/* Pedestrian Capsule / Cylinder Body */}
      <mesh ref={meshRef} castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#f0f4f8" roughness={0.4} />
      </mesh>

      {/* Ground Projection Halo */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.35, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const DensityColumns: React.FC<{ gridOccupancy?: SpatialGridSummary }> = ({ gridOccupancy }) => {
  if (!gridOccupancy) return null

  const rows = gridOccupancy.grid_rows || 4
  const cols = gridOccupancy.grid_cols || 4

  return (
    <group>
      {gridOccupancy.occupancy_matrix.map((row, rIdx) =>
        row.map((val, cIdx) => {
          if (val === 0) return null
          const x = (cIdx / cols) * 20 - 10 + 2.5 / 2
          const z = (rIdx / rows) * 12 - 6 + 1.5 / 2
          const height = Math.min(3.5, Math.max(0.1, (val / 100) * 1.5))
          const intensity = Math.min(1.0, val / 150)
          const colColor = intensity > 0.6 ? '#f43f5e' : intensity > 0.3 ? '#f59e0b' : '#06b6d4'

          return (
            <mesh key={`${rIdx}-${cIdx}`} position={[x, height / 2, z]}>
              <boxGeometry args={[1.8, height, 1.2]} />
              <meshStandardMaterial
                color={colColor}
                transparent
                opacity={0.35}
                roughness={0.2}
                wireframe={false}
              />
            </mesh>
          )
        })
      )}
    </group>
  )
}

const VenueZones3D: React.FC<{
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}> = ({ selectedZone, onSelectZone }) => {
  return (
    <group>
      {ZONES_3D.map((z) => {
        const width = z.maxX - z.minX
        const depth = z.maxZ - z.minZ
        const centerX = (z.minX + z.maxX) / 2
        const centerZ = (z.minZ + z.maxZ) / 2
        const isSelected = selectedZone === z.id

        return (
          <group key={z.id}>
            {/* Zone Translucent Floor Area */}
            <mesh
              position={[centerX, 0.02, centerZ]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation()
                onSelectZone(isSelected ? null : z.id)
              }}
            >
              <planeGeometry args={[width - 0.2, depth - 0.2]} />
              <meshStandardMaterial
                color={z.color}
                transparent
                opacity={isSelected ? 0.35 : 0.12}
                roughness={0.6}
              />
            </mesh>

            {/* Zone Label */}
            <Text
              position={[centerX, 0.05, centerZ]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.5}
              color={isSelected ? '#ffffff' : z.color}
              anchorX="center"
              anchorY="middle"
            >
              {z.name}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

export const CrowdMap3D: React.FC<CrowdMap3DProps> = ({
  trajectories,
  currentFrameIdx,
  gridOccupancy,
  selectedZone,
  onSelectZone,
}) => {
  const activePoint = trajectories[currentFrameIdx] || trajectories[0]

  return (
    <div className="w-full h-full relative bg-[#07090c] rounded-xl overflow-hidden border border-[#1e2638]">
      <Canvas
        camera={{ position: [0, 14, 14], fov: 45 }}
        shadows
        className="cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#07090c']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#06b6d4" />

        {/* Orbit Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={35}
        />

        {/* Architectural Venue Ground & Grid */}
        <gridHelper args={[24, 24, '#2c3852', '#121620']} position={[0, 0, 0]} />
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[26, 18]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.9} />
        </mesh>

        {/* Venue Zones & Floating Labels */}
        <VenueZones3D selectedZone={selectedZone} onSelectZone={onSelectZone} />

        {/* Volumetric Density Columns */}
        <DensityColumns gridOccupancy={gridOccupancy} />

        {/* Active Pedestrian Agent */}
        {activePoint && <PedestrianAgent point={activePoint} />}
      </Canvas>

      {/* Floating 3D Legend & Interaction Help */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-[#0a0c10]/90 backdrop-blur-md border border-[#1e2638] font-mono text-[11px] text-slate-300 space-y-1.5 shadow-lg pointer-events-none">
        <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>REAL-DATA 3D SPATIAL VISUALIZATION</span>
        </div>
        <div className="text-slate-400 text-[10px]">
          Mapped from 1920×1080 image space to 3D floor units
        </div>
        <div className="flex items-center space-x-3 pt-1 text-[10px]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-emerald-400" />
            <span>Fast Flow</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-cyan-400" />
            <span>Nominal</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded bg-amber-400" />
            <span>Compressed</span>
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 p-2 rounded bg-black/70 border border-[#2c3852] font-mono text-[10px] text-slate-400">
        Left Click + Drag: Rotate | Right Click + Drag: Pan | Scroll: Zoom
      </div>
    </div>
  )
}
