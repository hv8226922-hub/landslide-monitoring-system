
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:5000/api'

function OfficerDashboard() {
  const [incidents, setIncidents] = useState([])
  const [weather, setWeather] = useState([])
  const [riskData, setRiskData] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weatherError, setWeatherError] = useState('')
  const [riskError, setRiskError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError('')
    setWeatherError('')
    setRiskError('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

      const fetchData = async (endpoint) => {
        const response = await fetch(
          `${API_URL}/${endpoint}?t=${Date.now()}`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || `Unable to fetch ${endpoint}`
          )
        }

        return Array.isArray(result.data) ? result.data : []
      }

      // Fetch incidents
      try {
        const data = await fetchData('reports')
        setIncidents(data)
      } catch (err) {
        console.error('Incident fetch error:', err)
        setError(err.message)
      }

      // Fetch weather
      try {
        const data = await fetchData('weather')
        setWeather(data)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setWeatherError(err.message)
      }

      // Fetch risk predictions
      try {
        const data = await fetchData('risk')
        setRiskData(data)
      } catch (err) {
        console.error('Risk fetch error:', err)
        setRiskError(err.message)
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Incident statistics
  const pendingCount = incidents.filter(
    (item) => (item.status || 'New') === 'New'
  ).length

  const highPriorityCount = incidents.filter(
    (item) =>
      (item.severity || '').toLowerCase() === 'high' &&
      item.status !== 'Resolved'
  ).length

  const resolvedCount = incidents.filter(
    (item) => item.status === 'Resolved'
  ).length

  const stats = [
    {
      label: 'Total reported incidents',
      value: incidents.length,
    },
    {
      label: 'Pending verification',
      value: pendingCount,
    },
    {
      label: 'High priority',
      value: highPriorityCount,
    },
    {
      label: 'Resolved',
      value: resolvedCount,
    },
  ]

  const latestIncident = incidents[0]
  const latestWeather = weather[0]

  const formatDate = (date) => {
    if (!date) return 'Not available'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available'
    }

    return parsedDate.toLocaleString()
  }

  const formatNumber = (value, digits = 1) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A'
    }

    const number = Number(value)

    return Number.isFinite(number)
      ? number.toFixed(digits)
      : 'N/A'
  }

  return (
    <div className="officer-page">

      {/* Dashboard Header */}
      <div className="officer-header">
        <div>
          <span className="officer-eyebrow">
            TERRAWATCH FIELD OPERATIONS
          </span>

          <h1>Field Officer Dashboard</h1>

          <p>
            Monitor incidents, weather conditions and landslide
            risk records.
          </p>
        </div>

        <button
          type="button"
          className="officer-refresh-btn"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh Dashboard'}
        </button>
      </div>

      {/* Incident Error */}
      {error && (
        <p className="reports-error">{error}</p>
      )}

      {/* Statistics */}
      <section className="officer-stat-grid">
        {stats.map((stat) => (
          <article
            className="officer-stat-card"
            key={stat.label}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      {/* Latest Incident */}
    <section className="assigned-incident">
        <h2>Latest Incident</h2>

        {loading ? (
          <p>Loading incidents...</p>
        ) : latestIncident ? (
          <div className="officer-incident-content">

            <span
              className={`risk-label ${
                (latestIncident.severity || 'Moderate').toLowerCase()
              }`}
            >
              {latestIncident.severity || 'Moderate'} priority
            </span>

            <h3>
              {latestIncident.incident_type || 'Other'} Report
            </h3>

            <p>
              <strong>Location:</strong>{' '}
              {latestIncident.location || 'Not available'}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              {latestIncident.status || 'New'}
            </p>

            <p>
              {latestIncident.description || 'No description available.'}
            </p>

            <Link
              to={`/officer/incidents/${latestIncident.id}`}
            >
              Open incident →
            </Link>
          </div>
        ) : (
          <p>No incidents reported yet.</p>
        )}
      </section>

      {/* Weather Monitoring */}
<section className="assigned-incident officer-weather-section">
      
        <h2>Weather Monitoring</h2>

        {weatherError && (
          <p className="reports-error">{weatherError}</p>
        )}

        {loading ? (
          <p>Loading weather records...</p>
        ) : weather.length > 0 ? (
          <>
            <div className="officer-weather-summary">
              <p>
                Latest weather record:{' '}
                <strong>
                  {latestWeather.district || 'Not available'}
                </strong>
              </p>

              <div className="officer-stat-grid">
                <article className="officer-stat-card">
                  <span>Rainfall (24 hours)</span>
                  <strong>
                    {formatNumber(latestWeather.rainfall_24h, 2)} mm
                  </strong>
                </article>

                <article className="officer-stat-card">
                  <span>Humidity</span>
                  <strong>
                    {formatNumber(latestWeather.humidity, 2)}%
                  </strong>
                </article>

                <article className="officer-stat-card">
                  <span>Temperature</span>
                  <strong>
                    {formatNumber(latestWeather.temperature, 2)}°C
                  </strong>
                </article>
              </div>

              <p className="officer-recorded-date">
                Recorded at: {formatDate(latestWeather.recorded_at)}
              </p>
            </div>

            <h3>District Weather Records</h3>

            <div className="officer-weather-list">
              {weather.map((item) => (
                <article
                  className="officer-stat-card"
                  key={item.id}
                >
                  <strong>{item.district || 'Unknown District'}</strong>

                  <p>
                    Rainfall: {formatNumber(item.rainfall_24h, 2)} mm
                  </p>

                  <p>
                    Humidity: {formatNumber(item.humidity, 2)}%
                  </p>

                  <p>
                    Temperature: {formatNumber(item.temperature, 2)}°C
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p>No weather records available.</p>
        )}
      </section>

      {/* Landslide Risk Monitoring */}
      <section className="assigned-incident">
        <h2>Landslide Risk Monitoring</h2>

        {riskError && (
          <p className="reports-error">{riskError}</p>
        )}

        {loading ? (
          <p>Loading risk predictions...</p>
        ) : riskData.length > 0 ? (
          <div className="officer-risk-grid">
            {riskData.map((item) => {
              const riskLevel = (
                item.risk_level || 'Unknown'
              ).toLowerCase()

              return (
                <article
                  className="officer-stat-card"
                  key={item.id}
                >
                  <span className={`risk-label ${riskLevel}`}>
                    {item.risk_level || 'Unknown'} Risk
                  </span>

                  <h3>{item.district || 'Unknown District'}</h3>

                  <p>
                    Risk Probability:{' '}
                    {formatNumber(
                      Number(item.probability) * 100
                    )}%
                  </p>

                  <p>
                    Rainfall: {formatNumber(item.rainfall_24h, 2)} mm
                  </p>

                  <p>
                    Soil Moisture: {formatNumber(item.soil_moisture, 2)}%
                  </p>

                  <p>
                    Slope: {formatNumber(item.slope, 2)}°
                  </p>

                  <p>
                    Predicted at: {formatDate(item.predicted_at)}
                  </p>
                </article>
              )
            })}
          </div>
        ) : (
          <p>No risk predictions available.</p>
        )}
      </section>

      {/* Data Information */}
      <p className="officer-data-note">
        Data shown here is retrieved from stored database records.
        Automatic live weather updates and ML predictions are not
        yet verified.
      </p>

    </div>
  )
}

export default OfficerDashboard
