import { API_BASE_URL } from '../../config/api.js'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const API_URL = `${API_BASE_URL}/reports`

function IncidentDetails() {
  const { id } = useParams()

  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  // Fetch single incident from database
  const fetchIncident = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

      const response = await fetch(
        `${API_URL}/${id}?t=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || 'Unable to fetch incident'
        )
      }

      setIncident(result.data)

    } catch (err) {
      console.error('Fetch incident error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchIncident()
  }, [fetchIncident])

  // Update incident status in database
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

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

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Status update failed')
      }

      setIncident(result.data)

    } catch (err) {
      console.error('Update status error:', err)
      setError(err.message || 'Unable to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="officer-page">
        Loading incident...
      </div>
    )
  }

  if (error && !incident) {
    return (
      <div className="officer-page">
        <h1>Incident Details</h1>
        <p>{error}</p>

        <button type="button" onClick={fetchIncident}>
          Try Again
        </button>
      </div>
    )
  }

  if (!incident) return null

  return (
    <div className="officer-page">
      <h1>Incident Details</h1>
      <p>Incident ID: #{incident.id}</p>

      <section className="incident-detail-card">

        <span
          className={`risk-label ${(incident.severity || 'Moderate').toLowerCase()}`}
        >
          {incident.severity || 'Moderate'} priority
        </span>

        <h2>{incident.incident_type || 'Other'} Report</h2>

        <p className="incident-location">
          {incident.location}
        </p>

        <div className="incident-data-grid">

          <div>
            <span>Incident type</span>
            <strong>{incident.incident_type || 'Other'}</strong>
          </div>

          <div>
            <span>Severity</span>
            <strong>{incident.severity || 'Moderate'}</strong>
          </div>

          <div>
            <span>Current status</span>
            <strong>{incident.status || 'New'}</strong>
          </div>

          <div>
            <span>Reported on</span>
            <strong>
              {incident.created_at
                ? new Date(incident.created_at).toLocaleDateString()
                : 'N/A'}
            </strong>
          </div>

        </div>

        <p className="incident-description">
          {incident.description || 'No additional description provided.'}
        </p>

        {error && (
          <p className="reports-error">{error}</p>
        )}

        <div className="incident-actions">

          <button
            type="button"
            disabled={updating || incident.status === 'Under Review'}
            onClick={() => updateStatus('Under Review')}
          >
            {updating ? 'Updating...' : 'Verify incident'}
          </button>

          <button
            type="button"
            disabled={updating || incident.status === 'Resolved'}
            onClick={() => updateStatus('Resolved')}
          >
            Mark resolved
          </button>

        </div>

        <button
          type="button"
          onClick={fetchIncident}
          disabled={updating}
        >
          Refresh Details
        </button>

      </section>
    </div>
  )
}

export default IncidentDetails
