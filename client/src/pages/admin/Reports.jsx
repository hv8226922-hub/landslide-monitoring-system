import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

const API_URL = `${API_BASE_URL}/reports`

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function fetchReports() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not fetch reports')
      }

      setReports(result.data || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  async function markResolved(id) {
    try {
      setUpdatingId(id)
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Resolved',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not update report')
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === id ? result.data : report
        )
      )
    } catch (err) {
      setError(err.message || 'Could not update report')
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(date) {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleString()
  }

  return (
    <>
      <h1>Citizen and Field Reports</h1>
      <p>
        Review geo-tagged incident reports submitted by citizens and field teams.
      </p>

      <section>
        <h2>Incoming reports ({reports.length})</h2>

        {loading && <p>Loading reports...</p>}

        {error && (
          <div>
            <p>{error}</p>
            <button type="button" onClick={fetchReports}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <p>No reports available.</p>
        )}

        {!loading && reports.length > 0 && (
          <div className="reports-table">
            <div className="reports-table-head">
              <span>Location</span>
              <span>Incident type</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {reports.map((report) => (
              <article className="report-row" key={report.id}>
                <div>
                  <strong>{report.location}</strong>
                  <small>{formatDate(report.created_at)}</small>
                </div>

                <span>{report.incident_type}</span>

                <span
                  className={`risk-label ${(report.severity || 'Moderate').toLowerCase()}`}
                >
                  {report.severity || 'Moderate'}
                </span>

                <span className="report-status">
                  {report.status}
                </span>

                <button
                  type="button"
                  className="verify-button"
                  onClick={() => markResolved(report.id)}
                  disabled={
                    report.status === 'Resolved' ||
                    updatingId === report.id
                  }
                >
                  {updatingId === report.id
                    ? 'Updating...'
                    : report.status === 'Resolved'
                      ? 'Resolved'
                      : 'Mark resolved'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Reports
