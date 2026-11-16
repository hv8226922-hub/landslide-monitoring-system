
import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_URL = 'http://127.0.0.1:5000/api/weather'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const record = payload[0].payload

  return (
    <div className="rainfall-custom-tooltip">
      <strong>{label}</strong>
      <p>📍 {record.district || 'Unknown district'}</p>
      <span>{record.rainfall} mm rainfall</span>
    </div>
  )
}

function RainfallChart() {
  const [rainfallData, setRainfallData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please login again to view rainfall data.')
        }

        const response = await fetch(`${API_URL}?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Unable to fetch weather records'
          )
        }

        const records = (result.data || [])
          .slice(0, 7)
          .reverse()

       const formattedData = records.map((record) => {
  const date = record.recorded_at
    ? new Date(record.recorded_at).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short' }
      )
    : 'N/A'

  return {
    day: `${date} - ${record.district}`,
    rainfall: Number(record.rainfall_24h) || 0,
    district: record.district,
  }
})

        setRainfallData(formattedData)
      } catch (err) {
        console.error('Weather API error:', err)
        setError(err.message || 'Unable to fetch rainfall data')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const totalRainfall = rainfallData.reduce(
    (total, item) => total + item.rainfall,
    0
  )

  const averageRainfall = rainfallData.length
    ? (totalRainfall / rainfallData.length).toFixed(1)
    : '0.0'

  return (
    <div className="chart-panel rainfall-panel">
      <div className="chart-heading rainfall-heading">
        <div className="rainfall-title">
          <div className="rainfall-icon">🌧️</div>

          <div>
            <h3>Rainfall Overview</h3>
            <p>Latest weather records from TerraWatch</p>
          </div>
        </div>

        <span className="rainfall-unit">MM</span>
      </div>

      {!loading && !error && rainfallData.length > 0 && (
        <div className="rainfall-summary">
          <div>
            <span>Total recorded rainfall</span>
            <strong>{totalRainfall.toFixed(1)} mm</strong>
          </div>

          <div>
            <span>Average per record</span>
            <strong>{averageRainfall} mm</strong>
          </div>
        </div>
      )}

      <div className="chart-area rainfall-chart-area">
        {loading ? (
          <div className="rainfall-state">
            <span className="rainfall-loader"></span>
            <p>Loading rainfall data...</p>
          </div>
        ) : error ? (
          <div className="rainfall-state rainfall-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : rainfallData.length === 0 ? (
          <div className="rainfall-state">
            <span>🌦️</span>
            <p>No weather records available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rainfallData}
              margin={{ top: 12, right: 12, left: -15, bottom: 5 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                stroke="#edf1ed"
                vertical={false}
                strokeDasharray="4 4"
              />

             <XAxis
  dataKey="day"
  tickLine={false}
  axisLine={false}
  tick={{ fill: '#849087', fontSize: 10 }}
  angle={-25}
  textAnchor="end"
  height={65}
  interval={0}
/>

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#849087', fontSize: 11 }}
                tickFormatter={(value) => `${value}`}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#edf5ef' }}
              />

              <Bar
                dataKey="rainfall"
                fill="#39885a"
                radius={[7, 7, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rainfall-footer">
        <span>●</span>
        Database weather records · Rainfall in mm
      </div>
    </div>
  )
}

export default RainfallChart
