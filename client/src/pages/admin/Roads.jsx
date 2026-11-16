
import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/api/roads'

const initialForm = {
  name: '',
  district: '',
  state: '',
  latitude: '',
  longitude: '',
  status: 'Open',
  riskLevel: 'Moderate',
}

function Roads() {
  const [roads, setRoads] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function fetchRoads() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not fetch roads')
      }

      setRoads(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoads()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function resetForm() {
    setForm(initialForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      }

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not save road')
      }

      setMessage(result.message)
      resetForm()
      await fetchRoads()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(road) {
    setEditingId(road.id)

    setForm({
      name: road.name,
      district: road.district,
      state: road.state,
      latitude: road.latitude ?? '',
      longitude: road.longitude ?? '',
      status: road.status,
      riskLevel: road.risk_level,
    })

    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this road?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not delete road')
      }

      setMessage(result.message)
      await fetchRoads()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Road Monitoring</h1>
      <p>
        Manage roads that may be affected by landslides or slope movement.
      </p>

      <section className="road-form-section">
        <h2>{editingId ? 'Edit Road' : 'Add New Road'}</h2>

        <form onSubmit={handleSubmit} className="road-form">
          <input
            name="name"
            placeholder="Road name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
            required
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            required
          />

          <input
            name="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="Latitude (optional)"
            value={form.latitude}
            onChange={handleChange}
          />

          <input
            name="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="Longitude (optional)"
            value={form.longitude}
            onChange={handleChange}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Open">Open</option>
            <option value="Blocked">Blocked</option>
            <option value="Restricted">Restricted</option>
          </select>

          <select
            name="riskLevel"
            value={form.riskLevel}
            onChange={handleChange}
          >
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          <div className="road-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Road'
                  : 'Add Road'}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <section className="road-grid">
        {loading ? (
          <p>Loading roads...</p>
        ) : roads.length === 0 ? (
          <p>No roads added yet. Use the form above to add a road.</p>
        ) : (
          roads.map((road) => (
            <article className="road-card" key={road.id}>
              <span
                className={`risk-label ${road.risk_level.toLowerCase()}`}
              >
                {road.risk_level} risk
              </span>

              <h2>{road.name}</h2>
              <p>
                {road.district}, {road.state}
              </p>

              <div>
                <span>Current status</span>
                <strong>{road.status}</strong>
              </div>

              {road.latitude != null && road.longitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${road.latitude},${road.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on map
                </a>
              )}

              <div className="road-card-actions">
                <button type="button" onClick={() => handleEdit(road)}>
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(road.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  )
}

export default Roads
