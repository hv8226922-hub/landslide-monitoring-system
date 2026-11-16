
import { useCallback, useEffect, useState } from 'react'
import RiskMapView from '../../components/RiskMap.jsx'

const API_URL = 'http://127.0.0.1:5000/api/risk'

const initialForm = {
  district: '',
  probability: '',
  risk_level: 'Moderate',
  rainfall_24h: '',
  soil_moisture: '',
  slope: '',
}

function RiskMapPage() {
  const [risks, setRisks] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch risk records')
      }

      setRisks(result.data || [])
    } catch (err) {
      console.error('Risk fetch error:', err)
      setError(err.message || 'Unable to fetch risk records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRisks()
  }, [fetchRisks])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Add Risk Record
  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const probability = Number(form.probability)

      if (probability < 0 || probability > 100) {
        throw new Error('Probability must be between 0 and 100%.')
      }

      const payload = {
        district: form.district.trim(),
        probability: probability / 100,
        risk_level: form.risk_level,
        rainfall_24h: form.rainfall_24h === ''
          ? null
          : Number(form.rainfall_24h),
        soil_moisture: form.soil_moisture === ''
          ? null
          : Number(form.soil_moisture),
        slope: form.slope === ''
          ? null
          : Number(form.slope),
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to add risk prediction')
      }

      setMessage('Risk record added successfully!')
      setForm(initialForm)

      await fetchRisks()
    } catch (err) {
      console.error('Add risk error:', err)
      setError(err.message || 'Unable to add risk record')
    } finally {
      setSaving(false)
    }
  }

  // Delete Risk Record
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this risk record?'
    )

    if (!confirmed) return

    try {
      setDeletingId(id)
      setError('')
      setMessage('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete risk record')
      }

      setMessage('Risk record deleted successfully!')

      await fetchRisks()
    } catch (err) {
      console.error('Delete risk error:', err)
      setError(err.message || 'Unable to delete risk record')
    } finally {
      setDeletingId(null)
    }
  }

  const totalZones = risks.length

  const highRiskZones = risks.filter(
    (item) => ['High', 'Critical'].includes(item.risk_level)
  ).length

  const averageProbability = totalZones
    ? (
        risks.reduce(
          (total, item) => total + Number(item.probability),
          0
        ) / totalZones * 100
      ).toFixed(1)
    : '0.0'

  const monitoredDistricts = new Set(
    risks.map((item) => item.district)
  ).size

  const stats = [
    {
      label: 'Total Predictions',
      value: totalZones,
      note: 'Stored risk records',
      icon: '📊',
    },
    {
      label: 'High / Critical Zones',
      value: highRiskZones,
      note: 'Zones requiring attention',
      icon: '⚠️',
    },
    {
      label: 'Average Probability',
      value: `${averageProbability}%`,
      note: 'Across available records',
      icon: '📈',
    },
    {
      label: 'Districts Monitored',
      value: monitoredDistricts,
      note: 'Districts with risk records',
      icon: '📍',
    },
  ]

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-IN')
  }

  return (
    <div className="risk-dashboard">
      <div className="risk-page-header">
        <div>
          <span className="risk-eyebrow">TERRAWATCH / ADMIN</span>
          <h1>Risk Monitoring</h1>
          <p>
            Monitor stored landslide risk records across monitored districts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRisks}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh Data'}
        </button>
      </div>

      {error && <p className="reports-error">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {/* Summary Cards */}
      <section className="risk-stats-grid">
        {stats.map((stat) => (
          <article className="risk-stat-card" key={stat.label}>
            <div className="risk-stat-top">
              <span>{stat.label}</span>
              <span className="risk-stat-icon">{stat.icon}</span>
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      {/* Risk Map */}
      <section className="risk-section">
        <div className="risk-section-heading">
          <div>
            <h2>Geographical Risk Overview</h2>
            <p>Locations with configured district coordinates</p>
          </div>
          <span className="risk-live-label">DATABASE RECORDS</span>
        </div>

        <RiskMapView />
      </section>

      {/* Add Risk Record */}
      <section className="risk-section risk-form-section">
        <div className="risk-section-heading">
          <div>
            <h2>Add Risk Record</h2>
            <p>Enter a risk record to store in TerraWatch</p>
          </div>
        </div>

        <form className="risk-form" onSubmit={handleSubmit}>
          <div className="risk-form-grid">
            <div>
              <label htmlFor="risk-district">District</label>
              <input
                id="risk-district"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Enter district name"
                required
              />
            </div>

            <div>
              <label htmlFor="risk-probability">
                Risk Probability (%)
              </label>
              <input
                id="risk-probability"
                name="probability"
                type="number"
                min="0"
                max="100"
                step="any"
                value={form.probability}
                onChange={handleChange}
                placeholder="Example: 85"
                required
              />
            </div>

            <div>
              <label htmlFor="risk-level">Risk Level</label>
              <select
                id="risk-level"
                name="risk_level"
                value={form.risk_level}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="risk-rainfall">Rainfall (24h in mm)</label>
              <input
                id="risk-rainfall"
                name="rainfall_24h"
                type="number"
                min="0"
                step="any"
                value={form.rainfall_24h}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="risk-moisture">Soil Moisture (%)</label>
              <input
                id="risk-moisture"
                name="soil_moisture"
                type="number"
                min="0"
                max="100"
                step="any"
                value={form.soil_moisture}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="risk-slope">Slope (degrees)</label>
              <input
                id="risk-slope"
                name="slope"
                type="number"
                min="0"
                max="90"
                step="any"
                value={form.slope}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : '+ Add Risk Record'}
          </button>
        </form>
      </section>

      {/* Risk Records Table */}
      <section className="risk-section">
        <div className="risk-section-heading">
          <div>
            <h2>District Risk Records</h2>
            <p>Risk information retrieved from the database</p>
          </div>
          <span className="risk-record-count">
            {totalZones} Records
          </span>
        </div>

        {loading ? (
          <p>Loading risk records...</p>
        ) : risks.length === 0 ? (
          <p>No risk records available yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Risk Level</th>
                  <th>Probability</th>
                  <th>Rainfall</th>
                  <th>Soil Moisture</th>
                  <th>Slope</th>
                  <th>Predicted At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {risks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.district}</td>
                    <td>
                      <span className={`risk-level-badge ${item.risk_level?.toLowerCase()}`}>
                        {item.risk_level}
                      </span>
                    </td>
                    <td>
                      {(Number(item.probability) * 100).toFixed(1)}%
                    </td>
                    <td>{item.rainfall_24h ?? 'N/A'} mm</td>
                    <td>{item.soil_moisture ?? 'N/A'}%</td>
                    <td>{item.slope ?? 'N/A'}°</td>
                    <td>{formatDate(item.predicted_at)}</td>
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

      <p className="risk-data-note">
        Note: These are stored risk records. Automatic AI/ML predictions
        and live sensor updates are not yet verified.
      </p>
    </div>
  )
}

export default RiskMapPage
