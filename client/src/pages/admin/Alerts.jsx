
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/alerts'

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch alerts from database
  const fetchAlerts = useCallback(async () => {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch alerts')
      }

      setAlerts(result.data || [])
    } catch (err) {
      console.error('Alerts fetch error:', err)
      setError(err.message || 'Unable to fetch alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Acknowledge alert
  async function acknowledgeAlert(id) {
    try {
      setUpdatingId(id)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

      const response = await fetch(
        `${API_URL}/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Acknowledged',
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to acknowledge alert'
        )
      }

      // Update UI using saved database response
      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === id ? result.data : alert
        )
      )
    } catch (err) {
      console.error('Alert update error:', err)
      setError(err.message || 'Unable to update alert')
    } finally {
      setUpdatingId(null)
    }
  }

  // Format date
  function formatDate(date) {
    if (!date) return 'Not available'

    return new Date(date).toLocaleString('en-IN')
  }

  return (
    <div className="admin-page">
      <h1>Emergency Alerts</h1>

      <p>
        Review warnings generated from risk predictions
        and verified field reports.
      </p>

      <section>
        <div className="alert-section-header">
          <h2>Current Alerts</h2>

          <button
            type="button"
            onClick={fetchAlerts}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Alerts'}
          </button>
        </div>

        {error && (
          <p className="reports-error">{error}</p>
        )}

        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p>No alerts available.</p>
        ) : (
          <div className="admin-alert-list">
            {alerts.map((alert) => (
              <article
                className={`admin-alert-card ${(alert.risk_level || 'moderate').toLowerCase()}`}
                key={alert.id}
              >
                <div className="admin-alert-content">
                  <span
                    className={`risk-label ${(alert.risk_level || 'moderate').toLowerCase()}`}
                  >
                    {alert.risk_level || 'Unknown'} risk
                  </span>

                  <h3>{alert.title}</h3>

                  <p className="alert-location">
                    {alert.district}
                  </p>

                  <p>{alert.message}</p>

                  <small>
                    Created: {formatDate(alert.created_at)}
                  </small>
                </div>

                <div className="alert-actions">
                  <span className="alert-status">
                    {alert.status || 'Active'}
                  </span>

                  <button
                    type="button"
                    onClick={() => acknowledgeAlert(alert.id)}
                    disabled={
                      alert.status === 'Acknowledged' ||
                      alert.status === 'Resolved' ||
                      updatingId === alert.id
                    }
                  >
                    {updatingId === alert.id
                      ? 'Updating...'
                      : alert.status === 'Acknowledged'
                      ? 'Acknowledged'
                      : alert.status === 'Resolved'
                      ? 'Resolved'
                      : 'Acknowledge'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Alerts
