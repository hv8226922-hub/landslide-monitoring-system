import { useState } from 'react'

const initialReports = [
  {
    id: 1,
    location: 'NH-27, Haflong, Assam',
    type: 'Road crack',
    severity: 'High',
    status: 'New',
    time: '12 minutes ago',
  },
  {
    id: 2,
    location: 'Mawlynnong Road, Meghalaya',
    type: 'Landslide debris',
    severity: 'Moderate',
    status: 'Under review',
    time: '38 minutes ago',
  },
  {
    id: 3,
    location: 'Kohima Bypass, Nagaland',
    type: 'Rockfall',
    severity: 'Low',
    status: 'Verified',
    time: '1 hour ago',
  },
]

function Reports() {
  const [reports, setReports] = useState(initialReports)

  function markVerified(id) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id
          ? { ...report, status: 'Verified' }
          : report,
      ),
    )
  }

  return (
    <>
      <h1>Citizen and Field Reports</h1>
      <p>Review geo-tagged incident reports submitted by citizens and field teams.</p>

      <section>
        <h2>Incoming reports</h2>

        <div className="reports-table">
          <div className="reports-table-head">
            <span>Location</span>
            <span>Incident type</span>
            <span>Severity</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {reports.map((report) => (
            <article className="report-row" key={report.id}>
              <div>
                <strong>{report.location}</strong>
                <small>{report.time}</small>
              </div>

              <span>{report.type}</span>

              <span className={`risk-label ${report.severity.toLowerCase()}`}>
                {report.severity}
              </span>

              <span className="report-status">{report.status}</span>

              <button
                type="button"
                className="verify-button"
                onClick={() => markVerified(report.id)}
                disabled={report.status === 'Verified'}
              >
                {report.status === 'Verified' ? 'Verified' : 'Verify'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Reports