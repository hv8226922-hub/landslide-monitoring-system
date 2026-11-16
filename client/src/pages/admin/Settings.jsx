
import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/settings'

function Settings() {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    highRiskAlertsEnabled: true,
    riskThreshold: 70,
    dashboardLanguage: 'English',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to load settings')
        }

        setSettings({
          notificationsEnabled: result.data.notifications_enabled,
          highRiskAlertsEnabled: result.data.high_risk_alerts_enabled,
          riskThreshold: result.data.risk_threshold,
          dashboardLanguage: result.data.dashboard_language,
        })
      } catch (err) {
        setError(err.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setSettings((previous) => ({
      ...previous,
      [name]: type === 'checkbox'
        ? checked
        : name === 'riskThreshold'
          ? value
          : value,
    }))

    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          riskThreshold: Number(settings.riskThreshold),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save settings')
      }

      setMessage('Settings saved successfully.')
    } catch (err) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading settings...</p>
  }

  return (
    <>
      <h1>Settings</h1>
      <p>Configure dashboard preferences and notification behaviour.</p>

      <form className="settings-panel" onSubmit={handleSubmit}>
        <section>
          <h2>Notification settings</h2>

          <label className="settings-toggle">
            <span>
              <strong>Enable notifications</strong>
              <small>Receive dashboard alerts and status updates.</small>
            </span>

            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onChange={handleChange}
            />
          </label>

          <label className="settings-toggle">
            <span>
              <strong>High-risk alerts</strong>
              <small>Notify immediately when a zone reaches high risk.</small>
            </span>

            <input
              type="checkbox"
              name="highRiskAlertsEnabled"
              checked={settings.highRiskAlertsEnabled}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className="settings-form-fields">
          <h2>Risk threshold</h2>

          <label>
            High-risk threshold score
            <input
              type="number"
              name="riskThreshold"
              value={settings.riskThreshold}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </label>

          <label>
            Dashboard language
            <select
              name="dashboardLanguage"
              value={settings.dashboardLanguage}
              onChange={handleChange}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Assamese</option>
            </select>
          </label>
        </section>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </button>

        {message && (
          <p className="settings-success">{message}</p>
        )}

        {error && (
          <p className="settings-error">{error}</p>
        )}
      </form>
    </>
  )
}

export default Settings
