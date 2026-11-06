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
