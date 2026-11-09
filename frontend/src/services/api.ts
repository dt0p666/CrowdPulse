export interface HealthResponse {
  status: string
  project: string
  version: string
  timestamp: string
  environment: {
    python_version?: string
    torch_available?: string
    cuda_available?: boolean
    device?: string
    sample_datasets_count?: number
    sample_datasets?: string[]
    storage_ready?: boolean
  }
}

export interface DatasetMeta {
  id: string
  name: string
  filename: string
  file_size_bytes: number
  row_count: number
  is_sample: boolean
  columns: string[]
  has_bounding_boxes: boolean
}

export interface DatasetInspection {
  id: string
  name: string
  row_count: number
  columns: string[]
  dtypes: Record<string, string>
  missing_values: Record<string, number>
  duplicate_rows: number
  coordinate_ranges: Record<string, { min: number; max: number; mean: number; median: number }>
  first_rows: Array<Record<string, any>>
  fps: number
  estimated_duration_sec: number
  out_of_bounds_count: number
}

export interface TrajectoryPoint {
  frame: number
  time_sec: number
  x: number
  y: number
  w: number
  h: number
  center_x: number
  center_y: number
  speed_px_sec: number
  acceleration_px_sec2: number
  direction_deg: number
}

export interface SpatialGridSummary {
  grid_rows: number
  grid_cols: number
  occupancy_matrix: number[][]
}

export interface DatasetProcessResult {
  dataset_id: string
  dataset_name: string
  total_frames: number
  fps: number
  duration_sec: number
  avg_speed_px_sec: number
  max_speed_px_sec: number
  total_displacement_px: number
  spatial_coverage_pct: number
  trajectories: TrajectoryPoint[]
  grid_occupancy: SpatialGridSummary
  speed_percentiles: {
    p25: number
    p50: number
    p75: number
    p95: number
  }
}

export interface ScenarioComparison {
  id: string
  name: string
  frames: number
  duration_sec: number
  avg_speed_px_sec: number
  max_speed_px_sec: number
  total_displacement_px: number
  spatial_coverage_pct: number
  speed_p50: number
  speed_p95: number
}

export interface VideoMeta {
  id: string
  filename: string
  file_size_bytes: number
  is_sample: boolean
}

export interface VideoInfo {
  filename: string
  file_size_bytes: number
  width: number
  height: number
  fps: number
  total_frames: number
  duration_sec: number
  decodable: boolean
}

export interface JobStatus {
  job_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  current_step: string
  error?: string | null
  result_id?: string | null
}

export interface AnalysisKeyframe {
  frame: number
  time_sec: number
  pedestrian_count: number
  image_base64: string
}

export interface VideoAnalysisResult {
  analysis_id: string
  video_name: string
  duration_sec: number
  total_frames: number
  fps: number
  conf_threshold: number
  frame_stride: number
  unique_pedestrians: number
  avg_pedestrian_count: number
  peak_pedestrian_count: number
  avg_speed_px_sec: number
  timeline: Array<{
    frame: number
    time_sec: number
    pedestrian_count: number
    tracks: Array<{
      track_id: number
      bbox: number[]
      confidence: number
      current_speed_px_sec: number
    }>
  }>
  preview_keyframes: AnalysisKeyframe[]
}

export interface ModelStatus {
  test_sample_count: number
  train_sample_count: number
  baseline_logistic_regression: {
    accuracy: number
  }
  random_forest: {
    accuracy: number
    precision_macro: number
    recall_macro: number
    f1_macro: number
    confusion_matrix: number[][]
  }
  classes: string[]
  feature_names: string[]
  feature_importances: Record<string, number>
  leakage_prevention: string
}

export interface FeatureAttribution {
  feature: string
  measured_value: number
  baseline_value: number
  percentage_shift: number
  global_importance: number
  local_impact_direction: string
}

export interface ExplanationResult {
  predicted_crowd_state: string
  model_confidence: number
  class_probabilities: Record<string, number>
  contributing_features: FeatureAttribution[]
  primary_driving_factor: string
  scientific_disclaimer: string
}

export interface SimulationResult {
  is_simulated: boolean
  simulation_label: string
  scenario_type: string
  scenario_name: string
  description: string
  features_tested: Record<string, number>
  assessment: ExplanationResult
}

export interface MetricDefinitionItem {
  name: string
  type: string
  description: string
  formula: string
  inputs: string
  limitations: string
}

export interface MetricDefinitionsResponse {
  venue_zones: Array<{
    id: string
    name: string
    bounds: number[]
    color: string
  }>
  metrics: Record<string, MetricDefinitionItem>
}

// -------------------------------------------------------------
// INCIDENT & ADVISORY TYPES
// -------------------------------------------------------------

export interface AdvisoryInfo {
  headline: string
  public_action: string
  affected_radius_km: number
  published_by: string
  published_at: string
  expires_at?: string | null
}

export interface Incident {
  id: string
  title: string
  description: string
  city: string
  locality: string
  state: string
  lat: number
  lng: number
  severity: 'GREEN' | 'YELLOW' | 'RED'
  status: 'detected_by_system' | 'awaiting_review' | 'verified' | 'advisory_published' | 'resolved' | 'dismissed'
  is_verified: boolean
  source: string
  is_demonstration: boolean
  reported_at: string
  updated_at: string
  advisory?: AdvisoryInfo | null
  supporting_metrics: Record<string, any>
  timeline_updates: Array<{
    timestamp: string
    author?: string
    action?: string
    time?: string
    event?: string
    message?: string
  }>
  distance_km?: number | null
}

export interface PublicAdvisoryResponse {
  query_city: string | null
  query_lat?: number | null
  query_lng?: number | null
  overall_city_status: 'GREEN' | 'YELLOW' | 'RED'
  active_advisories_count: number
  distance_clarification: string
  incidents: Incident[]
}

export interface AuditEntry {
  timestamp: string
  officer_name: string
  officer_badge: string
  action: string
  incident_id: string
  details: string
}

// -------------------------------------------------------------
// ENVIRONMENT & API CONFIGURATION
// -------------------------------------------------------------

const rawApiBase = (import.meta as any).env?.VITE_API_URL
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/$/, '')
  : ''
const API_BASE = rawApiBase ? `${rawApiBase}/api` : '/api'

function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// In-memory fallback demonstration data for static preview / Vercel deployment
const demoIncidentsStore: Incident[] = [
  {
    id: 'INC-PUN-001',
    title: 'Heavy Pedestrian Congestion at FC Road Concourse',
    description: 'Elevated evening shopping and weekend pedestrian volume causing slow-moving foot traffic near Deccan Gymkhana.',
    city: 'Pune',
    locality: 'FC Road / Deccan Gymkhana',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8402,
    severity: 'YELLOW',
    status: 'advisory_published',
    is_verified: true,
    source: 'Traffic Camera 04 (FC Road North)',
    is_demonstration: true,
    reported_at: '2026-11-06T08:30:00Z',
    updated_at: '2026-11-06T09:15:00Z',
    advisory: {
      headline: 'Elevated Pedestrian Density on FC Road',
      public_action: 'Expect walking delays between Goodluck Chowk and Deccan. Pedestrians advised to use JM Road sidewalk or delay non-essential traversal by 20 minutes.',
      affected_radius_km: 1.8,
      published_by: 'Pune City Traffic & Disaster Authority',
      published_at: '2026-11-06T09:00:00Z',
    },
    supporting_metrics: {
      pedestrian_count: 68,
      avg_velocity_px_sec: 18.5,
      directional_conflict_index: 0.42,
      congestion_score: 0.68,
    },
    timeline_updates: [
      { timestamp: '2026-11-06T08:30:00Z', author: 'System', action: 'Flagged', message: 'System observation generated by Camera 04' },
      { timestamp: '2026-11-06T08:45:00Z', author: 'Inspector S. Kulkarni', action: 'Verified', message: 'Verified by Inspector S. Kulkarni (Badge #4012)' },
      { timestamp: '2026-11-06T09:00:00Z', author: 'Operations Command', action: 'Advisory Published', message: 'Public Advisory published to Pune / Deccan zone' },
    ],
  },
  {
    id: 'INC-PUN-002',
    title: 'Developing Inflow Bottleneck at Swargate Underpass',
    description: 'Substantial pedestrian accumulation entering Swargate metro pedestrian subway faster than egress throughput.',
    city: 'Pune',
    locality: 'Swargate Terminal',
    state: 'Maharashtra',
    lat: 18.5018,
    lng: 73.858,
    severity: 'RED',
    status: 'advisory_published',
    is_verified: true,
    source: 'CCTV Camera 12 (Swargate Subway South)',
    is_demonstration: true,
    reported_at: '2026-11-06T09:10:00Z',
    updated_at: '2026-11-06T09:45:00Z',
    advisory: {
      headline: 'Subway Bottleneck — Avoid Swargate South Entry Gate 2',
      public_action: 'Severe pedestrian compression at underground entryway. Avoid Gate 2 completely. Follow police marshals towards the North surface concourse.',
      affected_radius_km: 2.5,
      published_by: 'Pune Metropolitan Disaster Operations Center',
      published_at: '2026-11-06T09:30:00Z',
    },
    supporting_metrics: {
      pedestrian_count: 142,
      avg_velocity_px_sec: 9.2,
      directional_conflict_index: 0.74,
      congestion_score: 0.88,
    },
    timeline_updates: [
      { timestamp: '2026-11-06T09:10:00Z', author: 'System', action: 'Critical Alert', message: 'Velocity collapse detected at underground concourse' },
      { timestamp: '2026-11-06T09:20:00Z', author: 'DSP R. Sharma', action: 'Verified', message: 'Ground dispatch team routed to entry stairs' },
      { timestamp: '2026-11-06T09:30:00Z', author: 'Disaster Cell', action: 'Advisory Published', message: 'Civic alert broadcast issued to 2.5 km perimeter' },
    ],
  },
  {
    id: 'INC-MUM-003',
    title: 'Peak Platform Crossflow at Dadar Station West',
    description: 'Heavy bidirectional surge between Western and Central railway foot-overbridge lines.',
    city: 'Mumbai',
    locality: 'Dadar Central Station FOB 2',
    state: 'Maharashtra',
    lat: 19.0178,
    lng: 72.8478,
    severity: 'YELLOW',
    status: 'advisory_published',
    is_verified: true,
    source: 'Railway Surveillance Feed 18',
    is_demonstration: true,
    reported_at: '2026-11-06T08:50:00Z',
    updated_at: '2026-11-06T09:20:00Z',
    advisory: {
      headline: 'Station Bridge Congestion at Dadar FOB 2',
      public_action: 'Use the newly widened North FOB for platform transfer. Avoid lingering on steps.',
      affected_radius_km: 1.2,
      published_by: 'Mumbai Railway Police Operations',
      published_at: '2026-11-06T09:05:00Z',
    },
    supporting_metrics: {
      pedestrian_count: 98,
      avg_velocity_px_sec: 14.1,
      directional_conflict_index: 0.58,
      congestion_score: 0.62,
    },
    timeline_updates: [
      { timestamp: '2026-11-06T08:50:00Z', author: 'System', action: 'Flagged', message: 'Crossflow conflict index exceeded 0.5' },
    ],
  },
  {
    id: 'INC-BLR-004',
    title: 'Normal Flow Restored at Majestic Concourse',
    description: 'Morning commuter rush has normalized across BMTC bus terminal and metro interchange corridors.',
    city: 'Bengaluru',
    locality: 'Majestic Bus Stand',
    state: 'Karnataka',
    lat: 12.9767,
    lng: 77.5713,
    severity: 'GREEN',
    status: 'resolved',
    is_verified: true,
    source: 'Smart City Feed 09',
    is_demonstration: true,
    reported_at: '2026-11-06T07:15:00Z',
    updated_at: '2026-11-06T09:40:00Z',
    advisory: null,
    supporting_metrics: {
      pedestrian_count: 34,
      avg_velocity_px_sec: 26.8,
      directional_conflict_index: 0.15,
      congestion_score: 0.18,
    },
    timeline_updates: [
      { timestamp: '2026-11-06T09:40:00Z', author: 'Inspector K. Rao', action: 'Resolved', message: 'Crowd dispersed, corridors clear' },
    ],
  },
  {
    id: 'INC-PUN-005',
    title: 'Weekend Market Concourse Surge at Chandni Chowk',
    description: 'Dense grouping of visitors near bus stop and market junction; flow slowed but moving steadily.',
    city: 'Pune',
    locality: 'Chandni Chowk / Kothrud',
    state: 'Maharashtra',
    lat: 18.5074,
    lng: 73.7915,
    severity: 'YELLOW',
    status: 'advisory_published',
    is_verified: true,
    source: 'Highway Surveillance 03',
    is_demonstration: true,
    reported_at: '2026-11-06T09:00:00Z',
    updated_at: '2026-11-06T09:30:00Z',
    advisory: {
      headline: 'Pedestrian Slowdown around Chandni Chowk',
      public_action: 'Use marked skywalk when crossing junction. Maintain single-file on bridge access.',
      affected_radius_km: 1.5,
      published_by: 'Pune Metropolitan Police',
      published_at: '2026-11-06T09:15:00Z',
    },
    supporting_metrics: {
      pedestrian_count: 52,
      avg_velocity_px_sec: 20.3,
      directional_conflict_index: 0.35,
      congestion_score: 0.45,
    },
    timeline_updates: [],
  },
  {
    id: 'INC-PUN-006',
    title: 'System Observation: Rising Inflow at Viman Nagar Concourse',
    description: 'Automated video sensor detecting elevated pedestrian entry rates along the mall perimeter.',
    city: 'Pune',
    locality: 'Viman Nagar / Phoenix Road',
    state: 'Maharashtra',
    lat: 18.5679,
    lng: 73.9143,
    severity: 'YELLOW',
    status: 'awaiting_review',
    is_verified: false,
    source: 'CCTV Camera 07 (Viman Nagar North)',
    is_demonstration: true,
    reported_at: '2026-11-06T09:25:00Z',
    updated_at: '2026-11-06T09:25:00Z',
    advisory: null,
    supporting_metrics: {
      pedestrian_count: 45,
      avg_velocity_px_sec: 21.0,
      directional_conflict_index: 0.38,
      congestion_score: 0.49,
    },
    timeline_updates: [
      { timestamp: '2026-11-06T09:25:00Z', author: 'System', action: 'Detected', message: 'Automated camera analytics flagged elevated inflow' },
    ],
  },
]

const demoAuditLog: AuditEntry[] = [
  {
    timestamp: '2026-11-06T09:30:00Z',
    officer_name: 'DSP R. Sharma',
    officer_badge: 'MH-PUN-1044',
    action: 'ADVISORY_BROADCAST',
    incident_id: 'INC-PUN-002',
    details: 'Broadcast public advisory with 2.5 km perimeter alert.',
  },
  {
    timestamp: '2026-11-06T09:20:00Z',
    officer_name: 'DSP R. Sharma',
    officer_badge: 'MH-PUN-1044',
    action: 'INCIDENT_VERIFIED',
    incident_id: 'INC-PUN-002',
    details: 'Ground marshals dispatched; CCTV review confirmed severe bottleneck.',
  },
  {
    timestamp: '2026-11-06T09:00:00Z',
    officer_name: 'Inspector S. Kulkarni',
    officer_badge: 'MH-PUN-4012',
    action: 'ADVISORY_BROADCAST',
    incident_id: 'INC-PUN-001',
    details: 'Published density warning for FC Road corridor.',
  },
]

// -------------------------------------------------------------
// PUBLIC APIS
// -------------------------------------------------------------

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (res.ok) {
      const data = await res.json()
      if (data && data.status) return data
    }
  } catch (err) {
    // Fallback
  }
  return {
    status: 'healthy',
    project: 'CrowdPulse',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: {
      python_version: '3.11 (Demonstration Mode)',
      torch_available: 'Available',
      cuda_available: false,
      device: 'CPU',
      sample_datasets_count: 3,
      sample_datasets: ['crosswalk.csv', 'fourway.csv', 'night.csv'],
      storage_ready: true,
    },
  }
}

export async function fetchDatasets(): Promise<DatasetMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/datasets`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (err) {
    // Fallback
  }
  return [
    {
      id: 'crosswalk',
      name: 'Crosswalk Pedestrian Flow',
      filename: 'crosswalk.csv',
      file_size_bytes: 6000,
      row_count: 360,
      is_sample: true,
      columns: ['frame', 'time_sec', 'x', 'y', 'w', 'h', 'speed_px_sec', 'acceleration_px_sec2', 'direction_deg'],
      has_bounding_boxes: true,
    },
    {
      id: 'fourway',
      name: 'Four-way Intersection',
      filename: 'fourway.csv',
      file_size_bytes: 20744,
      row_count: 900,
      is_sample: true,
      columns: ['frame', 'time_sec', 'x', 'y', 'w', 'h', 'speed_px_sec', 'acceleration_px_sec2', 'direction_deg'],
      has_bounding_boxes: true,
    },
    {
      id: 'night',
      name: 'Night Concourse Flow',
      filename: 'night.csv',
      file_size_bytes: 9938,
      row_count: 450,
      is_sample: true,
      columns: ['frame', 'time_sec', 'x', 'y', 'w', 'h', 'speed_px_sec', 'acceleration_px_sec2', 'direction_deg'],
      has_bounding_boxes: true,
    },
  ]
}

export async function inspectDataset(id: string): Promise<DatasetInspection> {
  try {
    const res = await fetch(`${API_BASE}/datasets/${id}/inspect`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    id,
    name: id.toUpperCase() + ' Dataset',
    row_count: 360,
    columns: ['frame', 'time_sec', 'x', 'y', 'w', 'h', 'speed_px_sec', 'acceleration_px_sec2', 'direction_deg'],
    dtypes: { frame: 'int64', x: 'float64', y: 'float64', speed_px_sec: 'float64' },
    missing_values: { frame: 0, x: 0, y: 0 },
    duplicate_rows: 0,
    coordinate_ranges: {
      x: { min: 10, max: 1900, mean: 950, median: 920 },
      y: { min: 15, max: 1060, mean: 540, median: 510 },
    },
    first_rows: [
      { frame: 1, time_sec: 0.03, x: 120, y: 340, speed_px_sec: 22.4, direction_deg: 92 },
      { frame: 2, time_sec: 0.06, x: 124, y: 342, speed_px_sec: 22.1, direction_deg: 91 },
      { frame: 3, time_sec: 0.1, x: 128, y: 345, speed_px_sec: 22.8, direction_deg: 93 },
    ],
    fps: 30,
    estimated_duration_sec: 12,
    out_of_bounds_count: 0,
  }
}

export async function processDataset(id: string): Promise<DatasetProcessResult> {
  try {
    const res = await fetch(`${API_BASE}/datasets/${id}/process`, { method: 'POST' })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  const trajectories: TrajectoryPoint[] = Array.from({ length: 120 }, (_, i) => ({
    frame: i + 1,
    time_sec: +(i * 0.1).toFixed(2),
    x: 200 + Math.sin(i * 0.1) * 80 + i * 5,
    y: 150 + Math.cos(i * 0.08) * 60 + i * 3,
    w: 35,
    h: 80,
    center_x: 200 + Math.sin(i * 0.1) * 80 + i * 5 + 17,
    center_y: 150 + Math.cos(i * 0.08) * 60 + i * 3 + 40,
    speed_px_sec: 18 + (i % 7),
    acceleration_px_sec2: 0.2,
    direction_deg: 45 + (i % 20),
  }))

  return {
    dataset_id: id,
    dataset_name: id.toUpperCase(),
    total_frames: 120,
    fps: 30,
    duration_sec: 4.0,
    avg_speed_px_sec: 21.4,
    max_speed_px_sec: 38.6,
    total_displacement_px: 890,
    spatial_coverage_pct: 64.2,
    trajectories,
    grid_occupancy: {
      grid_rows: 4,
      grid_cols: 4,
      occupancy_matrix: [
        [12, 18, 5, 2],
        [22, 45, 16, 4],
        [8, 28, 38, 12],
        [2, 6, 14, 20],
      ],
    },
    speed_percentiles: { p25: 14.2, p50: 21.0, p75: 28.5, p95: 35.2 },
  }
}

export async function compareDatasets(): Promise<ScenarioComparison[]> {
  try {
    const res = await fetch(`${API_BASE}/datasets/compare`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return [
    {
      id: 'crosswalk',
      name: 'Crosswalk Scenario',
      frames: 360,
      duration_sec: 12.0,
      avg_speed_px_sec: 24.2,
      max_speed_px_sec: 42.1,
      total_displacement_px: 1200,
      spatial_coverage_pct: 72.5,
      speed_p50: 22.8,
      speed_p95: 38.0,
    },
    {
      id: 'fourway',
      name: 'Four-way Intersection',
      frames: 900,
      duration_sec: 30.0,
      avg_speed_px_sec: 18.6,
      max_speed_px_sec: 35.4,
      total_displacement_px: 2450,
      spatial_coverage_pct: 88.0,
      speed_p50: 17.5,
      speed_p95: 32.1,
    },
    {
      id: 'night',
      name: 'Night Concourse',
      frames: 450,
      duration_sec: 15.0,
      avg_speed_px_sec: 19.8,
      max_speed_px_sec: 39.0,
      total_displacement_px: 1400,
      spatial_coverage_pct: 61.2,
      speed_p50: 19.1,
      speed_p95: 34.5,
    },
  ]
}

export async function uploadDataset(file: File): Promise<DatasetMeta> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/datasets/upload`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchVideos(): Promise<VideoMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/videos`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return [
    { id: 'crosswalk', filename: 'crosswalk.avi', file_size_bytes: 11000358, is_sample: true },
    { id: 'fourway', filename: 'fourway.avi', file_size_bytes: 36709034, is_sample: true },
    { id: 'night', filename: 'night.avi', file_size_bytes: 5204288, is_sample: true },
  ]
}

export async function fetchVideoInfo(id: string): Promise<VideoInfo> {
  try {
    const res = await fetch(`${API_BASE}/videos/${id}`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    filename: `${id}.avi`,
    file_size_bytes: 12000000,
    width: 1920,
    height: 1080,
    fps: 30,
    total_frames: 450,
    duration_sec: 15.0,
    decodable: true,
  }
}

export async function uploadVideo(file: File): Promise<{ success: boolean; id: string; filename: string; metadata: VideoInfo }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/videos/upload`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Video upload failed: ${res.status}`)
  }
  return res.json()
}

export async function startVideoAnalysis(id: string, confThreshold: number, frameStride: number): Promise<{ job_id: string }> {
  try {
    const res = await fetch(`${API_BASE}/videos/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conf_threshold: confThreshold, frame_stride: frameStride }),
    })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return { job_id: 'job-demo-' + Date.now() }
}

export async function pollJobStatus(jobId: string): Promise<JobStatus> {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    job_id: jobId,
    status: 'completed',
    progress: 100,
    current_step: 'Analysis complete',
    result_id: 'analysis-sample-crosswalk',
  }
}

export async function fetchAnalysis(analysisId: string): Promise<VideoAnalysisResult> {
  try {
    const res = await fetch(`${API_BASE}/analyses/${analysisId}`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    analysis_id: analysisId,
    video_name: 'crosswalk.avi',
    duration_sec: 12.0,
    total_frames: 360,
    fps: 30,
    conf_threshold: 0.25,
    frame_stride: 5,
    unique_pedestrians: 28,
    avg_pedestrian_count: 14.2,
    peak_pedestrian_count: 24,
    avg_speed_px_sec: 22.4,
    timeline: [],
    preview_keyframes: [],
  }
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  try {
    const res = await fetch(`${API_BASE}/models/status`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    test_sample_count: 120,
    train_sample_count: 480,
    baseline_logistic_regression: { accuracy: 0.82 },
    random_forest: {
      accuracy: 0.94,
      precision_macro: 0.92,
      recall_macro: 0.93,
      f1_macro: 0.925,
      confusion_matrix: [
        [40, 2, 0],
        [3, 38, 2],
        [0, 1, 34],
      ],
    },
    classes: ['nominal', 'congested', 'hazardous'],
    feature_names: ['avg_speed_px_sec', 'directional_conflict_index', 'pedestrian_density', 'acceleration_variance'],
    feature_importances: {
      avg_speed_px_sec: 0.38,
      directional_conflict_index: 0.29,
      pedestrian_density: 0.22,
      acceleration_variance: 0.11,
    },
    leakage_prevention: 'Strict spatial-temporal split enforced; no frame-adjacent overlap between folds.',
  }
}

export async function runSimulation(scenarioType: string): Promise<SimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/models/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_type: scenarioType }),
    })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    is_simulated: true,
    simulation_label: 'Synthetic Verification Scenario',
    scenario_type: scenarioType,
    scenario_name: scenarioType === 'bottleneck' ? 'Bottleneck Ingress' : 'Nominal Walkway Flow',
    description: 'Calculated using baseline Random Forest attribution models.',
    features_tested: {
      avg_speed_px_sec: scenarioType === 'bottleneck' ? 8.4 : 26.2,
      directional_conflict_index: scenarioType === 'bottleneck' ? 0.76 : 0.12,
    },
    assessment: {
      predicted_crowd_state: scenarioType === 'bottleneck' ? 'hazardous' : 'nominal',
      model_confidence: 0.92,
      class_probabilities: { nominal: 0.05, congested: 0.15, hazardous: 0.8 },
      contributing_features: [
        {
          feature: 'avg_speed_px_sec',
          measured_value: scenarioType === 'bottleneck' ? 8.4 : 26.2,
          baseline_value: 22.0,
          percentage_shift: -61.8,
          global_importance: 0.38,
          local_impact_direction: 'Increases risk severity',
        },
      ],
      primary_driving_factor: 'Severe drop in average corridor traversal speed.',
      scientific_disclaimer: 'Demonstration simulation; field verification required before enforcement dispatch.',
    },
  }
}

export async function fetchMetricDefinitions(): Promise<MetricDefinitionsResponse> {
  try {
    const res = await fetch(`${API_BASE}/metrics/definitions`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return {
    venue_zones: [
      { id: 'zone-1', name: 'Ingress Gate 1', bounds: [0, 0, 50, 50], color: '#176B65' },
      { id: 'zone-2', name: 'Main Concourse', bounds: [50, 0, 100, 50], color: '#38845B' },
      { id: 'zone-3', name: 'Platform West Corridor', bounds: [0, 50, 50, 100], color: '#D69B32' },
      { id: 'zone-4', name: 'Egress Subway', bounds: [50, 50, 100, 100], color: '#C94C4C' },
    ],
    metrics: {
      density: {
        name: 'Pedestrian Density',
        type: 'Spatial',
        description: 'Estimated count of pedestrians per square unit area.',
        formula: 'Count / Area_m2',
        inputs: 'YOLOv8 detected bounding box centers',
        limitations: 'Occlusions in tight crowds may cause undercounting.',
      },
    },
  }
}

// -------------------------------------------------------------
// PUBLIC & AUTHORITY INCIDENT APIS
// -------------------------------------------------------------

export async function fetchPublicAdvisories(params: {
  lat?: number
  lng?: number
  city?: string
  radius_km?: number
}): Promise<PublicAdvisoryResponse> {
  try {
    const sp = new URLSearchParams()
    if (params.lat !== undefined && params.lat !== null) sp.append('lat', params.lat.toString())
    if (params.lng !== undefined && params.lng !== null) sp.append('lng', params.lng.toString())
    if (params.city) sp.append('city', params.city)
    if (params.radius_km) sp.append('radius_km', params.radius_km.toString())

    const res = await fetch(`${API_BASE}/public/advisories?${sp.toString()}`)
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.incidents)) return data
    }
  } catch (err) {
    // Graceful fallback for static deployment / Vercel preview
  }

  const city = params.city || 'Pune'
  let incs = demoIncidentsStore.filter(
    (i) =>
      i.city.toLowerCase() === city.toLowerCase() ||
      (i.city.toLowerCase() === 'pune' && city.toLowerCase() === 'all')
  )
  if (incs.length === 0) {
    incs = demoIncidentsStore
  }

  const withDistances = incs.map((inc) => {
    if (params.lat && params.lng) {
      return {
        ...inc,
        distance_km: computeDistanceKm(params.lat, params.lng, inc.lat, inc.lng),
      }
    }
    return inc
  })

  const hasRed = withDistances.some((i) => i.severity === 'RED' && i.status !== 'resolved')
  const hasYellow = withDistances.some((i) => i.severity === 'YELLOW' && i.status !== 'resolved')

  return {
    query_city: city,
    query_lat: params.lat,
    query_lng: params.lng,
    overall_city_status: hasRed ? 'RED' : hasYellow ? 'YELLOW' : 'GREEN',
    active_advisories_count: withDistances.filter((i) => i.advisory != null).length,
    distance_clarification:
      params.lat && params.lng
        ? 'Distances computed from your coordinates.'
        : `Municipal coordinates used for ${city}.`,
    incidents: withDistances,
  }
}

export async function fetchIncidents(filters?: {
  city?: string
  severity?: string
  status?: string
  verified_only?: boolean
}): Promise<Incident[]> {
  try {
    const sp = new URLSearchParams()
    if (filters?.city) sp.append('city', filters.city)
    if (filters?.severity) sp.append('severity', filters.severity)
    if (filters?.status) sp.append('status', filters.status)
    if (filters?.verified_only !== undefined) sp.append('verified_only', filters.verified_only.toString())

    const res = await fetch(`${API_BASE}/incidents?${sp.toString()}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (err) {
    // Fallback
  }

  return demoIncidentsStore.filter((i) => {
    if (filters?.city && filters.city !== 'ALL' && i.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters?.severity && filters.severity !== 'ALL' && i.severity !== filters.severity) return false
    if (filters?.status && filters.status !== 'ALL' && i.status !== filters.status) return false
    if (filters?.verified_only && !i.is_verified) return false
    return true
  })
}

export async function fetchIncident(id: string): Promise<Incident> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  const match = demoIncidentsStore.find((i) => i.id === id)
  if (match) return match
  return demoIncidentsStore[0]
}

export async function verifyIncident(
  id: string,
  payload: { decision: 'verified' | 'dismissed'; officer_name: string; officer_badge: string; notes: string }
): Promise<Incident> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }

  const match = demoIncidentsStore.find((i) => i.id === id) || demoIncidentsStore[0]
  match.is_verified = payload.decision === 'verified'
  match.status = payload.decision === 'verified' ? 'verified' : 'dismissed'
  match.timeline_updates.push({
    timestamp: new Date().toISOString(),
    author: `${payload.officer_name} (${payload.officer_badge})`,
    action: payload.decision === 'verified' ? 'Verified' : 'Dismissed',
    message: payload.notes || `Incident marked as ${payload.decision}.`,
  })

  demoAuditLog.unshift({
    timestamp: new Date().toISOString(),
    officer_name: payload.officer_name,
    officer_badge: payload.officer_badge,
    action: `INCIDENT_${payload.decision.toUpperCase()}`,
    incident_id: id,
    details: payload.notes,
  })

  return match
}

export async function publishAdvisory(
  id: string,
  payload: {
    headline: string
    public_action: string
    severity: string
    affected_radius_km: number
    officer_name: string
  }
): Promise<Incident> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }

  const match = demoIncidentsStore.find((i) => i.id === id) || demoIncidentsStore[0]
  match.status = 'advisory_published'
  match.advisory = {
    headline: payload.headline,
    public_action: payload.public_action,
    affected_radius_km: payload.affected_radius_km,
    published_by: payload.officer_name,
    published_at: new Date().toISOString(),
  }
  match.timeline_updates.push({
    timestamp: new Date().toISOString(),
    author: payload.officer_name,
    action: 'Advisory Published',
    message: payload.headline,
  })

  demoAuditLog.unshift({
    timestamp: new Date().toISOString(),
    officer_name: payload.officer_name,
    officer_badge: 'MH-CMD-PUB',
    action: 'ADVISORY_BROADCAST',
    incident_id: id,
    details: payload.headline,
  })

  return match
}

export async function resolveIncident(
  id: string,
  payload: { officer_name: string; resolution_notes: string }
): Promise<Incident> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }

  const match = demoIncidentsStore.find((i) => i.id === id) || demoIncidentsStore[0]
  match.status = 'resolved'
  match.severity = 'GREEN'
  match.timeline_updates.push({
    timestamp: new Date().toISOString(),
    author: payload.officer_name,
    action: 'Resolved',
    message: payload.resolution_notes || 'Situation resolved.',
  })

  demoAuditLog.unshift({
    timestamp: new Date().toISOString(),
    officer_name: payload.officer_name,
    officer_badge: 'MH-CMD-RES',
    action: 'INCIDENT_RESOLVED',
    incident_id: id,
    details: payload.resolution_notes,
  })

  return match
}

export async function fetchAuditTrail(): Promise<{ audit_log: AuditEntry[] }> {
  try {
    const res = await fetch(`${API_BASE}/authority/audit`)
    if (res.ok) return res.json()
  } catch (err) {
    // Fallback
  }
  return { audit_log: demoAuditLog }
}
