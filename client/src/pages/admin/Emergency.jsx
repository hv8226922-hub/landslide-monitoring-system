import { useState } from 'react'

const initialIncidents = [
  {
    id: 1,
    priority: 'High',
    title: 'Landslide near Haflong',
    location: 'Dima Hasao, Assam',
    impact: '3 villages affected · NH-27 partially blocked',
    officer: 'Unassigned',
    status: 'Pending assignment',
  },
  {
    id: 2,
    priority: 'Moderate',
    title: 'Road blockage report',
    location: 'East Khasi Hills, Meghalaya',
    impact: '1 village affected · Local road blocked',
    officer: 'Field Officer Rahul',
    status: 'Verification in progress',
  },
]

function Emergency() {
  const [incidents, setIncidents] = useState(initialIncidents)

  function assignOfficer(id) {
    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              officer: 'Field Officer Ankit',
              status: 'Officer assigned',
            }
          : incident,
      ),
    )
  }

  return (
    <>
      <h1>Emergency Response</h1>
      <p>Prioritise critical incidents and assign field response teams.</p>

      <section>
        <h2>Critical incidents</h2>

        <div className="emergency-list">
          {incidents.map((incident) => (
            <article className="emergency-card" key={incident.id}>
              <div className="emergency-priority">
                <span className={`risk-label ${incident.priority.toLowerCase()}`}>
                  Priority: {incident.priority}
                </span>
              </div>

              <div className="emergency-details">
                <h3>{incident.title}</h3>
                <p className="emergency-location">{incident.location}</p>
                <p>{incident.impact}</p>

                <div className="emergency-meta">
                  <span>Officer: {incident.officer}</span>
                  <span>Status: {incident.status}</span>
                </div>
              </div>

              <button type="button" onClick={() => assignOfficer(incident.id)}>
                {incident.officer === 'Unassigned'
                  ? 'Assign officer'
                  : 'Reassign officer'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Emergency