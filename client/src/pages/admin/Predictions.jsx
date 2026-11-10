const predictions = [
  {
    location: 'Dima Hasao - Zone A',
    probability: '0.82',
    risk: 'High',
    rainfall: '84 mm',
    soilMoisture: '71%',
    slope: '31°',
  },
  {
    location: 'East Khasi Hills - Zone B',
    probability: '0.67',
    risk: 'High',
    rainfall: '68 mm',
    soilMoisture: '63%',
    slope: '28°',
  },
  {
    location: 'Kohima - Zone C',
    probability: '0.34',
    risk: 'Moderate',
    rainfall: '41 mm',
    soilMoisture: '49%',
    slope: '19°',
  },
  {
    location: 'Jorhat - Zone D',
    probability: '0.12',
    risk: 'Low',
    rainfall: '22 mm',
    soilMoisture: '31%',
    slope: '11°',
  },
]

function Predictions() {
  return (
    <>
      <h1>Landslide Predictions</h1>
      <p>Sample risk predictions generated from rainfall, terrain, and soil data.</p>

      <section>
        <h2>Current prediction results</h2>

        <div className="prediction-list">
          {predictions.map((prediction) => (
            <article className="prediction-card" key={prediction.location}>
              <div>
                <h3>{prediction.location}</h3>
                <p>
                  Rainfall: {prediction.rainfall} · Soil moisture:{' '}
                  {prediction.soilMoisture} · Slope: {prediction.slope}
                </p>
              </div>

              <div className="prediction-score">
                <span>ML probability</span>
                <strong>{prediction.probability}</strong>
              </div>

              <span className={`risk-label ${prediction.risk.toLowerCase()}`}>
                {prediction.risk} risk
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Predictions