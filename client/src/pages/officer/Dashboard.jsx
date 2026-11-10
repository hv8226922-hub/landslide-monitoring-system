import { Link } from 'react-router-dom'

const stats = [
  { label: 'Assigned incidents', value: '08' },
  { label: 'Pending verification', value: '03' },
  { label: 'High priority', value: '02' },
  { label: 'Resolved today', value: '04' },
]

function OfficerDashboard() {
  return (
    <div className="officer-page">
      <h1>Field Officer Dashboard</h1>
      <p>Review assigned incidents and update field verification status.</p>

      <section className="officer-stat-grid">
        {stats.map((stat) => (
          <article className="officer-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="assigned-incident">
        <div>
          <span className="risk-label high">High priority</span>
          <h2>Landslide near Haflong</h2>
          <p>Dima Hasao, Assam · NH-27 partially blocked</p>
        </div>

        <Link to="/officer/incidents/1">Open incident</Link>
      </section>
    </div>
  )
}

export default OfficerDashboard