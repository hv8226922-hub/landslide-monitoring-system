import { useState } from 'react'
import { useParams } from 'react-router-dom'

function IncidentDetails() {
  const { id } = useParams()
  const [status, setStatus] = useState('Pending verification')

  return (
    <div className="officer-page">
      <h1>Incident Details</h1>
      <p>Incident ID: #{id}</p>

      <section className="incident-detail-card">
        <span className="risk-label high">High priority</span>

        <h2>Landslide near Haflong</h2>
        <p className="incident-location">Dima Hasao, Assam · NH-27</p>

        <div className="incident-data-grid">
          <div>
            <span>Risk level</span>
            <strong>High</strong>
          </div>

          <div>
            <span>Rainfall (24h)</span>
            <strong>84 mm</strong>
          </div>

          <div>
            <span>Soil moisture</span>
            <strong>71%</strong>
          </div>

          <div>
            <span>Current status</span>
            <strong>{status}</strong>
          </div>
        </div>

        <p className="incident-description">
          Citizen report: road debris and a visible slope crack have been reported.
          Verify the location and update the emergency team.
        </p>

        <div className="incident-actions">
          <button type="button" onClick={() => setStatus('Verified')}>
            Verify incident
          </button>

          <button type="button" onClick={() => setStatus('Road blocked')}>
            Mark road blocked
          </button>

          <button type="button" onClick={() => setStatus('Resolved')}>
            Mark resolved
          </button>
        </div>
      </section>
    </div>
  )
}

export default IncidentDetails