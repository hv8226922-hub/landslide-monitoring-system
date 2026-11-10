import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const rainfallData = [
  { day: 'Mon', rainfall: 32 },
  { day: 'Tue', rainfall: 48 },
  { day: 'Wed', rainfall: 41 },
  { day: 'Thu', rainfall: 68 },
  { day: 'Fri', rainfall: 55 },
  { day: 'Sat', rainfall: 82 },
  { day: 'Sun', rainfall: 96 },
]

function RainfallChart() {
  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <div>
          <h3>Rainfall trend</h3>
          <p>Sample rainfall over the last 7 days</p>
        </div>
        <span>mm</span>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rainfallData}>
            <CartesianGrid stroke="#e8eee8" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar
              dataKey="rainfall"
              fill="#4d9364"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RainfallChart