import {
  LayoutDashboard,
  Map,
  Mountain,
  Radio,
  ShieldAlert,
  Users,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Map, label: 'Risk map' },
  { icon: ShieldAlert, label: 'Field reports', count: '12' },
  { icon: Radio, label: 'Sensor network' },
  { icon: Users, label: 'Communities' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="TerraWatch home">
        <span className="brand-mark">
          <Mountain size={21} strokeWidth={2.4} />
        </span>

        <span>
          <strong>TerraWatch</strong>
          <small>NER Risk Intelligence</small>
        </span>
      </a>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="side-nav" aria-label="Main navigation">
        {navItems.map(({ icon: Icon, label, active, count }) => (
          <a
            className={`nav-link ${active ? 'active' : ''}`}
            href={`#${label.toLowerCase().replaceAll(' ', '-')}`}
            key={label}
          >
            <Icon size={18} />
            <span>{label}</span>
            {count && <b>{count}</b>}
          </a>
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