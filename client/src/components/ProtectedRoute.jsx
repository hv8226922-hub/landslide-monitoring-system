
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
