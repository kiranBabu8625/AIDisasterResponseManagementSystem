const ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100, latitude: 17.4400, longitude: 78.4983 },
  { zone_id: 'Z-102', severity_weight: 0.5, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700, latitude: 17.3616, longitude: 78.4747 },
  { zone_id: 'Z-103', severity_weight: 0.95, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500, latitude: 17.4239, longitude: 78.4738 },
  { zone_id: 'Z-104', severity_weight: 0.2, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400, latitude: 17.4000, longitude: 78.5100 },
]

function severityLabel(w) {
  if (w >= 0.8) return { text: 'CRITICAL', color: '#ef4444' }
  if (w >= 0.5) return { text: 'MODERATE', color: '#f5a623' }
  return { text: 'LOW', color: '#22c55e' }
}

function DisasterZonesView() {
  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Disaster Zones</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {ZONES.map((z) => {
          const sev = severityLabel(z.severity_weight)
          return (
            <div key={z.zone_id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: '#1a202c', fontSize: '1.2rem', fontWeight: 700 }}>{z.zone_id}</div>
                <span style={{
                  color: sev.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                  border: `1px solid ${sev.color}`, borderRadius: '4px', padding: '0.2rem 0.5rem',
                }}>{sev.text}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '1rem' }}>
                📍 {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <Row label="Food Packets" value={z.food_packets} />
                <Row label="Water (L)" value={z.water_liters} />
                <Row label="Medical Kits" value={z.medical_kits} />
                <Row label="Shelter Capacity" value={z.shelter_capacity} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#1a202c', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

export default DisasterZonesView
