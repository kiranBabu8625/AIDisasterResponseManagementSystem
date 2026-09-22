import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

const ZONE_ALLOCATIONS = {
  'Z-101': { food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100 },
  'Z-102': { food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700 },
  'Z-103': { food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500 },
  'Z-104': { food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400 },
}

const RESOURCE_OPTIONS = ['food_packets', 'water_liters', 'medical_kits', 'shelter_capacity']

function ResourceTracking() {
  const [zoneId, setZoneId] = useState('Z-101')
  const [resource, setResource] = useState('food_packets')
  const [amount, setAmount] = useState(500)
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(false)

  const refreshStatuses = () => {
    axios.get(`${API_BASE}/tracking/zones/status`)
      .then((response) => setStatuses(response.data.zones))
      .catch(() => {})
  }

  const logDelivery = () => {
    setLoading(true)
    // Make sure the zone's allocation is registered first (safe to call repeatedly)
    axios.post(`${API_BASE}/tracking/register-allocation`, {
      zone_id: zoneId,
      allocated: ZONE_ALLOCATIONS[zoneId],
    })
      .then(() => axios.post(`${API_BASE}/tracking/log-delivery`, {
        zone_id: zoneId,
        resource: resource,
        amount: Number(amount),
      }))
      .then(() => {
        refreshStatuses()
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>FIELD DELIVERY LOGGING</div>
      <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Field Delivery Logging</div>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} style={{ background: '#eef1f5', color: '#1a202c', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem' }}>
          {Object.keys(ZONE_ALLOCATIONS).map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={resource} onChange={(e) => setResource(e.target.value)} style={{ background: '#eef1f5', color: '#1a202c', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem' }}>
          {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ background: '#eef1f5', color: '#1a202c', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem', width: '100px' }}
        />
        <button
          onClick={logDelivery}
          disabled={loading}
          style={{ background: '#22c55e', color: '#f4f6f9', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {loading ? 'Logging...' : 'Log Delivery'}
        </button>
      </div>

      {statuses.map((zs) => (
        <div key={zs.zone_id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#eef1f5', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <div style={{ color: '#1a202c', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{zs.zone_id}</div>
          {Object.entries(zs.resources).map(([res, data]) => (
            <div key={res} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>
              <span>{res}</span>
              <span>{data.delivered} / {data.allocated} ({data.pct_complete}%)</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ResourceTracking
