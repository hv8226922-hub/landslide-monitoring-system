function LocationCard({ district, state, risk, score }) {
  return (
    <article className="location-card">
      <div>
        <h3>{district}</h3>
        <p>{state}</p>
      </div>

      <div>
        <strong>{score}/100</strong>
        <p>Risk score</p>
      </div>

      <span className={`risk-label ${risk.toLowerCase()}`}>
        {risk} risk
      </span>
    </article>
  )
}

export default LocationCard