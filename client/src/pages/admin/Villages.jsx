import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

const API_URL = `${API_BASE_URL}/villages`

const initialForm = {
  name: '',
  district: '',
  state: '',
  population: '',
  roadStatus: 'Open',
  riskLevel: 'Moderate',
  latitude: '',
  longitude: '',
}

function Villages() {
  const [villages, setVillages] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function fetchVillages() {
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
        throw new Error(result.message || 'Could not fetch villages')
      }

      setVillages(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVillages()
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
        population:
          form.population === '' ? null : Number(form.population),
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
        throw new Error(result.message || 'Could not save village')
      }

      setMessage(result.message)
      resetForm()
      await fetchVillages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(village) {
    setEditingId(village.id)

    setForm({
      name: village.name,
      district: village.district,
      state: village.state,
      population: village.population ?? '',
      roadStatus: village.road_status,
      riskLevel: village.risk_level,
      latitude: village.latitude ?? '',
      longitude: village.longitude ?? '',
    })

    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this village?')) {
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
        throw new Error(result.message || 'Could not delete village')
      }

      setMessage(result.message)
      await fetchVillages()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Vulnerable Villages</h1>
      <p>
        Manage village information and recorded landslide risk details.
      </p>

      <section className="village-form-section">
        <h2>{editingId ? 'Edit Village' : 'Add New Village'}</h2>

        <form onSubmit={handleSubmit} className="village-form">
          <input
            name="name"
            placeholder="Village name"
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
            name="population"
            type="number"
            min="0"
            step="1"
            placeholder="Population"
            value={form.population}
            onChange={handleChange}
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
            name="roadStatus"
            value={form.roadStatus}
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

          <div className="village-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Village'
                  : 'Add Village'}
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

      <section className="village-grid">
        {loading ? (
          <p>Loading villages...</p>
        ) : villages.length === 0 ? (
          <p>No villages added yet. Use the form above to add a village.</p>
        ) : (
          villages.map((village) => (
            <article className="village-card" key={village.id}>
              <div className="village-card-top">
                <div>
                  <h2>{village.name}</h2>
                  <p>
                    {village.district}, {village.state}
                  </p>
                </div>

                <span
                  className={`risk-label ${village.risk_level.toLowerCase()}`}
                >
                  {village.risk_level}
                </span>
              </div>

              <div className="village-details">
                <span>
                  Population <strong>{village.population ?? 'N/A'}</strong>
                </span>

                <span>
                  Road <strong>{village.road_status}</strong>
                </span>
              </div>

              {village.latitude != null && village.longitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${village.latitude},${village.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on map
                </a>
              )}

              <div className="village-card-actions">
                <button
                  type="button"
                  onClick={() => handleEdit(village)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(village.id)}
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

export default Villages
