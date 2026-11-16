import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_URL = `${API_BASE_URL}/analytics`

const RISK_COLORS = {
  Low: '#5fa778',
  Moderate: '#dda449',
  High: '#e58b45',
  Critical: '#d9534f',
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch analytics')
        }

        setAnalytics(result.data)
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div>
        <h1>Risk Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>Risk Analytics</h1>
        <p role="alert" style={{ color: '#d9534f' }}>
          {error}
        </p>
      </div>
    )
  }

  const districtData = analytics?.districtData || []
  const riskData = analytics?.riskData || []
  const summary = analytics?.summary || {}

  return (
    <>
      <h1>Risk Analytics</h1>
      <p>Live analytics from TerraWatch database.</p>

      <section className="analytics-grid">
        <article className="analytics-panel">
          <div className="analytics-heading">
            <div>
              <h2>Reported incidents by location</h2>
              <p>All recorded reports</p>
            </div>
          </div>

          <div className="analytics-chart">
            {districtData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData}>
                  <CartesianGrid
                    stroke="#e8eee8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="district"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="incidents"
                    fill="#3f8555"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No report data available yet.</p>
            )}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-heading">
            <div>
              <h2>Risk distribution</h2>
              <p>All recorded predictions</p>
            </div>
          </div>

          <div className="analytics-chart">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {riskData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={RISK_COLORS[entry.name] || '#888888'}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No prediction data available yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="analytics-panel">
          <h2>Total Reports</h2>
          <h3>{summary.total_reports ?? 0}</h3>
        </article>

        <article className="analytics-panel">
          <h2>Total Predictions</h2>
          <h3>{summary.total_predictions ?? 0}</h3>
        </article>

        <article className="analytics-panel">
          <h2>Average Risk Probability</h2>
          <h3>
            {summary.average_probability != null
              ? `${Number(summary.average_probability).toFixed(2)}%`
              : 'N/A'}
          </h3>
        </article>
      </section>
    </>
  )
}

export default Analytics

