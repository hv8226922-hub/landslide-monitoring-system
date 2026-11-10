import { useState } from 'react'

const initialAlerts = [
  {
    id: 1,
    level: 'High',
    title: 'Heavy rainfall warning',
    location: 'Dima Hasao, Assam',
    message: 'Heavy rainfall and high soil moisture have increased landslide risk.',
    affected: '3 villages · 1 critical road',
    status: 'Active',
  },
  {
    id: 2,
    level: 'Moderate',
    title: 'Slope movement watch',
    location: 'East Khasi Hills, Meghalaya',
    message: 'Field report and rainfall conditions require local monitoring.',
    affected: '1 village · 2 local roads',
    status: 'Active',
  },
]

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts)

  function acknowledgeAlert(id) {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id
          ? { ...alert, status: 'Acknowledged' }
          : alert,
      ),
    )
  }

  return (
    <>
      <h1>Emergency Alerts</h1>
      <p>Review warnings generated from risk predictions and verified field reports.</p>

      <section>
        <h2>Current alerts</h2>

        <div className="admin-alert-list">
          {alerts.map((alert) => (
            <article
              className={`admin-alert-card ${alert.level.toLowerCase()}`}
              key={alert.id}
            >
              <div className="admin-alert-content">
                <span className={`risk-label ${alert.level.toLowerCase()}`}>
                  {alert.level} risk
                </span>

                <h3>{alert.title}</h3>
                <p className="alert-location">{alert.location}</p>
                <p>{alert.message}</p>
                <small>Affected: {alert.affected}</small>
              </div>

              <div className="alert-actions">
                <span className="alert-status">{alert.status}</span>
                <button
                  type="button"
                  onClick={() => acknowledgeAlert(alert.id)}
                  disabled={alert.status === 'Acknowledged'}
                >
                  {alert.status === 'Acknowledged'
                    ? 'Acknowledged'
                    : 'Acknowledge'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Alerts