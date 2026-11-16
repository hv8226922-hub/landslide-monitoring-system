
function AlertCard({
  title,
  location,
  message,
  time,
  level = 'Moderate',
  status,
  onStatusChange,
  updating = false,
}) {
  const alertLevel = level.toLowerCase()

  const levelIcons = {
    low: '🟢',
    moderate: '🟡',
    high: '🟠',
    critical: '🔴',
  }

  return (
    <article className={`alert-card alert-${alertLevel}`}>
      <div className="alert-card-main">
        <div className="alert-card-header">
          <div className="alert-icon">
            {levelIcons[alertLevel] || '🔔'}
          </div>

          <span className={`alert-level-badge ${alertLevel}`}>
            {level} Risk
          </span>
        </div>

        <div className="alert-card-content">
          <h3>{title}</h3>

          <p className="alert-location">
            📍 {location}
          </p>

          <p className="alert-message">{message}</p>
        </div>

        {onStatusChange && (
          <div className="report-status">
            <label>
              Report Status

              <select
                value={status || 'New'}
                onChange={(event) =>
                  onStatusChange(event.target.value)
                }
                disabled={updating}
              >
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </label>

            {updating && (
              <span className="alert-updating">Updating...</span>
            )}
          </div>
        )}
      </div>

      <div className="alert-card-footer">
        <span>🕒 {time || 'Time unavailable'}</span>

        {status && (
          <span className={`alert-status-badge ${status.toLowerCase().replaceAll(' ', '-')}`}>
            {status}
          </span>
        )}
      </div>
    </article>
  )
}

export default AlertCard
