import RiskMapView from '../../components/RiskMap.jsx'

function OfficerMap() {
  return (
    <div className="officer-page">
      <h1>Field Map</h1>
      <p>Use the map to locate assigned incidents and nearby risk zones.</p>

      <section className="officer-map-panel">
        <RiskMapView />
      </section>
    </div>
  )
}

export default OfficerMap