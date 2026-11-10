import RiskMapView from '../../components/RiskMap.jsx'

function CitizenRiskMap() {
  return (
    <div className="citizen-page">
      <h1>Nearby Risk Map</h1>
      <p>View monitored landslide risk zones near your area.</p>

      <section className="citizen-panel">
        <RiskMapView />
      </section>
    </div>
  )
}

export default CitizenRiskMap