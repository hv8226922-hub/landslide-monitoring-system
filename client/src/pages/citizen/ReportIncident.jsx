import ReportForm from '../../components/ReportForm.jsx'

function ReportIncident() {
  return (
    <div className="citizen-page">
      <h1>Report an Incident</h1>
      <p>
        Report a landslide, road blockage, crack, rockfall, or other hazardous
        condition.
      </p>

      <ReportForm />
    </div>
  )
}

export default ReportIncident