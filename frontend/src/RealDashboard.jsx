import { useState, useEffect } from 'react'
import axios from 'axios'
import StatCard from './StatCard.jsx'

const M3_API = 'http://127.0.0.1:8000'
const PREDICTION_API = 'http://127.0.0.1:8010'

const RESOURCE_MAP = {
  food: 'food_packets',
  water: 'water_liters',
  medical: 'medical_kits',
  shelter: 'shelter_capacity',
}

const AVAILABLE_RESOURCES = {
  food_packets: 10000,
  water_liters: 18000,
  medical_kits: 1200,
  shelter_capacity: 2500,
}

function RealDashboard() {
  const [zones, setZones] = useState([])
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${M3_API}/zones/list`)
      .then(async (zonesResponse) => {
        const rawZones = zonesResponse.data.zones

        const zonesWithDemand = await Promise.all(
          rawZones.map(async (z) => {
            const predictionResponse = await axios.post(`${PREDICTION_API}/predict/demand/${z.zone_id}`)
            const predictions = predictionResponse.data.predictions

            const mapped = { zone_id: z.zone_id, severity_weight: z.severity_score / 100 }
            Object.entries(RESOURCE_MAP).forEach(([shortName, longName]) => {
              mapped[longName] = predictions[shortName].prediction
            })
            return { ...mapped, latitude: z.latitude, longitude: z.longitude, severity_score: z.severity_score, severity_level: z.severity_level }
          })
        )

        setZones(zonesWithDemand)

        const allocationResponse = await axios.post(`${M3_API}/allocation/allocate-resources`, {
          zones: zonesWithDemand.map(({ zone_id, severity_weight, food_packets, water_liters, medical_kits, shelter_capacity }) =>
            ({ zone_id, severity_weight, food_packets, water_liters, medical_kits, shelter_capacity })),
          available_resources: AVAILABLE_RESOURCES,
        })
        setAllocation(allocationResponse.data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Could not load real zone/prediction data. Check both backend servers are running (port 8000 and 8010).')
        setLoading(false)
      })
  }, [])

  const totalZones = zones.length
  const criticalZones = zones.filter((z) => z.severity_score >= 80).length

  let resourceGap = 0
  if (allocation) {
    const allPct = allocation.zones.flatMap((z) => Object.values(z.fulfillment_pct))
    const avgPct = allPct.reduce((a, b) => a + b, 0) / allPct.length
    resourceGap = Math.round(100 - avgPct)
  }

  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Command Dashboard — Live Data</h1>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Pulling real zones from your database and real predictions from your trained ML model.
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
      {loading && !error && <div style={{ color: '#94a3b8' }}>Loading real zone and prediction data...</div>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard label="Total Zones" value={String(totalZones).padStart(2, '0')} sublabel="From live database" />
            <StatCard label="Critical Zones" value={String(criticalZones).padStart(2, '0')} sublabel="Severity score ≥ 80" accent="#ef4444" />
            <StatCard label="Resource Gap" value={`${resourceGap}%`} sublabel="Current demand shortage" accent="#f5a623" />
          </div>

          {zones.map((z) => (
            <div key={z.zone_id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 700 }}>{z.zone_id}</div>
                <div style={{ color: z.severity_score >= 80 ? '#ef4444' : '#f5a623', fontWeight: 600 }}>{z.severity_level} ({z.severity_score})</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Predicted: {Math.round(z.food_packets)} food · {Math.round(z.water_liters)} water · {Math.round(z.medical_kits)} medical · {Math.round(z.shelter_capacity)} shelter
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default RealDashboard
