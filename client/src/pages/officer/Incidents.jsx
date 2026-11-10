import { Link } from 'react-router-dom'

const incidents = [
  {
    id: 1,
    title: 'Landslide near Haflong',
    location: 'Dima Hasao, Assam',
    priority: 'High',
    status: 'Pending verification',
  },
  {
    id: 2,
    title: 'Road blockage report',
    location: 'East Khasi Hills, Meghalaya',
    priority: 'Moderate',
    status: 'Officer assigned',
  },
  {
    id: 3,
    title: 'Rockfall near bypass',
    location: 'Kohima, Nagaland',
    priority: 'Low',
    status: 'Monitoring',
  },
]

function Incidents() {
  return (
    <div className="officer-page">
      <h1>Assigned Incidents</h1>
      <p>Open an incident to verify conditions and update its status.</p>

      <div className="officer-incident-list">
        {incidents.map((incident) => (
          <article className="officer-incident-card" key={incident.id}>
            <div>
              <span className={`risk-label ${incident.priority.toLowerCase()}`}>
                {incident.priority} priority
              </span>

              <h2>{incident.title}</h2>
              <p>{incident.location}</p>
              <small>{incident.status}</small>
            </div>

            <Link to={`/officer/incidents/${incident.id}`}>Open</Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Incidents