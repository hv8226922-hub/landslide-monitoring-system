import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('admin')

  function handleSubmit(event) {
    event.preventDefault()

    if (role === 'citizen') {
      navigate('/citizen/home')
      return
    }

    if (role === 'officer') {
      navigate('/officer/dashboard')
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand-mark">▲</div>
        <p className="login-eyebrow">LANDSLIDE MONITORING SYSTEM</p>
        <h1>Welcome back</h1>
        <p className="login-description">
          Sign in to view regional risk updates.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Login as
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="officer">Field officer</option>
              <option value="citizen">Citizen</option>
            </select>
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit">Sign in</button>
        </form>

        <p className="login-demo-note">
          Demo login: choose a role, then enter any valid email and password.
        </p>
      </section>
    </main>
  )
}

export default Login