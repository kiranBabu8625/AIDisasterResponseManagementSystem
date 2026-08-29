const TEAM_CONTACTS = {
  'Team Alpha': { driver: 'R. Kumar', phone: '+91 98765-11111', vehicle: 'Truck TS-09 AB 1234' },
  'Team Bravo': { driver: 'S. Reddy', phone: '+91 98765-22222', vehicle: 'Truck TS-09 CD 5678' },
}

// Rough per-zone unit demand for a mock manifest — in a real system this
// would come from the actual allocation result for that mission's zones.
const ZONE_MANIFEST = {
  'Z-101': { food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100 },
  'Z-102': { food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700 },
  'Z-103': { food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500 },
  'Z-104': { food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400 },
}

function estimateETA(distanceKm, status) {
  if (status === 'completed') return 'Arrived'
  // Rough estimate: assume 30 km/h average in disaster conditions
  const minutes = Math.round((distanceKm / 30) * 60)
  return `~${minutes} min`
}

function MissionDrawer({ mission, onClose }) {
  if (!mission) return null

  const contact = TEAM_CONTACTS[mission.team_name] || { driver: 'Unassigned', phone: '—', vehicle: '—' }
  const eta = estimateETA(mission.total_distance_km, mission.status)

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '380px',
        background: '#ffffff', borderLeft: '1px solid #e2e8f0', zIndex: 50,
        padding: '1.5rem', boxSizing: 'border-box', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: '#1a202c', fontSize: '1.2rem', fontWeight: 700 }}>{mission.mission_id}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <Section title="Status">
          <span style={{
            color: mission.status === 'completed' ? '#22c55e' : mission.status === 'in_progress' ? '#3b82f6' : '#f5a623',
            fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase',
          }}>
            {mission.status.replace('_', ' ')}
          </span>
        </Section>

        <Section title="Vehicle Assignment">
          <Row label="Team" value={mission.team_name} />
          <Row label="Vehicle" value={contact.vehicle} />
          <Row label="Driver" value={contact.driver} />
          <Row label="Contact" value={contact.phone} />
        </Section>

        <Section title="Route">
          <Row label="Zones" value={mission.zones.join(' → ')} />
          <Row label="Total Distance" value={`${mission.total_distance_km} km`} />
          <Row label="Estimated Arrival" value={eta} />
        </Section>

        <Section title="Supply Manifest">
          {mission.zones.map((zoneId) => {
            const manifest = ZONE_MANIFEST[zoneId]
            if (!manifest) return null
            return (
              <div key={zoneId} style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{zoneId}</div>
                <Row label="Food" value={`${manifest.food_packets} pkts`} />
                <Row label="Water" value={`${manifest.water_liters} L`} />
                <Row label="Medical" value={`${manifest.medical_kits} kits`} />
                <Row label="Shelter" value={`${manifest.shelter_capacity} units`} />
              </div>
            )
          })}
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>{title.toUpperCase()}</div>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#1a202c', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default MissionDrawer
