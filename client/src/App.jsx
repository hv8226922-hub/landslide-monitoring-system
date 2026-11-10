import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import CitizenLayout from './layouts/CitizenLayout.jsx'
import OfficerLayout from './layouts/OfficerLayout.jsx'

import Dashboard from './pages/admin/Dashboard.jsx'
import RiskMapPage from './pages/admin/RiskMap.jsx'
import Predictions from './pages/admin/Predictions.jsx'
import Weather from './pages/admin/Weather.jsx'
import Landslides from './pages/admin/Landslides.jsx'
import Roads from './pages/admin/Roads.jsx'
import Villages from './pages/admin/Villages.jsx'
import Infrastructure from './pages/admin/Infrastructure.jsx'
import Reports from './pages/admin/Reports.jsx'
import Alerts from './pages/admin/Alerts.jsx'
import Emergency from './pages/admin/Emergency.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import Settings from './pages/admin/Settings.jsx'

import CitizenHome from './pages/citizen/Home.jsx'
import CitizenRiskMap from './pages/citizen/RiskMap.jsx'
import ReportIncident from './pages/citizen/ReportIncident.jsx'
import CitizenAlerts from './pages/citizen/Alerts.jsx'
import Safety from './pages/citizen/Safety.jsx'
import History from './pages/citizen/History.jsx'

import OfficerDashboard from './pages/officer/Dashboard.jsx'
import Incidents from './pages/officer/Incidents.jsx'
import IncidentDetails from './pages/officer/IncidentDetails.jsx'
import OfficerMap from './pages/officer/Map.jsx'
import Offline from './pages/officer/Offline.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

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

        <Route path="/citizen" element={<CitizenLayout />}>
          <Route path="home" element={<CitizenHome />} />
          <Route path="risk-map" element={<CitizenRiskMap />} />
          <Route path="report" element={<ReportIncident />} />
          <Route path="alerts" element={<CitizenAlerts />} />
          <Route path="safety" element={<Safety />} />
          <Route path="history" element={<History />} />
        </Route>

        <Route path="/officer" element={<OfficerLayout />}>
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetails />} />
          <Route path="map" element={<OfficerMap />} />
          <Route path="offline" element={<Offline />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App