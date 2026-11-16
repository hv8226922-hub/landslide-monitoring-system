import { API_BASE_URL } from '../../config/api.js'

import { useEffect, useState } from 'react'

const API_URL = `${API_BASE_URL}/infrastructure`

const initialForm = {
  name: '',
  type: 'Hospital',
  location: '',
  district: '',
  state: '',
  riskLevel: 'Moderate',
  status: 'Operational',
  latitude: '',
  longitude: '',
}

function Infrastructure() {
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')

  async function fetchAssets() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch assets')
      }

      setAssets(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save asset')
      }

      setMessage(result.message)
      resetForm()
      await fetchAssets()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(asset) {
    setEditingId(asset.id)

    setForm({
      name: asset.name || '',
      type: asset.type || 'Hospital',
      location: asset.location || '',
      district: asset.district || '',
      state: asset.state || '',
      riskLevel: asset.risk_level || 'Moderate',
      status: asset.status || 'Operational',
      latitude: asset.latitude ?? '',
      longitude: asset.longitude ?? '',
    })

    setMessage('')
    setError('')
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete asset')
      }

      setMessage(result.message)

      if (editingId === id) resetForm()

      await fetchAssets()
    } catch (err) {
      setError(err.message)
    }
  }

  function getMapUrl(asset) {
    if (asset.latitude == null || asset.longitude == null) {
      return null
    }

    return `https://www.google.com/maps?q=${asset.latitude},${asset.longitude}`
  }

  return (
    <>
      <h1>Critical Infrastructure</h1>
      <p>Monitor public assets that may be affected by landslide risk.</p>

      <section className="infrastructure-form-section">
        <h2>{editingId ? 'Edit Infrastructure Asset' : 'Add Infrastructure Asset'}</h2>

        <form className="infrastructure-form" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Asset name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select name="type" value={form.type} onChange={handleChange}>
            <option>Hospital</option>
            <option>Bridge</option>
            <option>Road</option>
            <option>Railway</option>
            <option>Power infrastructure</option>
            <option>School</option>
            <option>Other</option>
          </select>

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            required
          />

          <select name="riskLevel" value={form.riskLevel} onChange={handleChange}>
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange}>
            <option>Operational</option>
            <option>Inspection required</option>
            <option>Under maintenance</option>
            <option>Damaged</option>
            <option>Closed</option>
          </select>

          <input
            type="number"
            step="any"
            name="latitude"
            placeholder="Latitude (optional)"
            value={form.latitude}
            onChange={handleChange}
          />

          <input
            type="number"
            step="any"
            name="longitude"
            placeholder="Longitude (optional)"
            value={form.longitude}
            onChange={handleChange}
          />

          <div className="infrastructure-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Asset' : 'Add Asset'}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading infrastructure assets...</p>
      ) : assets.length === 0 ? (
        <p>No infrastructure assets found. Add your first asset above.</p>
      ) : (
        <section className="infrastructure-grid">
          {assets.map((asset) => (
            <article className="infrastructure-card" key={asset.id}>
              <div className="infrastructure-card-top">
                <span>{asset.type}</span>
                <span className={`risk-label ${(asset.risk_level || 'Moderate').toLowerCase()}`}>
                  {asset.risk_level || 'Moderate'} risk
                </span>
              </div>

              <h2>{asset.name}</h2>
              <p>{asset.location}</p>

              <div className="infrastructure-status">
                <span>Current status</span>
                <strong>{asset.status}</strong>
              </div>

              {getMapUrl(asset) && (
                <a href={getMapUrl(asset)} target="_blank" rel="noreferrer">
                  View on map
                </a>
              )}

              <div className="infrastructure-card-actions">
                <button type="button" onClick={() => handleEdit(asset)}>
                  Edit
                </button>

                <button type="button" onClick={() => handleDelete(asset.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

export default Infrastructure
