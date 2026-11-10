
import { useEffect, useState } from 'react'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'

const API_URL = 'http://127.0.0.1:5000/api/risk'

const districtCoordinates = {
  'Dima Hasao': [25.35, 93.02],
  'East Khasi Hills': [25.3, 91.8],
  Kohima: [25.67, 94.1],
  Mainpuri: [27.23, 79.02],
  Uttarkashi: [30.73, 78.45],
  Chamoli: [30.4, 79.32],
  Rudraprayag: [30.28, 78.98],
}

function RiskMap() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Unable to fetch risk predictions')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Risk data unavailable')
        }

        setLocations(
          (result.data || []).map((record) => ({
            ...record,
            position: districtCoordinates[record.district],
          }))
        )
      } catch (err) {
        console.error('Risk API error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [])

  const mappedLocations = locations.filter(
    (location) => location.position
  )

  return (
    <div className="risk-map">
      {loading ? (
        <p>Loading risk locations...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <MapContainer
            center={[27.5, 82.5]}
            zoom={5}
            scrollWheelZoom={false}
            className="risk-map-view"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mappedLocations.map((location) => (
              <Marker
                position={location.position}
                key={location.id}
              >
                <Popup>
                  <strong>{location.district}</strong>
                  <br />
                  Risk level: {location.risk_level}
                  <br />
                  Probability: {(Number(location.probability) * 100).toFixed(1)}%
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {locations.length === 0 && (
            <p>No risk predictions available yet.</p>
          )}

          {locations.length > mappedLocations.length && (
            <p>
              {locations.length - mappedLocations.length} location(s)
              have no coordinates configured.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default RiskMap
