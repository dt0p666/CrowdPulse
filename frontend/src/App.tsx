import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

// Top-level Role Selection
import { RoleSelection } from './pages/RoleSelection'

// Public Citizen Experience
import { PublicHomePage } from './pages/public/PublicHomePage'
import { IncidentDetailsPage } from './pages/public/IncidentDetailsPage'

// Authority Experience
import { AuthorityLoginPage } from './pages/authority/AuthorityLoginPage'
import { AuthorityDashboardPage } from './pages/authority/AuthorityDashboardPage'
import { IncidentManagementPage } from './pages/authority/IncidentManagementPage'
import { CameraFeedsPage } from './pages/authority/CameraFeedsPage'
import { AdvisoryPublisherPage } from './pages/authority/AdvisoryPublisherPage'
import { AuthorityAnalyticsPage } from './pages/authority/AuthorityAnalyticsPage'
import { AuditHistoryPage } from './pages/authority/AuditHistoryPage'

// Admin Experience & Scientific Labs
import { AdminLayout } from './layouts/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { DatasetLabPage } from './pages/DatasetLabPage'
import { PredictionLabPage } from './pages/PredictionLabPage'
import { ExplainabilityPage } from './pages/ExplainabilityPage'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Entry Screen: Role Selection */}
          <Route path="/" element={<RoleSelection />} />

          {/* Public Citizen Portal */}
          <Route path="/public" element={<PublicHomePage />} />
          <Route path="/public/incident/:id" element={<IncidentDetailsPage />} />

          {/* Authority Operations Suite */}
          <Route path="/authority/login" element={<AuthorityLoginPage />} />
          <Route path="/authority" element={<AuthorityDashboardPage />} />
          <Route path="/authority/incidents" element={<IncidentManagementPage />} />
          <Route path="/authority/cameras" element={<CameraFeedsPage />} />
          <Route path="/authority/advisory" element={<AdvisoryPublisherPage />} />
          <Route path="/authority/analytics" element={<AuthorityAnalyticsPage />} />
          <Route path="/authority/audit" element={<AuditHistoryPage />} />

          {/* Platform Administration Suite */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route
            path="/admin/datasets"
            element={
              <AdminLayout breadcrumb="Ground-Truth Dataset Lab">
                <DatasetLabPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/models"
            element={
              <AdminLayout breadcrumb="ML Holdout Benchmarks">
                <PredictionLabPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/explainability"
            element={
              <AdminLayout breadcrumb="Model Explainer (SHAP)">
                <ExplainabilityPage />
              </AdminLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
