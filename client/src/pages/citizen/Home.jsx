import { Bell, Map, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="citizen-home">
      <section className="citizen-welcome">
        <p>LANDSLIDE SAFETY PORTAL</p>
        <h1>Stay aware. Stay safe.</h1>
        <span>Local risk information and safety actions for your area.</span>
      </section>

      <section className="citizen-risk-card">
        <div>
          <p>YOUR CURRENT RISK</p>
          <h2>MODERATE</h2>
          <span>Rainfall is increasing in nearby monitored areas.</span>
        </div>

        <ShieldAlert size={50} />
      </section>

      <section className="citizen-action-grid">
        <Link to="/citizen/risk-map" className="citizen-action-card">
          <Map size={22} />
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