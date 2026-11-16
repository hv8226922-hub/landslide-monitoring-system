
import { useEffect, useState } from 'react'

const REPORTS_API = 'http://127.0.0.1:5000/api/reports'
const OFFICERS_API = 'http://127.0.0.1:5000/api/auth/officers'

function Emergency() {
  const [reports, setReports] = useState([])
  const [officers, setOfficers] = useState([])
  const [selectedOfficers, setSelectedOfficers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function fetchEmergencyData() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login as Admin first')
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [reportsResponse, officersResponse] = await Promise.all([
        fetch(REPORTS_API, { headers }),
        fetch(OFFICERS_API, { headers }),
      ])

      const reportsResult = await reportsResponse.json()
      const officersResult = await officersResponse.json()

      if (!reportsResponse.ok) {
        throw new Error(
          reportsResult.message || 'Could not fetch reports'
        )
      }

      if (!officersResponse.ok) {
        throw new Error(
          officersResult.message || 'Could not fetch officers'
        )
      }

      setReports(reportsResult.data || [])
      setOfficers(officersResult.data || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmergencyData()
  }, [])

  function handleOfficerChange(reportId, officerId) {
    setSelectedOfficers((current) => ({
      ...current,
      [reportId]: officerId,
    }))
  }

  async function assignOfficer(reportId) {
    const officerId = selectedOfficers[reportId]

    if (!officerId) {
      setError('Please select an officer first')
      return
    }

    try {
      setUpdatingId(reportId)
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        `${REPORTS_API}/${reportId}/assign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            officerId: Number(officerId),
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Could not assign officer'
        )
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === reportId ? result.data : report
        )
      )

      setSelectedOfficers((current) => ({
        ...current,
        [reportId]: '',
      }))
    } catch (err) {
      setError(err.message || 'Could not assign officer')
    } finally {
      setUpdatingId(null)
    }
  }

  function getOfficerName(officerId) {
    if (!officerId) return 'Unassigned'

    const officer = officers.find(
      (item) => String(item.id) === String(officerId)
    )

    return officer ? officer.name : 'Officer assigned'
  }

  function getPriority(severity) {
    const value = (severity || 'Moderate').toLowerCase()

    if (value === 'critical') return 'Critical'
    if (value === 'high') return 'High'
    if (value === 'low') return 'Low'

    return 'Moderate'
  }

  return (
    <>
      <h1>Emergency Response</h1>
      <p>
        Prioritise reported incidents and assign field response teams.
      </p>

      <section>
        <h2>Reported Incidents ({reports.length})</h2>

        {loading && <p>Loading emergency reports...</p>}

        {error && (
          <div>
            <p>{error}</p>
            <button type="button" onClick={fetchEmergencyData}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <p>No reported incidents available.</p>
        )}

        {!loading && reports.length > 0 && (
          <div className="emergency-list">
            {reports.map((report) => {
              const priority = getPriority(report.severity)
              const assigned = Boolean(report.assigned_officer_id)

              return (
                <article className="emergency-card" key={report.id}>
                  <div className="emergency-priority">
                    <span
                      className={`risk-label ${priority.toLowerCase()}`}
                    >
                      Priority: {priority}
                    </span>
                  </div>

                  <div className="emergency-details">
                    <h3>{report.incident_type || 'Landslide report'}</h3>

                    <p className="emergency-location">
                      {report.location || 'Location unavailable'}
                    </p>

                    <p>
                      {report.description || 'No additional details'}
                    </p>

                    <div className="emergency-meta">
                      <span>
                        Officer: {getOfficerName(report.assigned_officer_id)}
                      </span>

                      <span>Status: {report.status || 'New'}</span>
                    </div>

                    <div className="emergency-assignment">
                      <select
                        value={
                          selectedOfficers[report.id] || ''
                        }
                        onChange={(event) =>
                          handleOfficerChange(
                            report.id,
                            event.target.value
                          )
                        }
                        disabled={updatingId === report.id}
                      >
                        <option value="">Select an officer</option>

                        {officers.map((officer) => (
                          <option
                            key={officer.id}
                            value={officer.id}
                          >
                            {officer.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => assignOfficer(report.id)}
                        disabled={
                          !selectedOfficers[report.id] ||
                          updatingId === report.id ||
                          officers.length === 0
                        }
                      >
                        {updatingId === report.id
                          ? 'Assigning...'
                          : assigned
                            ? 'Reassign officer'
                            : 'Assign officer'}
                      </button>
                    </div>

                    {officers.length === 0 && (
                      <p>No officers registered yet.</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default Emergency
