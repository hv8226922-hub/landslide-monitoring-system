import { NavLink } from 'react-router-dom'
import {
  Activity,
  Bell,
  CloudRain,
  FileText,
  LayoutDashboard,
  Map,
  Mountain,
  Radio,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', to: '/admin/dashboard' },
  { icon: Map, label: 'Risk map', to: '/admin/risk-map' },
  { icon: Activity, label: 'Predictions', to: '/admin/predictions' },
  { icon: CloudRain, label: 'Weather', to: '/admin/weather' },
  { icon: Mountain, label: 'Landslides', to: '/admin/landslides' },
  { icon: Map, label: 'Roads', to: '/admin/roads' },
  { icon: Users, label: 'Villages', to: '/admin/villages' },
  { icon: Radio, label: 'Infrastructure', to: '/admin/infrastructure' },
  { icon: FileText, label: 'Field reports', to: '/admin/reports', count: '12' },
  { icon: Bell, label: 'Alerts', to: '/admin/alerts', count: '04' },
  { icon: ShieldAlert, label: 'Emergency', to: '/admin/emergency' },
  { icon: Activity, label: 'Analytics', to: '/admin/analytics' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/admin/dashboard" aria-label="TerraWatch home">
        <span className="brand-mark">
          <Mountain size={21} strokeWidth={2.4} />
        </span>

        <span>
          <strong>TerraWatch</strong>
          <small>NER Risk Intelligence</small>
        </span>
      </NavLink>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="side-nav" aria-label="Main navigation">
        {navItems.map(({ icon: Icon, label, to, count }) => (
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            to={to}
            key={label}
          >
            <Icon size={18} />
            <span>{label}</span>
            {count && <b>{count}</b>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sensor-status">
          <span className="pulse-dot" />
          <div>
            <strong>Network healthy</strong>
            <small>18 of 20 sensors online</small>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">AS</div>
          <div>
            <strong>Admin User</strong>
            <small>District authority</small>
          </div>
          <span className="profile-menu">•••</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar