
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/risk'

function Predictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again.')
      }

      const response = await fetch(
        `${API_URL}?t=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Could not fetch predictions'
        )
      }

      setPredictions(
        Array.isArray(result.data) ? result.data : []
      )
    } catch (err) {
      console.error('Predictions fetch error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  function formatValue(value, unit = '') {
    if (value === null || value === undefined) return 'N/A'

    const number = Number(value)

    if (!Number.isFinite(number)) return 'N/A'

    return `${number}${unit}`
  }

  function formatProbability(value) {
    if (value === null || value === undefined) return 'N/A'

    const number = Number(value)

    if (!Number.isFinite(number)) return 'N/A'

    return `${(number * 100).toFixed(2)}%`
  }

  return (
    <div className="admin-page">
      <h1>Landslide Predictions</h1>

      <p>
        Risk prediction records stored from rainfall, terrain, and soil data.
      </p>

      <section>
        <div className="alert-section-header">
          <h2>Current prediction results ({predictions.length})</h2>

          <button
            type="button"
            onClick={fetchPredictions}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Predictions'}
          </button>
        </div>

        {loading && <p>Loading predictions...</p>}

        {error && (
          <div className="reports-error">
            <p>{error}</p>
            <button type="button" onClick={fetchPredictions}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && predictions.length === 0 && (
          <p>No prediction records available.</p>
        )}

        {!loading && !error && predictions.length > 0 && (
          <div className="prediction-list">
            {predictions.map((prediction) => (
              <article className="prediction-card" key={prediction.id}>
                <div>
                  <h3>{prediction.district}</h3>

                  <p>
                    Rainfall: {formatValue(prediction.rainfall_24h, ' mm')}
                    {' · '}
                    Soil moisture: {formatValue(prediction.soil_moisture, '%')}
                    {' · '}
                    Slope: {formatValue(prediction.slope, '°')}
                  </p>

                  <small>
                    Recorded:{' '}
                    {prediction.predicted_at
                      ? new Date(prediction.predicted_at).toLocaleString()
                      : 'Date unavailable'}
                  </small>
                </div>

                <div className="prediction-score">
                  <span>Risk probability</span>
                  <strong>
                    {formatProbability(prediction.probability)}
                  </strong>
                </div>

                <span
                  className={`risk-label ${(prediction.risk_level || 'Moderate').toLowerCase()}`}
                >
                  {prediction.risk_level || 'Unknown'} risk
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Predictions
