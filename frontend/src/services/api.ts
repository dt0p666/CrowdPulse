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

const API_BASE = '/api'

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`)
  }
  return res.json()
}
