
import { useCallback, useEffect, useState } from 'react'
import RainfallChart from '../../components/RainfallChart.jsx'

const API_URL = 'http://127.0.0.1:5000/api/weather'

const initialForm = {
  district: '',
  rainfall_24h: '',
  humidity: '',
  temperature: '',
}

function Weather() {
  const [weather, setWeather] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Fetch Weather Records
  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch weather records')
      }

      setWeather(result.data || [])
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Add Weather Record
  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to add weather record')
      }

      setMessage('Weather record added successfully!')
      setForm(initialForm)

      await fetchWeather()
    } catch (err) {
      console.error('Add weather error:', err)
      setError(err.message || 'Unable to add weather record')
    } finally {
      setSaving(false)
    }
  }

  // Delete Weather Record
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this weather record?'
    )

    if (!confirmed) return

    try {
      setDeletingId(id)
      setMessage('')
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete weather record')
      }

      setMessage('Weather record deleted successfully!')
      await fetchWeather()
    } catch (err) {
      console.error('Delete weather error:', err)
      setError(err.message || 'Unable to delete weather record')
    } finally {
      setDeletingId(null)
    }
  }

  const latestWeather = weather[0]

  const average = (field) => {
    const values = weather
      .map((item) => Number(item[field]))
      .filter(Number.isFinite)

    if (values.length === 0) return 'N/A'

    return (
      values.reduce((total, value) => total + value, 0) /
      values.length
    ).toFixed(1)
  }

  const weatherStats = [
    {
      label: 'Latest Rainfall (24h)',
      value: latestWeather
        ? `${latestWeather.rainfall_24h} mm`
        : 'N/A',
      note: latestWeather
        ? `District: ${latestWeather.district}`
        : 'No records available',
    },
    {
      label: 'Average Humidity',
      value: `${average('humidity')}${weather.length ? '%' : ''}`,
      note: 'Average of available records',
    },
    {
      label: 'Average Temperature',
      value: `${average('temperature')}${weather.length ? '°C' : ''}`,
      note: 'Average of available records',
    },
    {
      label: 'Districts Monitored',
      value: new Set(weather.map((item) => item.district)).size,
      note: 'Districts with stored weather records',
    },
  ]

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-IN')
  }

  return (
    <>
      <h1>Weather Monitoring</h1>

      <p>
        Rainfall and environmental conditions for monitored districts.
      </p>

      <button
        type="button"
        onClick={fetchWeather}
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Weather'}
      </button>

      {error && (
        <p className="reports-error">{error}</p>
      )}

      {message && (
        <p className="success-message">{message}</p>
      )}

      {/* Weather Statistics */}
      <section className="weather-grid">
        {weatherStats.map((stat) => (
          <article className="weather-stat" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      {/* Add Weather Record */}
      {/* Add Weather Record */}
<section className="assigned-incident weather-form-section">
        <h2>Add Weather Record</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="district">District</label>
            <input
              id="district"
              type="text"
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="Enter district name"
              required
            />
          </div>

          <div>
            <label htmlFor="rainfall_24h">Rainfall (24h) in mm</label>
            <input
              id="rainfall_24h"
              type="number"
              name="rainfall_24h"
              value={form.rainfall_24h}
              onChange={handleChange}
              placeholder="Enter rainfall"
              min="0"
              step="any"
              required
            />
          </div>

          <div>
            <label htmlFor="humidity">Humidity (%)</label>
            <input
              id="humidity"
              type="number"
              name="humidity"
              value={form.humidity}
              onChange={handleChange}
              placeholder="Enter humidity"
              min="0"
              max="100"
              step="any"
            />
          </div>

          <div>
            <label htmlFor="temperature">Temperature (°C)</label>
            <input
              id="temperature"
              type="number"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              placeholder="Enter temperature"
              step="any"
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add Weather Record'}
          </button>
        </form>
      </section>

      {/* Rainfall Chart */}
      <section>
        <RainfallChart />
      </section>

      {/* District Weather Records */}
      <section className="weather-records-section">
        <h2>District Weather Records</h2>

        {loading ? (
          <p>Loading weather records...</p>
        ) : weather.length === 0 ? (
          <p>No weather records available yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Rainfall (24h)</th>
                  <th>Humidity</th>
                  <th>Temperature</th>
                  <th>Recorded At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {weather.map((item) => (
                  <tr key={item.id}>
                    <td>{item.district}</td>
                    <td>{item.rainfall_24h} mm</td>
                    <td>{item.humidity ?? 'N/A'}%</td>
                    <td>{item.temperature ?? 'N/A'}°C</td>
                    <td>{formatDate(item.recorded_at)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default Weather
