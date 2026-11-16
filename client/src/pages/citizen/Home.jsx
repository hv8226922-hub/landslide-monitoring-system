
import { useEffect, useMemo, useState } from 'react'
import { Bell, Map as MapIcon, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:5000/api/risk'
const STORAGE_KEY = 'selectedCitizenDistrict'

const riskPriority = {
  Low: 1,
  Moderate: 2,
  High: 3,
  Critical: 4,
}

const riskColors = {
  Low: '#16a34a',
  Moderate: '#eab308',
  High: '#f97316',
  Critical: '#dc2626',
  Unavailable: '#64748b',
}

function Home() {
  const [records, setRecords] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ''
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRisk() {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please login again.')
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load risk data')
        }

        setRecords(Array.isArray(result.data) ? result.data : [])
      } catch (err) {
        setError(err.message || 'Unable to load risk data')
      } finally {
        setLoading(false)
      }
    }

    fetchRisk()
  }, [])

  const districts = useMemo(() => {
    return [...new Set(
      records
        .map((record) => record.district)
        .filter(Boolean)
    )].sort()
  }, [records])

  const latestRisk = useMemo(() => {
    if (!selectedDistrict) return null

    return records
      .filter((record) => record.district === selectedDistrict)
      .sort(
        (a, b) =>
          new Date(b.predicted_at) - new Date(a.predicted_at)
      )[0] || null
  }, [records, selectedDistrict])

  function handleDistrictChange(event) {
    const district = event.target.value
    setSelectedDistrict(district)

    if (district) {
      localStorage.setItem(STORAGE_KEY, district)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const riskLevel = latestRisk?.risk_level || 'Unavailable'

  return (
    <div className="citizen-home">
      <section className="citizen-welcome">
        <p>LANDSLIDE SAFETY PORTAL</p>
        <h1>Stay aware. Stay safe.</h1>
        <span>
          Local risk information and safety actions for your area.
        </span>
      </section>

      <section className="citizen-risk-card">
        <div>
          <p>YOUR CURRENT RISK</p>

          <label htmlFor="citizen-district">
            Select your district
          </label>

          <select
            id="citizen-district"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={loading || districts.length === 0}
          >
            <option value="">Choose your district</option>

            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <h2 style={{ color: riskColors[riskLevel] }}>
            {loading ? 'Loading...' : riskLevel.toUpperCase()}
          </h2>

          <span>
            {error
              ? error
              : !selectedDistrict
                ? 'Select your district to view its risk level.'
                : latestRisk
                  ? `${selectedDistrict} · Latest monitored prediction`
                  : `No risk prediction available for ${selectedDistrict}.`}
          </span>

          {latestRisk && !loading && (
            <p>
              Prediction probability:{' '}
              {(Number(latestRisk.probability) * 100).toFixed(1)}%
            </p>
          )}
        </div>

        <ShieldAlert
          size={50}
          color={riskColors[riskLevel]}
        />
      </section>

      <section className="citizen-action-grid">
        <Link to="/citizen/risk-map" className="citizen-action-card">
          <MapIcon size={22} />
          <div>
            <strong>View nearby risk map</strong>
            <span>See monitored risk zones near you.</span>
          </div>
        </Link>

        <Link to="/citizen/report" className="citizen-action-card">
          <ShieldAlert size={22} />
          <div>
            <strong>Report an incident</strong>
            <span>Report road blockage, cracks, or landslides.</span>
          </div>
        </Link>

        <Link to="/citizen/alerts" className="citizen-action-card">
          <Bell size={22} />
          <div>
            <strong>Safety alerts</strong>
            <span>Read current warnings and advisories.</span>
          </div>
        </Link>
      </section>
    </div>
  )
}

export default Home
