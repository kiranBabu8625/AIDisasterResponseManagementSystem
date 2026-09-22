import { useState } from 'react'
import axios from 'axios'
import InventoryTable from './InventoryTable.jsx'

const API_BASE = 'http://127.0.0.1:8000'

const SAMPLE_ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100 },
  { zone_id: 'Z-102', severity_weight: 0.5, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700 },
  { zone_id: 'Z-103', severity_weight: 0.95, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500 },
  { zone_id: 'Z-104', severity_weight: 0.2, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400 },
]

const SAMPLE_RESOURCES = {
  food_packets: 6000,
  water_liters: 10000,
  medical_kits: 700,
  shelter_capacity: 1500,
}

function AllocationForm() {
  const [zones, setZones] = useState(SAMPLE_ZONES)
  const [availableResources, setAvailableResources] = useState(SAMPLE_RESOURCES)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runAllocation = () => {
    setLoading(true)
    setError(null)
    axios.post(`${API_BASE}/allocation/allocate-resources`, {
      zones: zones,
      available_resources: availableResources,
    })
      .then((response) => {
        setResult(response.data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Allocation failed. Check that the backend is running.')
        setLoading(false)
      })
  }

  return (
    <div style={{ background: '#ffffff', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>INVENTORY CONTROL</div>
      <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Inventory & Resource Allocation</div>

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        Using {zones.length} sample zones. Click any value below to adjust available stock.
      </p>

      <InventoryTable resources={availableResources} onChange={setAvailableResources} />

      <button
        onClick={runAllocation}
        disabled={loading}
        style={{
          marginTop: '1rem', padding: '0.6rem 1.1rem', cursor: 'pointer',
          background: '#ef4444', color: 'white', border: 'none',
          borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem',
        }}
      >
        {loading ? 'Running...' : 'Run Allocation'}
      </button>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {result && (
        <table style={{ marginTop: '1rem', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#64748b', textAlign: 'left' }}>Zone</th>
              <th style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#64748b', textAlign: 'left' }}>Food Packets</th>
              <th style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#64748b', textAlign: 'left' }}>Water (L)</th>
              <th style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#64748b', textAlign: 'left' }}>Medical Kits</th>
              <th style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#64748b', textAlign: 'left' }}>Shelter</th>
            </tr>
          </thead>
          <tbody>
            {result.zones.map((zone) => (
              <tr key={zone.zone_id}>
                <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#1a202c' }}>{zone.zone_id}</td>
                <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#1a202c' }}>
                  {zone.allocated.food_packets} ({zone.fulfillment_pct.food_packets}%)
                </td>
                <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#1a202c' }}>
                  {zone.allocated.water_liters} ({zone.fulfillment_pct.water_liters}%)
                </td>
                <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#1a202c' }}>
                  {zone.allocated.medical_kits} ({zone.fulfillment_pct.medical_kits}%)
                </td>
                <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', color: '#1a202c' }}>
                  {zone.allocated.shelter_capacity} ({zone.fulfillment_pct.shelter_capacity}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AllocationForm
