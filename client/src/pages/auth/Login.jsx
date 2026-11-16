import { API_BASE_URL } from '../../config/api.js'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = isRegistering
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`

      const body = isRegistering
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password, role }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      // Registration successful
      if (isRegistering) {
        setIsRegistering(false)
        setRole('citizen')
        setName('')
        setSuccess('Account created successfully! Please sign in.')
        return
      }

      // Login successful
      if (!data.token || !data.user?.role) {
        throw new Error('Invalid login response from server')
      }

      if (!['admin', 'officer', 'citizen'].includes(data.user.role)) {
        throw new Error('Invalid user role')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (data.user.role === 'citizen') {
        navigate('/citizen/home')
      } else if (data.user.role === 'officer') {
        navigate('/officer/dashboard')
      } else {
        navigate('/admin/dashboard')
      }
    } catch (error) {
      setError(error.message || 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setIsRegistering(!isRegistering)
    setError('')
    setSuccess('')
    setPassword('')
    setName('')
    setRole('citizen')
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand-mark">▲</div>

        <p className="login-eyebrow">
          LANDSLIDE MONITORING SYSTEM
        </p>

        <h1>{isRegistering ? 'Create account' : 'Welcome back'}</h1>

        <p className="login-description">
          {isRegistering
            ? 'Register as a citizen to access TerraWatch.'
            : 'Sign in to view regional risk updates.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Full Name
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </label>
          )}

          {!isRegistering && (
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
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && (
            <p role="alert" style={{ color: 'red' }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={{ color: 'green' }}>
              {success}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? isRegistering ? 'Creating account...' : 'Signing in...'
              : isRegistering ? 'Create Account' : 'Sign in'}
          </button>
        </form>

        <p className="login-demo-note">
          {isRegistering
            ? 'Citizen accounts only. Admin and officer accounts are managed separately.'
            : 'Sign in using your registered account credentials.'}
        </p>

        <p style={{ textAlign: 'center', marginTop: '18px' }}>
          {isRegistering
            ? 'Already have an account? '
            : "Don't have a citizen account? "}

          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              padding: 0,
            }}
          >
            {isRegistering ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default Login
