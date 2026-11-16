import { API_BASE_URL } from '../../config/api.js'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = `${API_BASE_URL}/reports`

function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

      const response = await fetch(
        `${API_URL}?t=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to fetch incidents'
        )
      }

      setIncidents(
        Array.isArray(result.data) ? result.data : []
      )
    } catch (err) {
      console.error('Fetch incidents error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  // Search and filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const query = search.toLowerCase().trim()

      const matchesSearch =
        !query ||
        String(incident.id).includes(query) ||
        (incident.reporter_name || '').toLowerCase().includes(query) ||
        (incident.location || '').toLowerCase().includes(query) ||
        (incident.incident_type || '').toLowerCase().includes(query) ||
        (incident.description || '').toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'All' ||
        (incident.status || 'New') === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [incidents, search, statusFilter])

  // Incident statistics
  const pendingCount = incidents.filter(
    (item) => (item.status || 'New') === 'New'
  ).length

  const reviewCount = incidents.filter(
    (item) => item.status === 'Under Review'
  ).length

  const resolvedCount = incidents.filter(
    (item) => item.status === 'Resolved'
  ).length

  const getPriorityClass = (severity) => {
    const value = (severity || 'Moderate').toLowerCase()

    return ['low', 'moderate', 'high', 'critical'].includes(value)
      ? value
      : 'moderate'
  }

  const getStatusClass = (status) => {
    const value = (status || 'New').toLowerCase().replace(/\s+/g, '-')

    return ['new', 'under-review', 'resolved'].includes(value)
      ? value
      : 'new'
  }

  return (
    <div className="officer-page">

      {/* Page Header */}
      <div className="officer-header">
        <div>
          <span className="officer-eyebrow">
            TERRAWATCH FIELD OPERATIONS
          </span>

          <h1>Reported Incidents</h1>

          <p>
            View citizen reports and verify reported conditions.
          </p>
        </div>

        <button
          type="button"
          className="officer-refresh-btn"
          onClick={fetchIncidents}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh Incidents'}
        </button>
      </div>

      {/* Statistics */}
      <div className="officer-stat-grid">
        <article className="officer-stat-card">
          <span>Total Incidents</span>
          <strong>{incidents.length}</strong>
        </article>

        <article className="officer-stat-card">
          <span>Pending Verification</span>
          <strong>{pendingCount}</strong>
        </article>

        <article className="officer-stat-card">
          <span>Under Review</span>
          <strong>{reviewCount}</strong>
        </article>

        <article className="officer-stat-card">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </article>
      </div>

      {/* Search and Filters */}
      <section className="assigned-incident">
        <div className="incidents-toolbar">
          <div>
            <h2>All Incidents</h2>
            <p>
              Search and filter reported incidents.
            </p>
          </div>

          <div className="incidents-filters">
            <input
              type="search"
              placeholder="Search ID, reporter, location or type..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search incidents"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter incidents by status"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="reports-error">
            {error}
            <button type="button" onClick={fetchIncidents}>
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading incidents...</p>
        ) : error ? null : filteredIncidents.length > 0 ? (
          <>
            <div className="incidents-results-info">
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </div>

            <div className="officer-incident-list">
              {filteredIncidents.map((incident) => {
                const status = incident.status || 'New'

                return (
                  <article
                    className="officer-incident-card"
                    key={incident.id}
                  >
                    <div className="incident-card-main">
                      <div className="incident-card-badges">
                        <span
                          className={`risk-label ${getPriorityClass(incident.severity)}`}
                        >
                          {incident.severity || 'Moderate'} Priority
                        </span>

                        <span
                          className={`incident-status-badge ${getStatusClass(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <h2>
                        #{incident.id} - {incident.incident_type || 'Other'} Report
                      </h2>

                      <p className="incident-location">
                        <strong>Location:</strong>{' '}
                        {incident.location || 'Not available'}
                      </p>

                      <p>
                        {incident.description || 'No description available.'}
                      </p>
                    </div>

                    <Link
                      className="incident-open-link"
                      to={`/officer/incidents/${incident.id}`}
                    >
                      Open Incident →
                    </Link>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <div className="incidents-empty-state">
            <h3>No incidents found</h3>
            <p>
              {incidents.length === 0
                ? 'No incidents have been reported yet.'
                : 'Try changing your search or status filter.'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Incidents
