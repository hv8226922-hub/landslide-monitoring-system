
function MetricCard({ title, value, note }) {
  const getMetricIcon = () => {
    const icons = {
      'Total Reports': '📋',
      'New Reports': '🆕',
      'Under Review': '🔍',
      'Resolved Reports': '✅',
    }

    return icons[title] || '📊'
  }

  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <div>
          <p className="metric-label">{title}</p>
          <h2 className="metric-value">{value}</h2>
        </div>

        <div className="metric-icon" aria-hidden="true">
          {getMetricIcon()}
        </div>
      </div>

      <div className="metric-card-footer">
        <span className="metric-indicator"></span>
        <p className="metric-note">{note}</p>
      </div>
    </article>
  )
}

export default MetricCard
