const villages = [
  {
    name: 'Haflong Village',
    district: 'Dima Hasao, Assam',
    population: '1,240',
    road: 'Partially blocked',
    risk: 'High',
  },
  {
    name: 'Mawlynnong',
    district: 'East Khasi Hills, Meghalaya',
    population: '980',
    road: 'Open with caution',
    risk: 'Moderate',
  },
  {
    name: 'Jakhama',
    district: 'Kohima, Nagaland',
    population: '1,460',
    road: 'Open',
    risk: 'Low',
  },
]

function Villages() {
  return (
    <>
      <h1>Vulnerable Villages</h1>
      <p>View vulnerable communities and their latest evacuation risk information.</p>

      <section className="village-grid">
        {villages.map((village) => (
          <article className="village-card" key={village.name}>
            <div className="village-card-top">
              <div>
                <h2>{village.name}</h2>
                <p>{village.district}</p>
              </div>

              <span className={`risk-label ${village.risk.toLowerCase()}`}>
                {village.risk}
              </span>
            </div>

            <div className="village-details">
              <span>Population <strong>{village.population}</strong></span>
              <span>Road <strong>{village.road}</strong></span>
            </div>

            <button type="button">View on map</button>
          </article>
        ))}
      </section>
    </>
  )
}

export default Villages