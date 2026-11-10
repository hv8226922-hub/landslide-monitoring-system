
import { useState } from 'react'

function ReportForm({ onReportSubmitted }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const report = {
      location: formData.get('location')?.trim(),
      severity: formData.get('severity'),
      description: formData.get('description')?.trim(),
    }

    setSubmitted(false)
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not submit report')
      }

      setSubmitted(true)
      form.reset()

      // Refresh dashboard reports after successful submission
      if (onReportSubmitted) {
        await onReportSubmitted()
      }

    } catch (error) {
      setError(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="report-panel">
      <div className="report-heading">
        <h3>Submit a field report</h3>
        <p>Report cracks, slope movement, or blocked roads.</p>
      </div>

      {submitted && (
        <p className="report-success">
          Report received. Thank you for sharing this information.
        </p>
      )}

      {error && (
        <p className="report-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Location
          <input
            name="location"
            type="text"
            placeholder="Village, road, or nearby landmark"
            required
          />
        </label>

        <label>
          Severity
          <select name="severity" defaultValue="Moderate">
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          What did you observe?
          <textarea
            name="description"
            placeholder="Describe the crack, movement, or blockage"
            rows="4"
            required
          />
        </label>

        <label>
          Add a photo (coming soon)
          <input name="photo" type="file" accept="image/*" disabled />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}

export default ReportForm
