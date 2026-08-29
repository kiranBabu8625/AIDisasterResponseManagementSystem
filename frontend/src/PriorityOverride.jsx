import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

const DEPOT = { name: 'Central Warehouse', latitude: 17.3850, longitude: 78.4867 }

const FULL_ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100, latitude: 17.4400, longitude: 78.4983 },
  { zone_id: 'Z-102', severity_weight: 0.5, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700, latitude: 17.3616, longitude: 78.4747 },
  { zone_id: 'Z-103', severity_weight: 0.95, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500, latitude: 17.4239, longitude: 78.4738 },
  { zone_id: 'Z-104', severity_weight: 0.2, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400, latitude: 17.4000, longitude: 78.5100 },
]

const AVAILABLE_RESOURCES = {
  food_packets: 10000,
  water_liters: 18000,
  medical_kits: 1200,
  shelter_capacity: 2500,
}

function PriorityOverride() {
  const [loading, setLoading] = useState(null)
  const [result, setResult] = useState(null)

  const escalateZone = (zoneId) => {
    setLoading(zoneId)
    setResult(null)
    axios.post(`${API_BASE}/override/override-priority`, {
      zones: FULL_ZONES,
      available_resources: AVAILABLE_RESOURCES,
      depot: DEPOT,
      num_vehicles: 2,
      overrides: [
        { zone_id: zoneId, new_severity_weight: 0.98, reason: 'Manually escalated from dashboard' },
      ],
    })
      .then((response) => {
        setResult(response.data)
        setLoading(null)
      })
      .catch(() => setLoading(null))
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>PRIORITY OVERRIDES</div>
      <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Manual Priority Adjustment</div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>
        Coordinator override — escalate a zone if a new field report changes the picture. Instantly re-runs allocation and routing.
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
        {FULL_ZONES.map((z) => (
          <button
            key={z.zone_id}
            onClick={() => escalateZone(z.zone_id)}
            disabled={loading === z.zone_id}
            style={{
              background: 'transparent', color: '#ef4444', border: '1px solid #ef4444',
              borderRadius: '6px', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            {loading === z.zone_id ? 'Escalating...' : `Escalate ${z.zone_id}`}
          </button>
        ))}
      </div>

      {result && (
        <div style={{ background: '#eef1f5', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
          <div style={{ color: '#f5a623', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem' }}>
            Override applied: {result.override_log[0].zone_id} severity {result.override_log[0].old_severity_weight} → {result.override_log[0].new_severity_weight}
          </div>
          {result.updated_allocation.zones.map((z) => (
            <div key={z.zone_id} style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              {z.zone_id}: food {z.fulfillment_pct.food_packets}% · water {z.fulfillment_pct.water_liters}% · medical {z.fulfillment_pct.medical_kits}% · shelter {z.fulfillment_pct.shelter_capacity}%
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PriorityOverride
