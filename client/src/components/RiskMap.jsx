import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const locations = [
  {
    name: 'Dima Hasao',
    risk: 'High',
    position: [25.35, 93.02],
  },
  {
    name: 'East Khasi Hills',
    risk: 'Moderate',
    position: [25.3, 91.8],
  },
  {
    name: 'Kohima',
    risk: 'Low',
    position: [25.67, 94.1],
  },
]

function RiskMap() {
  return (
    <div className="risk-map">
      <MapContainer
        center={[25.7, 93.1]}
        zoom={7}
        scrollWheelZoom={false}
        className="risk-map-view"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker position={location.position} key={location.name}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              Risk level: {location.risk}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default RiskMap