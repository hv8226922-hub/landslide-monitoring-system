
function LocationCard({ district, name, state, risk, score, rainfall, status }) {
  const locationName = district || name || 'Unknown Location'
  const riskLevel = (risk || 'Moderate').toLowerCase()

  const riskIcons = {
    low: '🟢',
    moderate: '🟡',
    high: '🟠',
    critical: '🔴',
  }

  return (
    <article className={`location-card location-${riskLevel}`}>
      <div className="location-card-header">
        <div className="location-icon">📍</div>

        <span className={`risk-label ${riskLevel}`}>
          {risk || 'Moderate'} Risk
        </span>
      </div>

      <div className="location-card-info">
        <h3>{locationName}</h3>

        {state && <p className="location-state">{state}</p>}

        {rainfall && (
          <p className="location-rainfall">
            <span>🌧️</span> {rainfall}
          </p>
        )}
      </div>

      <div className="location-score-section">
        <div className="location-score-heading">
          <span>Risk Score</span>
          <strong>{score ?? '—'}{score != null ? '/100' : ''}</strong>
        </div>

        <div
          className="location-score-track"
          role="progressbar"
          aria-label="Risk score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            score == null ? undefined : Math.min(100, Math.max(0, score))
          }
        >
          <div
            className={`location-score-fill ${riskLevel}`}
            style={{
              width: `${score == null ? 0 : Math.min(100, Math.max(0, score))}%`,
            }}
          />
        </div>
      </div>

      {status && (
        <div className="location-card-footer">
          <span>{riskIcons[riskLevel] || '⚪'}</span>
          <span>{status}</span>
        </div>
      )}
    </article>
  )
}

export default LocationCard
