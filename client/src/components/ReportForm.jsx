import { useState } from 'react'

function ReportForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
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
          Add a photo (optional)
          <input name="photo" type="file" accept="image/*" />
        </label>

        <button type="submit">Submit report</button>
      </form>
    </div>
  )
}

export default ReportForm