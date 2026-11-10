
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
  return (
    <article className={`alert-card ${level.toLowerCase()}`}>
      <div>
        <h3>{title}</h3>
        <p>{location}</p>
        <p>{message}</p>

        {onStatusChange && (
          <div className="report-status">
            <label>
              Report Status:

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

            {updating && <span>Updating...</span>}
          </div>
        )}
      </div>

      <span>{time}</span>
    </article>
  )
}

export default AlertCard
