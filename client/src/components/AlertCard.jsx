function AlertCard({ title, location, message, time, level }) {
  return (
    <article className={`alert-card ${level.toLowerCase()}`}>
      <div>
        <h3>{title}</h3>
        <p>{location}</p>
        <p>{message}</p>
      </div>

      <span>{time}</span>
    </article>
  )
}

export default AlertCard