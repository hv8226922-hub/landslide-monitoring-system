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

const districtData = [
  { district: 'Dima Hasao', incidents: 18 },
  { district: 'East Khasi Hills', incidents: 13 },
  { district: 'Kohima', incidents: 8 },
  { district: 'Jorhat', incidents: 4 },
]

const riskData = [
  { name: 'Low', value: 42, color: '#5fa778' },
  { name: 'Moderate', value: 31, color: '#dda449' },
  { name: 'High', value: 19, color: '#d96d53' },
]

function Analytics() {
  return (
    <>
      <h1>Risk Analytics</h1>
      <p>Sample analytics for landslide events and current district risk levels.</p>

      <section className="analytics-grid">
        <article className="analytics-panel">
          <div className="analytics-heading">
            <div>
              <h2>Reported incidents by district</h2>
              <p>Last 30 days</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid stroke="#e8eee8" vertical={false} />
                <XAxis dataKey="district" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="incidents" fill="#3f8555" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-heading">
            <div>
              <h2>Current risk distribution</h2>
              <p>Across monitored zones</p>
            </div>
          </div>

          <div className="analytics-chart">
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
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </>
  )
}

export default Analytics
