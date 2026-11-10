import { NavLink, Outlet } from 'react-router-dom'
import {
  ClipboardList,
  Map,
  Mountain,
  Signal,
  LayoutDashboard,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/officer/dashboard' },
  { icon: ClipboardList, label: 'Incidents', to: '/officer/incidents' },
  { icon: Map, label: 'Field map', to: '/officer/map' },
  { icon: Signal, label: 'Offline sync', to: '/officer/offline' },
]

function OfficerLayout() {
  return (
    <div className="officer-layout">
      <header className="officer-header">
        <NavLink className="officer-brand" to="/officer/dashboard">
          <span className="officer-brand-mark">
            <Mountain size={19} />
          </span>

          <span>
            <strong>TerraWatch</strong>
            <small>Field officer portal</small>
          </span>
        </NavLink>

        <span className="officer-user">Officer view</span>
      </header>

      <nav className="officer-nav">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `officer-nav-link ${isActive ? 'active' : ''}`
            }
            to={to}
            key={label}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="officer-main">
        <Outlet />
      </main>
    </div>
  )
}

export default OfficerLayout