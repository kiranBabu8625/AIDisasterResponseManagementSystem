import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadowUrl,
})

const DEPOT = { name: 'Central Warehouse', latitude: 17.3850, longitude: 78.4867 }

const ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, latitude: 17.4400, longitude: 78.4983, disaster_type: 'Earthquake', affected_population: 8420, vulnerability_score: 72, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100 },
  { zone_id: 'Z-102', severity_weight: 0.5, latitude: 17.3616, longitude: 78.4747, disaster_type: 'Flood', affected_population: 4600, vulnerability_score: 45, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700 },
  { zone_id: 'Z-103', severity_weight: 0.95, latitude: 17.4239, longitude: 78.4738, disaster_type: 'Cyclone', affected_population: 5400, vulnerability_score: 81, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500 },
  { zone_id: 'Z-104', severity_weight: 0.2, latitude: 17.4000, longitude: 78.5100, disaster_type: 'Minor Flooding', affected_population: 1200, vulnerability_score: 25, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400 },
]

function severityColor(w) {
  if (w >= 0.8) return '#ef4444'
  if (w >= 0.5) return '#f5a623'
  return '#22c55e'
}

function severityLabel(w) {
  if (w >= 0.8) return 'CRITICAL'
  if (w >= 0.5) return 'MODERATE'
  return 'LOW'
}

function ZoneMap({ routes, onZoneAction }) {
  const routeLines = (routes || []).map((route) => {
    const points = [[DEPOT.latitude, DEPOT.longitude]]
    route.stops_in_order.forEach((zoneId) => {
      const zone = ZONES.find((z) => z.zone_id === zoneId)
      if (zone) points.push([zone.latitude, zone.longitude])
    })
    return points
  })

  const routeColors = ['#3b82f6', '#22c55e', '#f5a623', '#a855f7']

  return (
    <MapContainer
      center={[DEPOT.latitude, DEPOT.longitude]}
      zoom={11}
      style={{ height: '400px', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />

      <Marker position={[DEPOT.latitude, DEPOT.longitude]}>
        <Popup>
          <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '160px' }}>
            <strong>{DEPOT.name}</strong>
            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>Central dispatch depot</div>
          </div>
        </Popup>
      </Marker>

      {ZONES.map((z) => (
        <CircleMarker
          key={z.zone_id}
          center={[z.latitude, z.longitude]}
          radius={12}
          pathOptions={{ color: severityColor(z.severity_weight), fillColor: severityColor(z.severity_weight), fillOpacity: 0.6 }}
        >
          <Popup>
            <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <strong style={{ fontSize: '1rem' }}>{z.zone_id}</strong>
                <span style={{
                  color: severityColor(z.severity_weight), fontWeight: 700, fontSize: '0.7rem',
                  border: `1px solid ${severityColor(z.severity_weight)}`, borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>{severityLabel(z.severity_weight)}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.5rem' }}>
                {z.disaster_type} · Severity {Math.round(z.severity_weight * 100)}/100
              </div>

              <div style={{ fontSize: '0.8rem', color: '#333', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                <div>Affected Population: <strong>{z.affected_population.toLocaleString()}</strong></div>
                <div>Vulnerability Score: <strong>{z.vulnerability_score}</strong></div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#333', lineHeight: '1.5', borderTop: '1px solid #eee', paddingTop: '0.4rem' }}>
                <div><strong>Predicted needs:</strong></div>
                <div>Food: {z.food_packets} pkts</div>
                <div>Water: {z.water_liters} L</div>
                <div>Medical: {z.medical_kits} kits</div>
                <div>Shelter: {z.shelter_capacity} units</div>
              </div>

              <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button
                  onClick={() => onZoneAction && onZoneAction('predict', z.zone_id)}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  Predict Demand
                </button>
                <button
                  onClick={() => onZoneAction && onZoneAction('allocate', z.zone_id)}
                  style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  Allocate Resources
                </button>
                <button
                  onClick={() => onZoneAction && onZoneAction('details', z.zone_id)}
                  style={{ background: 'transparent', color: '#555', border: '1px solid #ccc', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {routeLines.map((points, i) => (
        <Polyline key={i} positions={points} pathOptions={{ color: routeColors[i % routeColors.length], weight: 3 }} />
      ))}
    </MapContainer>
  )
}

export default ZoneMap
