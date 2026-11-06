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
  lat: floatNumber
  lng: floatNumber
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
    author: string
    action: string
    message: string
  }>
  distance_km?: number | null
}

type floatNumber = number

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

const API_BASE = '/api'

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function fetchDatasets(): Promise<DatasetMeta[]> {
  const res = await fetch(`${API_BASE}/datasets`)
  if (!res.ok) throw new Error(`Failed to fetch datasets: ${res.status}`)
  return res.json()
}

export async function inspectDataset(id: string): Promise<DatasetInspection> {
  const res = await fetch(`${API_BASE}/datasets/${id}/inspect`)
  if (!res.ok) throw new Error(`Failed to inspect dataset ${id}: ${res.status}`)
  return res.json()
}

export async function processDataset(id: string): Promise<DatasetProcessResult> {
  const res = await fetch(`${API_BASE}/datasets/${id}/process`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to process dataset ${id}: ${res.status}`)
  return res.json()
}

export async function compareDatasets(): Promise<ScenarioComparison[]> {
  const res = await fetch(`${API_BASE}/datasets/compare`)
  if (!res.ok) throw new Error(`Failed to fetch scenario comparison: ${res.status}`)
  return res.json()
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
  const res = await fetch(`${API_BASE}/videos`)
  if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`)
  return res.json()
}

export async function fetchVideoInfo(id: string): Promise<VideoInfo> {
  const res = await fetch(`${API_BASE}/videos/${id}`)
  if (!res.ok) throw new Error(`Failed to get video info for ${id}: ${res.status}`)
  return res.json()
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
  const res = await fetch(`${API_BASE}/videos/${id}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conf_threshold: confThreshold, frame_stride: frameStride }),
  })
  if (!res.ok) throw new Error(`Failed to start analysis for ${id}: ${res.status}`)
  return res.json()
}

export async function pollJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`)
  if (!res.ok) throw new Error(`Failed to poll job ${jobId}: ${res.status}`)
  return res.json()
}

export async function fetchAnalysis(analysisId: string): Promise<VideoAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyses/${analysisId}`)
  if (!res.ok) throw new Error(`Failed to fetch analysis ${analysisId}: ${res.status}`)
  return res.json()
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  const res = await fetch(`${API_BASE}/models/status`)
  if (!res.ok) throw new Error(`Failed to fetch model status: ${res.status}`)
  return res.json()
}

export async function runSimulation(scenarioType: string): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/models/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_type: scenarioType }),
  })
  if (!res.ok) throw new Error(`Simulation failed: ${res.status}`)
  return res.json()
}

export async function fetchMetricDefinitions(): Promise<MetricDefinitionsResponse> {
  const res = await fetch(`${API_BASE}/metrics/definitions`)
  if (!res.ok) throw new Error(`Failed to fetch metric definitions: ${res.status}`)
  return res.json()
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
  const sp = new URLSearchParams()
  if (params.lat !== undefined && params.lat !== null) sp.append('lat', params.lat.toString())
  if (params.lng !== undefined && params.lng !== null) sp.append('lng', params.lng.toString())
  if (params.city) sp.append('city', params.city)
  if (params.radius_km) sp.append('radius_km', params.radius_km.toString())

  const res = await fetch(`${API_BASE}/public/advisories?${sp.toString()}`)
  if (!res.ok) throw new Error(`Failed to fetch advisories: ${res.status}`)
  return res.json()
}

export async function fetchIncidents(filters?: {
  city?: string
  severity?: string
  status?: string
  verified_only?: boolean
}): Promise<Incident[]> {
  const sp = new URLSearchParams()
  if (filters?.city) sp.append('city', filters.city)
  if (filters?.severity) sp.append('severity', filters.severity)
  if (filters?.status) sp.append('status', filters.status)
  if (filters?.verified_only !== undefined) sp.append('verified_only', filters.verified_only.toString())

  const res = await fetch(`${API_BASE}/incidents?${sp.toString()}`)
  if (!res.ok) throw new Error(`Failed to list incidents: ${res.status}`)
  return res.json()
}

export async function fetchIncident(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch incident ${id}: ${res.status}`)
  return res.json()
}

export async function verifyIncident(
  id: string,
  payload: { decision: 'verified' | 'dismissed'; officer_name: string; officer_badge: string; notes: string }
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Verification failed: ${res.status}`)
  return res.json()
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
  const res = await fetch(`${API_BASE}/incidents/${id}/advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Advisory publishing failed: ${res.status}`)
  return res.json()
}

export async function resolveIncident(
  id: string,
  payload: { officer_name: string; resolution_notes: string }
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Incident resolution failed: ${res.status}`)
  return res.json()
}

export async function fetchAuditTrail(): Promise<{ audit_log: AuditEntry[] }> {
  const res = await fetch(`${API_BASE}/authority/audit`)
  if (!res.ok) throw new Error(`Failed to fetch audit trail: ${res.status}`)
  return res.json()
}
