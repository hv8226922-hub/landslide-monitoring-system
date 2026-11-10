

import { useCallback, useEffect, useMemo, useState } from 'react'

import MetricCard from '../../components/MetricCard.jsx'
import LocationCard from '../../components/LocationCard.jsx'
import AlertCard from '../../components/AlertCard.jsx'
import RiskMap from '../../components/RiskMap.jsx'
import RainfallChart from '../../components/RainfallChart.jsx'
import ReportForm from '../../components/ReportForm.jsx'

const API_URL = 'http://127.0.0.1:5000/api/reports'

// Dashboard location data
const locations = [
  {
    name: 'Uttarkashi',
    risk: 'High',
    rainfall: 'Heavy rainfall',
    status: 'Monitoring',
  },
  {
    name: 'Chamoli',
    risk: 'Moderate',
    rainfall: 'Moderate rainfall',
    status: 'Monitoring',
  },
  {
    name: 'Rudraprayag',
    risk: 'Low',
    rainfall: 'Normal rainfall',
    status: 'Stable',
  },
]

// Dashboard alert data
const alerts = [
  {
    title: 'Weather Monitoring',
    location: 'Uttarkashi',
    message: 'Continue monitoring rainfall and local conditions.',
    time: 'Monitoring',
    level: 'High',
  },
  {
    title: 'Risk Assessment',
    location: 'Chamoli',
    message: 'Regular monitoring recommended in this area.',
    time: 'Monitoring',
    level: 'Moderate',
  },
]

function Dashboard() {
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [updatingReportId, setUpdatingReportId] = useState(null)
  const [deletingReportId, setDeletingReportId] = useState(null)

  // Fetch reports from backend
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true)
      setReportsError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to fetch reports')
      }

      const result = await response.json()

      if (result.success) {
        setReports(result.data || [])
      } else {
        throw new Error(result.message || 'Failed to load reports')
      }
    } catch (error) {
      console.error('Fetch reports error:', error)
      setReportsError(error.message || 'Something went wrong')
    } finally {
      setReportsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Update report status
  const updateReportStatus = async (id, newStatus) => {
    try {
      setUpdatingReportId(id)

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Status update failed')
      }

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === id
            ? { ...report, status: newStatus }
            : report
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

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
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
        report.location?.toLowerCase().includes(search) ||
        report.incident_type?.toLowerCase().includes(search) ||
        report.description?.toLowerCase().includes(search) ||
        String(report.id).includes(search)

      const matchesStatus =
        statusFilter === 'All' || report.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reports, searchTerm, statusFilter])

  // Live report metrics
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

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome to TerraWatch monitoring dashboard.</p>
        </div>
      </div>

      {/* Live Report Metrics */}
      <section className="dashboard-metrics">
        {reportMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      {/* Map and Rainfall */}
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
        <h2>Priority Locations</h2>

        <div className="location-grid">
          {locations.map((location, index) => (
            <LocationCard key={index} {...location} />
          ))}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="dashboard-section">
        <h2>Recent Alerts</h2>

        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <AlertCard key={index} {...alert} />
          ))}
        </div>
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
            placeholder="Search by ID, location, type or description..."
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
                              ).toLocaleDateString()
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
