
function LocationCard({ district, name, state, risk, score, rainfall, status }) {
  const locationName = district || name || 'Unknown Location'

  return (
    <article className="location-card">
      <div>
        <h3>{locationName}</h3>
        {state && <p>{state}</p>}
        {rainfall && <p>{rainfall}</p>}
        {status && <p>{status}</p>}
      </div>

      <div>
        <strong>{score ?? '—'}{score != null ? '/100' : ''}</strong>
        <p>Risk score</p>
      </div>

      <span className={`risk-label ${(risk || 'Moderate').toLowerCase()}`}>
        {risk || 'Moderate'} risk
      </span>
    </article>
  )
}

export default LocationCard
