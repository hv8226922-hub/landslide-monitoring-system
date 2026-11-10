import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'

function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout