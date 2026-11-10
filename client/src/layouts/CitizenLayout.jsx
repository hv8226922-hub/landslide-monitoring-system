import { NavLink, Outlet } from 'react-router-dom'
import {
  Bell,
  FilePlus2,
  History,
  Home,
  Map,
  Mountain,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', to: '/citizen/home' },
  { icon: Map, label: 'Nearby risk', to: '/citizen/risk-map' },
  { icon: FilePlus2, label: 'Report incident', to: '/citizen/report' },
  { icon: Bell, label: 'Alerts', to: '/citizen/alerts' },
  { icon: ShieldCheck, label: 'Safety guide', to: '/citizen/safety' },
  { icon: History, label: 'My reports', to: '/citizen/history' },
]

function CitizenLayout() {
  return (
    <div className="citizen-layout">
      <header className="citizen-header">
        <NavLink className="citizen-brand" to="/citizen/home">
          <span className="citizen-brand-mark">
            <Mountain size={19} />
          </span>

          <span>
            <strong>TerraWatch</strong>
            <small>Citizen safety portal</small>
          </span>
        </NavLink>

        <span className="citizen-user">Citizen view</span>
      </header>

      <nav className="citizen-nav" aria-label="Citizen navigation">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `citizen-nav-link ${isActive ? 'active' : ''}`
            }
            to={to}
            key={label}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="citizen-main">
        <Outlet />
      </main>
    </div>
  )
}

export default CitizenLayout
