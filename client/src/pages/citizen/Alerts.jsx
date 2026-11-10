const alerts = [
  {
    level: 'High',
    title: 'Heavy rainfall warning',
    location: 'Dima Hasao, Assam',
    message:
      'Avoid mountain roads and steep slopes until the rainfall intensity decreases.',
    issued: 'Issued 30 minutes ago',
  },
  {
    level: 'Moderate',
    title: 'Slope movement watch',
    location: 'East Khasi Hills, Meghalaya',
    message:
      'Stay alert for cracks, falling rocks, or changes near hillside roads.',
    issued: 'Issued 2 hours ago',
  },
]

function CitizenAlerts() {
  return (
    <div className="citizen-page">
      <h1>Safety Alerts</h1>
      <p>Current warnings and safety advisories for monitored regions.</p>

      <div className="citizen-alert-list">
        {alerts.map((alert) => (
          <article
            className={`citizen-alert-card ${alert.level.toLowerCase()}`}
            key={alert.title}
          >
            <span className={`risk-label ${alert.level.toLowerCase()}`}>
              {alert.level} risk
            </span>

            <h2>{alert.title}</h2>
            <strong>{alert.location}</strong>
            <p>{alert.message}</p>
            <small>{alert.issued}</small>
          </article>
        ))}
      </div>
    </div>
  )
}

export default CitizenAlerts