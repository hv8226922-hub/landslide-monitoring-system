import Sidebar from './components/sidebar.jsx'
import MetricCard from './components/MetricCard.jsx'
import LocationCard from './components/LocationCard.jsx'
import AlertCard from './components/AlertCard.jsx'
import RiskMap from './components/RiskMap.jsx'
import RainfallChart from './components/RainfallChart.jsx'
import ReportForm from './components/ReportForm.jsx'

const metrics = [
  { title: 'Active alerts', value: '04', note: '2 new alerts since yesterday' },
  { title: 'High-risk zones', value: '12', note: 'Across 3 monitored districts' },
  { title: 'Sensors online', value: '18 / 20', note: '90% network uptime' },
  {
  title: 'Rainfall (24h)', value: '96.4 mm', note: '18% more than previous day'},
]

const locations = [
  { district: 'Dima Hasao', state: 'Assam', risk: 'High', score: 82 },
  { district: 'East Khasi Hills', state: 'Meghalaya', risk: 'Moderate', score: 56 },
  { district: 'Kohima', state: 'Nagaland', risk: 'Low', score: 24 },
]

const alerts = [
  {
    title: 'Heavy rainfall threshold crossed',
    location: 'Dima Hasao, Assam',
    message: 'Rainfall is above the watch level. Field inspection recommended.',
    time: '12 min ago',
    level: 'High',
  },
  {
    title: 'New field report received',
    location: 'East Khasi Hills, Meghalaya',
    message: 'A resident reported a road crack near the hillside.',
    time: '38 min ago',
    level: 'Moderate',
  },
]

function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content" id="overview">
        <h1>TerraWatch Dashboard</h1>
        <p>Landslide risk monitoring for Northeast India</p>

        <section className="metrics-grid" id='sensor-network'>
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              note={metric.note}
            />
          ))}
        </section>

<section id='risk-map'>
  <h2>Regional risk map</h2>
  <RiskMap />
</section> 

<section>
  <RainfallChart />
</section>

        <section>
          <h2>Priority locations</h2>

          {locations.map((location) => (
            <LocationCard key={location.district} {...location} />
          ))}
        </section>

        <section id='field-reports'>
  <h2>Recent alerts</h2>

  {alerts.map((alert) => (
    <AlertCard key={alert.title} {...alert} />
  ))}
</section>

<section id='communities'>
  <h2>Community reporting</h2>
  <ReportForm />
</section>

      </main>
    </div>
  )
}

export default App