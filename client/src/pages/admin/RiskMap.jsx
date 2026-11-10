import RiskMapView from '../../components/RiskMap.jsx'

function RiskMapPage() {
  return (
    <>
      <h1>Live Risk Map</h1>
      <p>
        View current landslide risk locations across monitored districts.
      </p>

      <section>
        <h2>Monitored risk zones</h2>
        <RiskMapView />
      </section>
    </>
  )
}

export default RiskMapPage