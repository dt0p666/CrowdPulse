import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { VideoAnalysisPage } from './pages/VideoAnalysisPage'
import { DatasetLabPage } from './pages/DatasetLabPage'
import { CrowdMapPage } from './pages/CrowdMapPage'
import { PredictionLabPage } from './pages/PredictionLabPage'
import { ExplainabilityPage } from './pages/ExplainabilityPage'
import { SettingsPage } from './pages/SettingsPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/video-analysis" element={<VideoAnalysisPage />} />
          <Route path="/dataset-lab" element={<DatasetLabPage />} />
          <Route path="/crowd-map" element={<CrowdMapPage />} />
          <Route path="/prediction-lab" element={<PredictionLabPage />} />
          <Route path="/explainability" element={<ExplainabilityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
