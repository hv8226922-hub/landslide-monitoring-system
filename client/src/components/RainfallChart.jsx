
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

function RainfallChart() {
  const [rainfallData, setRainfallData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Unable to fetch weather records')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Weather data unavailable')
        }

        const records = (result.data || [])
          .slice(0, 7)
          .reverse()

        const formattedData = records.map((record) => ({
          day: new Date(record.recorded_at).toLocaleDateString(
            'en-IN',
            { day: '2-digit', month: 'short' }
          ),
          rainfall: Number(record.rainfall_24h),
          district: record.district,
        }))

        setRainfallData(formattedData)
      } catch (err) {
        console.error('Weather API error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <div>
          <h3>Rainfall trend</h3>
          <p>Latest weather records from TerraWatch</p>
        </div>
        <span>mm</span>
      </div>

      <div className="chart-area">
        {loading ? (
          <p>Loading rainfall data...</p>
        ) : error ? (
          <p>{error}</p>
        ) : rainfallData.length === 0 ? (
          <p>No weather records available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rainfallData}>
              <CartesianGrid stroke="#e8eee8" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [`${value} mm`, 'Rainfall']}
                labelFormatter={(label) => `Recorded: ${label}`}
              />
              <Bar
                dataKey="rainfall"
                fill="#4d9364"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default RainfallChart
