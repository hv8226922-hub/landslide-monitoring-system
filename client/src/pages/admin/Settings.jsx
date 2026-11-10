import { useState } from 'react'

function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [highRiskAlerts, setHighRiskAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSaved(true)
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
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
          </label>

          <label className="settings-toggle">
            <span>
              <strong>High-risk alerts</strong>
              <small>Notify immediately when a zone reaches high risk.</small>
            </span>

            <input
              type="checkbox"
              checked={highRiskAlerts}
              onChange={(event) => setHighRiskAlerts(event.target.checked)}
            />
          </label>
        </section>

        <section className="settings-form-fields">
          <h2>Risk threshold</h2>

          <label>
            High-risk threshold score
            <input type="number" defaultValue="70" min="0" max="100" />
          </label>

          <label>
            Dashboard language
            <select defaultValue="English">
              <option>English</option>
              <option>Hindi</option>
              <option>Assamese</option>
            </select>
          </label>
        </section>

        <button type="submit">Save settings</button>

        {saved && <p className="settings-success">Settings saved successfully.</p>}
      </form>
    </>
  )
}

export default Settings