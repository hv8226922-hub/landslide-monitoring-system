import RainfallChart from '../../components/RainfallChart.jsx'

const weatherStats = [
  { label: 'Rainfall (24h)', value: '96.4 mm', note: 'Heavy rainfall watch active' },
  { label: 'Humidity', value: '82%', note: 'High soil saturation risk' },
  { label: 'Temperature', value: '23°C', note: 'Current regional average' },
  { label: 'Wind speed', value: '14 km/h', note: 'Moderate wind conditions' },
]

const forecast = [
  { day: 'Today', condition: 'Heavy rain', rainfall: '96 mm', risk: 'High' },
  { day: 'Tomorrow', condition: 'Moderate rain', rainfall: '62 mm', risk: 'Moderate' },
  { day: 'Day after tomorrow', condition: 'Light rain', rainfall: '28 mm', risk: 'Low' },
]

function Weather() {
  return (
    <>
      <h1>Weather Monitoring</h1>
      <p>Rainfall and environmental conditions for monitored districts.</p>

      <section className="weather-grid">
        {weatherStats.map((stat) => (
          <article className="weather-stat" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section>
        <RainfallChart />
      </section>

      <section>
        <h2>3-day forecast</h2>

        <div className="forecast-grid">
          {forecast.map((item) => (
            <article className="forecast-card" key={item.day}>
              <p>{item.day}</p>
              <h3>{item.condition}</h3>
              <strong>{item.rainfall}</strong>
              <span className={`risk-label ${item.risk.toLowerCase()}`}>
                {item.risk} risk
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Weather