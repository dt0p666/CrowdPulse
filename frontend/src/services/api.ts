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

const API_BASE = '/api'

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchDatasets(): Promise<DatasetMeta[]> {
  const res = await fetch(`${API_BASE}/datasets`)
  if (!res.ok) {
    throw new Error(`Failed to fetch datasets: ${res.status}`)
  }
  return res.json()
}

export async function inspectDataset(id: string): Promise<DatasetInspection> {
  const res = await fetch(`${API_BASE}/datasets/${id}/inspect`)
  if (!res.ok) {
    throw new Error(`Failed to inspect dataset ${id}: ${res.status}`)
  }
  return res.json()
}

export async function processDataset(id: string): Promise<DatasetProcessResult> {
  const res = await fetch(`${API_BASE}/datasets/${id}/process`, {
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(`Failed to process dataset ${id}: ${res.status}`)
  }
  return res.json()
}

export async function compareDatasets(): Promise<ScenarioComparison[]> {
  const res = await fetch(`${API_BASE}/datasets/compare`)
  if (!res.ok) {
    throw new Error(`Failed to fetch scenario comparison: ${res.status}`)
  }
  return res.json()
}

export async function uploadDataset(file: File): Promise<DatasetMeta> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed: ${res.status}`)
  }
  return res.json()
}
