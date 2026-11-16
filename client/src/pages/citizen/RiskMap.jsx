
import RiskMapView from '../../components/RiskMap.jsx'

function CitizenRiskMap() {
  const selectedDistrict = localStorage.getItem('selectedCitizenDistrict') || ''

  return (
    <div className="citizen-page">
      <h1>Nearby Risk Map</h1>
      <p>
        View monitored landslide risk zones near your area.
      </p>

      <section className="citizen-panel">
        <RiskMapView selectedDistrict={selectedDistrict} />
      </section>
    </div>
  )
}

export default CitizenRiskMap
