const roads = [
  {
    name: 'NH-27, Haflong section',
    district: 'Dima Hasao, Assam',
    status: 'Partially blocked',
    risk: 'High',
  },
  {
    name: 'Shillong-Mawlynnong Road',
    district: 'East Khasi Hills, Meghalaya',
    status: 'Open with caution',
    risk: 'Moderate',
  },
  {
    name: 'Kohima Bypass',
    district: 'Kohima, Nagaland',
    status: 'Open',
    risk: 'Low',
  },
]

function Roads() {
  return (
    <>
      <h1>Road Monitoring</h1>
      <p>Track critical roads that may be affected by landslides or slope movement.</p>

      <section className="road-grid">
        {roads.map((road) => (
          <article className="road-card" key={road.name}>
            <span className={`risk-label ${road.risk.toLowerCase()}`}>
              {road.risk} risk
            </span>

            <h2>{road.name}</h2>
            <p>{road.district}</p>

            <div>
              <span>Current status</span>
              <strong>{road.status}</strong>
            </div>

            <button type="button">View on map</button>
          </article>
        ))}
      </section>
    </>
  )
}

export default Roads