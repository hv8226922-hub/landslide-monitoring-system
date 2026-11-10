const events = [
  {
    location: 'Haflong, Dima Hasao',
    date: '10 November 2026',
    severity: 'High',
    trigger: 'Heavy rainfall',
    status: 'Verified',
  },
  {
    location: 'Shillong Road, East Khasi Hills',
    date: '09 November 2026',
    severity: 'Moderate',
    trigger: 'Slope movement',
    status: 'Under review',
  },
  {
    location: 'Kohima Bypass, Nagaland',
    date: '07 November 2026',
    severity: 'Low',
    trigger: 'Rockfall',
    status: 'Monitoring',
  },
]

function Landslides() {
  return (
    <>
      <h1>Landslide Events</h1>
      <p>Historical and recently reported landslide events in monitored regions.</p>

      <section>
        <h2>Event records</h2>

        <div className="event-list">
          {events.map((event) => (
            <article className="event-card" key={`${event.location}-${event.date}`}>
              <div>
                <h3>{event.location}</h3>
                <p>
                  {event.date} · Trigger: {event.trigger}
                </p>
              </div>

              <span className={`risk-label ${event.severity.toLowerCase()}`}>
                {event.severity}
              </span>

              <span className="event-status">{event.status}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Landslides