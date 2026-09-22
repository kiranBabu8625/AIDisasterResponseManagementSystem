import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

const SAMPLE_ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100 },
  { zone_id: 'Z-102', severity_weight: 0.5, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700 },
  { zone_id: 'Z-103', severity_weight: 0.95, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500 },
  { zone_id: 'Z-104', severity_weight: 0.2, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400 },
]

const SAMPLE_RESOURCES = { food_packets: 10000, water_liters: 18000, medical_kits: 1200, shelter_capacity: 2500 }

const RESOURCE_LABELS = {
  food_packets: { name: 'food', unit: 'packets' },
  water_liters: { name: 'water', unit: 'liters' },
  medical_kits: { name: 'medical kits', unit: 'kits' },
  shelter_capacity: { name: 'shelter space', unit: 'units' },
}

function buildMessage(zone_id, resource, allocated, demand, pct) {
  const meta = RESOURCE_LABELS[resource]
  const missing = Math.round(demand - allocated)

  if (pct === 0) {
    return `Zone ${zone_id} has received NO ${meta.name} yet — all ${missing.toLocaleString()} ${meta.unit} still needed.`
  }
  return `Zone ${zone_id} is short on ${meta.name} — only ${Math.round(allocated).toLocaleString()} of ${Math.round(demand).toLocaleString()} ${meta.unit} delivered so far. ${missing.toLocaleString()} ${meta.unit} still needed.`
}

function AlertsView() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState({})

  useEffect(() => {
    axios.post(`${API_BASE}/allocation/allocate-resources`, {
      zones: SAMPLE_ZONES,
      available_resources: SAMPLE_RESOURCES,
    }).then((response) => {
      const generated = []
      response.data.zones.forEach((z) => {
        const zoneDemand = SAMPLE_ZONES.find((sz) => sz.zone_id === z.zone_id)
        Object.entries(z.fulfillment_pct).forEach(([resource, pct]) => {
          if (pct < 60) {
            generated.push({
              zone_id: z.zone_id,
              resource,
              pct,
              message: buildMessage(z.zone_id, resource, z.allocated[resource], zoneDemand[resource], pct),
              severity: pct < 30 ? 'URGENT' : 'NEEDS ATTENTION',
            })
          }
        })
      })
      setAlerts(generated)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const colorFor = (sev) => (sev === 'URGENT' ? '#ef4444' : '#f5a623')

  const handleReallocate = (alert, i) => {
    setActionMsg((prev) => ({ ...prev, [i]: `Reallocation request sent for ${alert.zone_id}.` }))
  }

  const handleViewZone = (alert, i) => {
    setActionMsg((prev) => ({ ...prev, [i]: `Opening details for ${alert.zone_id}... (check Disaster Zones page)` }))
  }

  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Alerts</h1>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        These are automatically generated whenever a zone isn't getting enough of what it needs.
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Checking current supply levels...</div>}
      {!loading && alerts.length === 0 && <div style={{ color: '#22c55e' }}>Good news — every zone is getting at least 60% of what it needs.</div>}

      {alerts.map((a, i) => (
        <div key={i} style={{
          background: '#ffffff', border: `1px solid ${colorFor(a.severity)}`,
          borderRadius: '8px', padding: '1.1rem 1.25rem', marginBottom: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <span style={{
                color: colorFor(a.severity), fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em',
                border: `1px solid ${colorFor(a.severity)}`, borderRadius: '4px', padding: '0.1rem 0.5rem',
              }}>
                {a.severity}
              </span>
              <div style={{ color: '#1a202c', fontSize: '0.92rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                {a.message}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={() => handleReallocate(a, i)}
                style={{
                  background: '#ef4444', color: 'white', border: 'none',
                  borderRadius: '4px', padding: '0.45rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                }}
              >
                Fix This Now
              </button>
              <button
                onClick={() => handleViewZone(a, i)}
                style={{
                  background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0',
                  borderRadius: '4px', padding: '0.45rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem',
                }}
              >
                See Zone {a.zone_id}
              </button>
            </div>
          </div>
          {actionMsg[i] && (
            <div style={{ color: '#3b82f6', fontSize: '0.78rem', marginTop: '0.6rem' }}>{actionMsg[i]}</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AlertsView
