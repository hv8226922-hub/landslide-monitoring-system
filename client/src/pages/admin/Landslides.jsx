import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

const API_URL = `${API_BASE_URL}/reports`

function Landslides() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchEvents() {
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

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch reports')
        }

        setEvents(result.data || [])
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  function formatDate(date) {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <>
        <h1>Landslide Events</h1>
        <p>Loading incident records...</p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <h1>Landslide Events</h1>
        <p role="alert" style={{ color: '#d9534f' }}>
          {error}
        </p>
      </>
    )
  }

  return (
    <>
      <h1>Landslide Events</h1>
      <p>Citizen-reported incidents across monitored regions.</p>

      <section>
        <h2>Incident records ({events.length})</h2>

        <div className="event-list">
          {events.length > 0 ? (
            events.map((event) => {
              const severity = (event.severity || 'Moderate').toLowerCase()

              return (
                <article className="event-card" key={event.id}>
                  <div>
                    <h3>{event.location || 'Unknown location'}</h3>

                    <p>
                      {formatDate(event.created_at)}
                      {' · '}
                      Type: {event.incident_type || 'Not specified'}
                    </p>

                    {event.description && (
                      <p>{event.description}</p>
                    )}
                  </div>

                  <span className={`risk-label ${severity}`}>
                    {event.severity || 'Moderate'}
                  </span>

                  <span className="event-status">
                    {event.status || 'New'}
                  </span>
                </article>
              )
            })
          ) : (
            <p>No incident reports available yet.</p>
          )}
        </div>
      </section>
    </>
  )
}

export default Landslides
