
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
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

const riskColors = {
  Low: '#16a34a',
  Moderate: '#eab308',
  High: '#f97316',
  Critical: '#dc2626',
}

function MapFocus({ selectedDistrict }) {
  const map = useMap()

  useEffect(() => {
    const coordinates = districtCoordinates[selectedDistrict]

    if (coordinates) {
      map.flyTo(coordinates, 7, {
        duration: 1.2,
      })
    }
  }, [map, selectedDistrict])

  return null
}

function RiskMap({ selectedDistrict = '' }) {
  const [locations, setLocations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please login again to view risk locations.')
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Unable to fetch risk predictions'
          )
        }

        setLocations(
          (result.data || []).map((record) => ({
            ...record,
            position: districtCoordinates[record.district],
          }))
        )
      } catch (err) {
        console.error('Risk Map API error:', err)
        setError(err.message || 'Unable to fetch risk data')
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [])

  const mappedLocations = locations.filter(
    (location) =>
      Array.isArray(location.position) &&
      location.position.length === 2 &&
      Number.isFinite(Number(location.position[0])) &&
      Number.isFinite(Number(location.position[1]))
  )

  const filteredLocations = mappedLocations.filter((location) =>
    location.district
      ?.toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  )

  const focusDistrict =
    filteredLocations.length === 1
      ? filteredLocations[0].district
      : selectedDistrict

  return (
    <div className="risk-map">
      <div className="risk-map-header">
        <div className="risk-map-search">
          <input
            type="text"
            placeholder="Search district..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div>
          <h3>Geographical Risk Overview</h3>
          <p>
            {selectedDistrict
              ? `Highlighted district: ${selectedDistrict}`
              : 'District-wise landslide risk locations'}
          </p>
        </div>

        <span className="risk-map-count">
          {filteredLocations.length} Locations
        </span>
      </div>

      {loading ? (
        <div className="risk-map-state">
          <span className="risk-map-loader"></span>
          <p>Loading risk locations...</p>
        </div>
      ) : error ? (
        <div className="risk-map-state risk-map-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <MapContainer
            center={[26.5, 82.5]}
            zoom={4.6}
            scrollWheelZoom={false}
            className="risk-map-view"
          >
            <MapFocus selectedDistrict={focusDistrict} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredLocations.map((location) => {
              const level = location.risk_level || 'Moderate'
              const color = riskColors[level] || riskColors.Moderate
              const isSelected = location.district === selectedDistrict

              return (
                <CircleMarker
                  center={location.position}
                  key={location.id}
                  radius={isSelected ? 14 : 8}
                  pathOptions={{
                    color: isSelected ? '#111827' : color,
                    fillColor: color,
                    fillOpacity: isSelected ? 1 : 0.65,
                    weight: isSelected ? 4 : 2,
                  }}
                >
                  <Popup>
                    <div className="risk-map-popup">
                      <strong>{location.district}</strong>

                      {isSelected && (
                        <p>
                          <b>✓ Your selected district</b>
                        </p>
                      )}

                      <p>
                        Risk level: <b>{level}</b>
                      </p>

                      <p>
                        Probability:{' '}
                        <b>
                          {(Number(location.probability) * 100).toFixed(1)}%
                        </b>
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>

          {locations.length === 0 && (
            <p className="risk-map-notice">
              No risk predictions available yet.
            </p>
          )}

          {locations.length > 0 && filteredLocations.length === 0 && (
            <p className="risk-map-notice">
              No district found matching "{searchTerm}".
            </p>
          )}

          {locations.length > mappedLocations.length && (
            <p className="risk-map-notice">
              {locations.length - mappedLocations.length} location(s)
              have no coordinates configured.
            </p>
          )}

          <div className="risk-map-legend">
            <span className="legend-title">Risk Level:</span>

            {Object.entries(riskColors).map(([level, color]) => (
              <span className="legend-item" key={level}>
                <span
                  className="legend-dot"
                  style={{ backgroundColor: color }}
                ></span>
                {level}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RiskMap
