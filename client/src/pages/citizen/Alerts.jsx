import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

const API_URL = `${API_BASE_URL}/alerts`

function CitizenAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchAlerts() {
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
        throw new Error(result.message || 'Could not fetch alerts')
      }

      setAlerts(result.data || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  function formatDate(date) {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleString()
  }

  return (
    <div className="citizen-page">
      <h1>Safety Alerts</h1>
      <p>Current warnings and safety advisories for monitored regions.</p>

      {loading && <p>Loading safety alerts...</p>}

      {error && (
        <div>
          <p>{error}</p>
          <button type="button" onClick={fetchAlerts}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <p>No active alerts available.</p>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="citizen-alert-list">
          {alerts.map((alert) => (
            <article
              className={`citizen-alert-card ${(alert.risk_level || 'Moderate').toLowerCase()}`}
              key={alert.id}
            >
              <span
                className={`risk-label ${(alert.risk_level || 'Moderate').toLowerCase()}`}
              >
                {alert.risk_level} risk
              </span>

              <h2>{alert.title}</h2>
              <strong>{alert.district}</strong>
              <p>{alert.message}</p>
              <small>
                Issued: {formatDate(alert.created_at)}
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CitizenAlerts
