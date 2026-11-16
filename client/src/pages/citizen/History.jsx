
import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/reports/my-reports'

function History() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        throw new Error(result.message || 'Could not fetch report history')
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

  function formatDate(date) {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="citizen-page">
      <h1>My Report History</h1>
      <p>Track the status of reports submitted from this portal.</p>

      {loading && <p>Loading your reports...</p>}

      {error && (
        <div>
          <p>{error}</p>
          <button type="button" onClick={fetchReports}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <p>You haven't submitted any reports yet.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="history-list">
          {reports.map((report) => (
            <article className="history-card" key={report.id}>
              <div>
                <strong>{report.incident_type}</strong>
                <span>{report.location}</span>
                <small>{formatDate(report.created_at)}</small>
              </div>

              <span className="history-status">
                {report.status}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
