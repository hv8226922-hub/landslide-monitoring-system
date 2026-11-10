function MetricCard({ title, value, note }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{title}</p>
      <h2 className="metric-value">{value}</h2>
      <p className="metric-note">{note}</p>
    </article>
  )
}

export default MetricCard