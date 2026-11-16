import { API_BASE_URL } from '../../config/api.js'


import { useCallback, useEffect, useMemo, useState } from 'react'

import MetricCard from '../../components/MetricCard.jsx'
import LocationCard from '../../components/LocationCard.jsx'
import AlertCard from '../../components/AlertCard.jsx'
import RiskMap from '../../components/RiskMap.jsx'
import RainfallChart from '../../components/RainfallChart.jsx'
import ReportForm from '../../components/ReportForm.jsx'

const API_URL = `${API_BASE_URL}/reports`
const RISK_API_URL = `${API_BASE_URL}/risk`
const ALERT_API_URL = `${API_BASE_URL}/alerts`

function getAuthToken() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Please login again')
  }

  return token
}

function formatAlertDate(date) {
  if (!date) return 'Date unavailable'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable'
  }

  return parsedDate.toLocaleString('en-IN')
}

function getLatestByDistrict(records) {
  const latestRecords = new Map()

  records.forEach((record) => {
    const district = record.district?.trim()

    if (!district) return

    const existing = latestRecords.get(district)

    const currentTime = new Date(record.predicted_at).getTime()
    const existingTime = existing
      ? new Date(existing.predicted_at).getTime()
      : -Infinity

    if (!existing || currentTime > existingTime) {
      latestRecords.set(district, record)
    }
  })

  return Array.from(latestRecords.values())
}

function Dashboard() {
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState('')

  const [riskLocations, setRiskLocations] = useState([])
  const [riskLoading, setRiskLoading] = useState(true)
  const [riskError, setRiskError] = useState('')

  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [alertsError, setAlertsError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [updatingReportId, setUpdatingReportId] = useState(null)
  const [deletingReportId, setDeletingReportId] = useState(null)

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true)
      setReportsError('')

      const token = getAuthToken()

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch reports')
      }

      setReports(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      console.error('Fetch reports error:', error)
      setReportsError(error.message || 'Something went wrong')
    } finally {
      setReportsLoading(false)
    }
  }, [])

  // Fetch latest risk prediction for each district
  const fetchRiskLocations = useCallback(async () => {
    try {
      setRiskLoading(true)
      setRiskError('')

      const token = getAuthToken()

      const response = await fetch(RISK_API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to fetch risk locations'
        )
      }

      const latestRecords = getLatestByDistrict(
        Array.isArray(result.data) ? result.data : []
      )

      const formattedLocations = latestRecords.map((record) => {
        const probability = Number(record.probability)

        return {
          id: record.id,
          district: record.district,
          risk: record.risk_level,
          score: Number.isFinite(probability)
            ? Number((probability * 100).toFixed(1))
            : null,
          rainfall:
            record.rainfall_24h !== null &&
            record.rainfall_24h !== undefined
              ? `${record.rainfall_24h} mm / 24h`
              : 'Rainfall unavailable',
          status: 'Stored record',
          predictedAt: record.predicted_at,
        }
      })

      setRiskLocations(formattedLocations)
    } catch (error) {
      console.error('Fetch risk locations error:', error)
      setRiskError(error.message || 'Unable to fetch risk locations')
    } finally {
      setRiskLoading(false)
    }
  }, [])

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true)
      setAlertsError('')

      const token = getAuthToken()

      const response = await fetch(ALERT_API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch alerts')
      }

      const formattedAlerts = (
        Array.isArray(result.data) ? result.data : []
      ).map((alert) => ({
        id: alert.id,
        title: alert.title,
        location: alert.district,
        message: alert.message,
        level: alert.risk_level || 'Moderate',
        status: alert.status || 'Active',
        time: `${formatAlertDate(alert.created_at)} · ${alert.status || 'Active'}`,
      }))

      setAlerts(formattedAlerts)
    } catch (error) {
      console.error('Fetch alerts error:', error)
      setAlertsError(error.message || 'Unable to fetch alerts')
    } finally {
      setAlertsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    fetchRiskLocations()
    fetchAlerts()
  }, [fetchReports, fetchRiskLocations, fetchAlerts])

  // Update report status
  const updateReportStatus = async (id, newStatus) => {
    try {
      setUpdatingReportId(id)

      const token = getAuthToken()

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'Status update failed')
      }

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === id ? result.data : report
        )
      )
    } catch (error) {
      console.error('Update status error:', error)
      alert(error.message || 'Unable to update report status')
    } finally {
      setUpdatingReportId(null)
    }
  }

  // Delete community report
  const deleteCommunityReport = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this report?'
    )

    if (!confirmed) return

    try {
      setDeletingReportId(id)

      const token = getAuthToken()

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Report deletion failed')
      }

      setReports((previousReports) =>
        previousReports.filter((report) => report.id !== id)
      )
    } catch (error) {
      console.error('Delete report error:', error)
      alert(error.message || 'Unable to delete report')
    } finally {
      setDeletingReportId(null)
    }
  }

  // Search and status filtering
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const search = searchTerm.toLowerCase().trim()

      const matchesSearch =
        !search ||
        String(report.id).includes(search) ||
        (report.reporter_name || '').toLowerCase().includes(search) ||
        (report.location || '').toLowerCase().includes(search) ||
        (report.incident_type || '').toLowerCase().includes(search) ||
        (report.description || '').toLowerCase().includes(search)

      const matchesStatus =
        statusFilter === 'All' || report.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reports, searchTerm, statusFilter])

  // Report metrics
  const reportMetrics = [
    {
      title: 'Total Reports',
      value: reports.length,
      note: 'All community reports',
    },
    {
      title: 'New Reports',
      value: reports.filter((report) => report.status === 'New').length,
      note: 'Awaiting review',
    },
    {
      title: 'Under Review',
      value: reports.filter(
        (report) => report.status === 'Under Review'
      ).length,
      note: 'Currently being investigated',
    },
    {
      title: 'Resolved Reports',
      value: reports.filter(
        (report) => report.status === 'Resolved'
      ).length,
      note: 'Successfully resolved',
    },
  ]

  const databaseConnected = !reportsError && !riskError && !alertsError

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="page-header dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            TERRAWATCH ADMINISTRATION
          </span>

          <h1>Dashboard Overview</h1>

          <p>
            Monitor community reports, geographical risk records
            and weather information from one place.
          </p>
        </div>

        <div className="dashboard-header-status">
          <span className="dashboard-status-dot"></span>
          {databaseConnected
            ? 'API Data Loaded'
            : 'Some API Requests Failed'}
        </div>
      </div>

      {/* Report Metrics */}
      <section className="dashboard-metrics">
        {reportMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      {/* Risk Map and Rainfall */}
      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <h2>Risk Map</h2>
          <RiskMap />
        </div>

        <div className="dashboard-panel">
          <h2>Rainfall Overview</h2>
          <RainfallChart />
        </div>
      </section>

      {/* Priority Locations */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Priority Locations</h2>
            <p>Latest risk record for each district.</p>
          </div>

          <button
            type="button"
            className="refresh-reports-btn"
            onClick={fetchRiskLocations}
            disabled={riskLoading}
          >
            {riskLoading ? 'Refreshing...' : 'Refresh Locations'}
          </button>
        </div>

        <p className="reports-message">
          These are stored risk records, not verified measurements
          or live ML-generated predictions.
        </p>

        {riskLoading ? (
          <p className="reports-message">
            Loading priority locations...
          </p>
        ) : riskError ? (
          <div className="reports-error">
            <p>{riskError}</p>
            <button type="button" onClick={fetchRiskLocations}>
              Try Again
            </button>
          </div>
        ) : riskLocations.length > 0 ? (
          <div className="location-grid">
            {riskLocations.map((location) => (
              <LocationCard key={location.id} {...location} />
            ))}
          </div>
        ) : (
          <div className="no-reports">
            No risk prediction records available yet.
          </div>
        )}
      </section>

      {/* Recent Alerts */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent Alerts</h2>
            <p>Alerts retrieved from the database.</p>
          </div>

          <button
            type="button"
            className="refresh-reports-btn"
            onClick={fetchAlerts}
            disabled={alertsLoading}
          >
            {alertsLoading ? 'Refreshing...' : 'Refresh Alerts'}
          </button>
        </div>

        {alertsLoading ? (
          <p className="reports-message">Loading alerts...</p>
        ) : alertsError ? (
          <div className="reports-error">
            <p>{alertsError}</p>
            <button type="button" onClick={fetchAlerts}>
              Try Again
            </button>
          </div>
        ) : alerts.length > 0 ? (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} {...alert} />
            ))}
          </div>
        ) : (
          <div className="no-reports">
            No alerts available yet.
          </div>
        )}
      </section>

      {/* Community Report Form */}
      <section className="dashboard-section">
        <h2>Community Reporting</h2>
        <ReportForm onReportSubmitted={fetchReports} />
      </section>

      {/* Reports Management */}
      <section className="dashboard-section reports-management">
        <div className="section-heading">
          <div>
            <h2>Reports Management</h2>
            <p>View, search, update and delete community reports.</p>
          </div>

          <button
            type="button"
            className="refresh-reports-btn"
            onClick={fetchReports}
            disabled={reportsLoading}
          >
            {reportsLoading ? 'Refreshing...' : 'Refresh Reports'}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="report-filters">
          <input
            type="text"
            className="report-search"
            placeholder="Search by ID, reporter, location, type or description..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            className="report-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('All')
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Loading and Error Messages */}
        {reportsLoading && (
          <p className="reports-message">Loading reports...</p>
        )}

        {reportsError && (
          <div className="reports-error">
            <p>{reportsError}</p>
            <button type="button" onClick={fetchReports}>
              Try Again
            </button>
          </div>
        )}

        {/* Reports Table */}
        <div className="reports-results-info">
          <div>
            <strong>{filteredReports.length}</strong>
            <span> reports displayed</span>
          </div>

          <span>Total records: {reports.length}</span>
        </div>

        {!reportsLoading && !reportsError && (
          <>
            {filteredReports.length > 0 ? (
              <div className="reports-table-container">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Incident Type</th>
                      <th>Severity</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td>{report.location}</td>
                        <td>{report.incident_type || 'Other'}</td>

                        <td>
                          <span
                            className={`severity-badge ${(report.severity || 'Moderate').toLowerCase()}`}
                          >
                            {report.severity || 'Moderate'}
                          </span>
                        </td>

                        <td className="report-description-cell">
                          {report.description}
                        </td>

                        <td>
                          <select
                            value={report.status || 'New'}
                            onChange={(event) =>
                              updateReportStatus(
                                report.id,
                                event.target.value
                              )
                            }
                            disabled={updatingReportId === report.id}
                          >
                            <option value="New">New</option>
                            <option value="Under Review">
                              Under Review
                            </option>
                            <option value="Resolved">Resolved</option>
                          </select>

                          {updatingReportId === report.id && (
                            <small className="updating-text">
                              Updating...
                            </small>
                          )}
                        </td>

                        <td>
                          {report.created_at
                            ? new Date(
                                report.created_at
                              ).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-report-btn"
                            onClick={() =>
                              deleteCommunityReport(report.id)
                            }
                            disabled={deletingReportId === report.id}
                          >
                            {deletingReportId === report.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-reports">
                {reports.length === 0
                  ? 'No community reports available yet.'
                  : 'No reports match your search or selected status.'}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Dashboard
