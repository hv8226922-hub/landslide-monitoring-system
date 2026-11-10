const reports = [
  {
    date: '10 November 2026',
    type: 'Road blockage',
    location: 'Haflong Road, Assam',
    status: 'Verified',
  },
  {
    date: '08 November 2026',
    type: 'Slope crack',
    location: 'Shillong Road, Meghalaya',
    status: 'Under review',
  },
]

function History() {
  return (
    <div className="citizen-page">
      <h1>My Report History</h1>
      <p>Track the status of reports submitted from this portal.</p>

      <div className="history-list">
        {reports.map((report) => (
          <article className="history-card" key={`${report.date}-${report.type}`}>
            <div>
              <strong>{report.type}</strong>
              <span>{report.location}</span>
              <small>{report.date}</small>
            </div>

            <span className="history-status">{report.status}</span>
          </article>
        ))}
      </div>
    </div>
  )
}

export default History