

import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute.jsx'

const Login = lazy(() => import('./pages/auth/Login.jsx'))

const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'))
const CitizenLayout = lazy(() => import('./layouts/CitizenLayout.jsx'))
const OfficerLayout = lazy(() => import('./layouts/OfficerLayout.jsx'))

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const RiskMapPage = lazy(() => import('./pages/admin/RiskMap.jsx'))
const Predictions = lazy(() => import('./pages/admin/Predictions.jsx'))
const Weather = lazy(() => import('./pages/admin/Weather.jsx'))
const Landslides = lazy(() => import('./pages/admin/Landslides.jsx'))
const Roads = lazy(() => import('./pages/admin/Roads.jsx'))
const Villages = lazy(() => import('./pages/admin/Villages.jsx'))
const Infrastructure = lazy(() => import('./pages/admin/Infrastructure.jsx'))
const Reports = lazy(() => import('./pages/admin/Reports.jsx'))
const Alerts = lazy(() => import('./pages/admin/Alerts.jsx'))
const Emergency = lazy(() => import('./pages/admin/Emergency.jsx'))
const Analytics = lazy(() => import('./pages/admin/Analytics.jsx'))
const Settings = lazy(() => import('./pages/admin/Settings.jsx'))

// Citizen pages
const CitizenHome = lazy(() => import('./pages/citizen/Home.jsx'))
const CitizenRiskMap = lazy(() => import('./pages/citizen/RiskMap.jsx'))
const ReportIncident = lazy(() => import('./pages/citizen/ReportIncident.jsx'))
const CitizenAlerts = lazy(() => import('./pages/citizen/Alerts.jsx'))
const Safety = lazy(() => import('./pages/citizen/Safety.jsx'))
const History = lazy(() => import('./pages/citizen/History.jsx'))

// Officer pages
const OfficerDashboard = lazy(() => import('./pages/officer/Dashboard.jsx'))
const Incidents = lazy(() => import('./pages/officer/Incidents.jsx'))
const IncidentDetails = lazy(() => import('./pages/officer/IncidentDetails.jsx'))
const OfficerMap = lazy(() => import('./pages/officer/Map.jsx'))
const Offline = lazy(() => import('./pages/officer/Offline.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          {/* Admin protected routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="risk-map" element={<RiskMapPage />} />
              <Route path="predictions" element={<Predictions />} />
              <Route path="weather" element={<Weather />} />
              <Route path="landslides" element={<Landslides />} />
              <Route path="roads" element={<Roads />} />
              <Route path="villages" element={<Villages />} />
              <Route path="infrastructure" element={<Infrastructure />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Citizen protected routes */}
          <Route element={<ProtectedRoute allowedRole="citizen" />}>
            <Route path="/citizen" element={<CitizenLayout />}>
              <Route path="home" element={<CitizenHome />} />
              <Route path="risk-map" element={<CitizenRiskMap />} />
              <Route path="report" element={<ReportIncident />} />
              <Route path="alerts" element={<CitizenAlerts />} />
              <Route path="safety" element={<Safety />} />
              <Route path="history" element={<History />} />
            </Route>
          </Route>

          {/* Officer protected routes */}
          <Route element={<ProtectedRoute allowedRole="officer" />}>
            <Route path="/officer" element={<OfficerLayout />}>
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="incidents/:id" element={<IncidentDetails />} />
              <Route path="map" element={<OfficerMap />} />
              <Route path="offline" element={<Offline />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
