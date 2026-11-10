const assets = [
  {
    name: 'Haflong District Hospital',
    type: 'Hospital',
    location: 'Dima Hasao, Assam',
    risk: 'Moderate',
    status: 'Operational',
  },
  {
    name: 'NH-27 Bridge',
    type: 'Bridge',
    location: 'Haflong, Assam',
    risk: 'High',
    status: 'Inspection required',
  },
  {
    name: 'Shillong Power Substation',
    type: 'Power infrastructure',
    location: 'East Khasi Hills, Meghalaya',
    risk: 'Low',
    status: 'Operational',
  },
]

function Infrastructure() {
  return (
    <>
      <h1>Critical Infrastructure</h1>
      <p>Monitor public assets that may be affected by landslide risk.</p>

      <section className="infrastructure-grid">
        {assets.map((asset) => (
          <article className="infrastructure-card" key={asset.name}>
            <div className="infrastructure-card-top">
              <span>{asset.type}</span>
              <span className={`risk-label ${asset.risk.toLowerCase()}`}>
                {asset.risk} risk
              </span>
            </div>

            <h2>{asset.name}</h2>
            <p>{asset.location}</p>

            <div className="infrastructure-status">
              <span>Current status</span>
              <strong>{asset.status}</strong>
            </div>

            <button type="button">View on map</button>
          </article>
        ))}
      </section>
    </>
  )
}

export default Infrastructure