import { useState, useEffect } from 'react'
import axios from 'axios'
import StatCard from './StatCard.jsx'
import MissionsPanel from './MissionsPanel.jsx'
import PriorityOverride from './PriorityOverride.jsx'
import ResourceTracking from './ResourceTracking.jsx'
import ZoneMap from './ZoneMap.jsx'
import DemandVsAllocation from './DemandVsAllocation.jsx'
import AIRecommendationBanner from './AIRecommendationBanner.jsx'
import DataSourcesStatus from './DataSourcesStatus.jsx'
import CriticalAlertsSummary from './CriticalAlertsSummary.jsx'
import ZoneActionModal from './ZoneActionModal.jsx'

const M3_API = 'http://127.0.0.1:8000'
const PREDICTION_API = 'http://127.0.0.1:8010'

const SAMPLE_ZONES = [
  { zone_id: 'Z-101', severity_weight: 0.9, food_packets: 5200, water_liters: 8400, medical_kits: 560, shelter_capacity: 1100, affected_population: 8420 },
  { zone_id: 'Z-102', severity_weight: 0.5, food_packets: 3100, water_liters: 5200, medical_kits: 320, shelter_capacity: 700, affected_population: 4600 },
  { zone_id: 'Z-103', severity_weight: 0.95, food_packets: 7300, water_liters: 11600, medical_kits: 820, shelter_capacity: 1500, affected_population: 5400 },
  { zone_id: 'Z-104', severity_weight: 0.2, food_packets: 1800, water_liters: 3000, medical_kits: 150, shelter_capacity: 400, affected_population: 1200 },
]

const SAMPLE_RESOURCES = {
  food_packets: 10000,
  water_liters: 18000,
  medical_kits: 1200,
  shelter_capacity: 2500,
}

function Dashboard({ onNavigate }) {
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionResult, setActionResult] = useState(null)

  useEffect(() => {
    axios.post(`${M3_API}/allocation/allocate-resources`, {
      zones: SAMPLE_ZONES.map(({ affected_population, ...z }) => z),
      available_resources: SAMPLE_RESOURCES,
    })
      .then((response) => {
        setAllocation(response.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalZones = SAMPLE_ZONES.length
  const criticalZones = SAMPLE_ZONES.filter((z) => z.severity_weight >= 0.7).length
  const totalAffectedPopulation = SAMPLE_ZONES.reduce((sum, z) => sum + z.affected_population, 0)

  let resourceGap = 0
  if (allocation) {
    const allPct = allocation.zones.flatMap((z) => Object.values(z.fulfillment_pct))
    const avgPct = allPct.reduce((a, b) => a + b, 0) / allPct.length
    resourceGap = Math.round(100 - avgPct)
  }

  const handleZoneAction = (actionType, zoneId) => {
    if (actionType === 'details') {
      onNavigate && onNavigate('Disaster Zones')
      return
    }

    if (actionType === 'predict') {
      // This zone_id (e.g. Z-101) is sample data, not in the real DB.
      // Try the real endpoint anyway and show the honest result either way.
      axios.post(`${PREDICTION_API}/predict/demand/${zoneId}`)
        .then((response) => {
          const p = response.data.predictions
          setActionResult({
            title: `Prediction: ${zoneId}`,
            type: 'success',
            rows: [
              { label: 'Food', value: `${p.food.prediction} pkts` },
              { label: 'Water', value: `${p.water.prediction} L` },
              { label: 'Medical', value: `${p.medical.prediction} kits` },
              { label: 'Shelter', value: `${p.shelter.prediction} units` },
            ],
          })
        })
        .catch(() => {
          setActionResult({
            title: `Prediction: ${zoneId}`,
            type: 'error',
            message: `${zoneId} is sample dashboard data and doesn't exist in the real database. Real ML predictions are available for actual zones (Z0001-Z0004) on the "Live Data" page.`,
          })
        })
      return
    }

    if (actionType === 'allocate') {
      axios.post(`${M3_API}/allocation/allocate-resources`, {
        zones: SAMPLE_ZONES.map(({ affected_population, ...z }) => z),
        available_resources: SAMPLE_RESOURCES,
      })
        .then((response) => {
          const zoneResult = response.data.zones.find((z) => z.zone_id === zoneId)
          setActionResult({
            title: `Allocation: ${zoneId}`,
            type: 'success',
            rows: [
              { label: 'Food', value: `${zoneResult.allocated.food_packets} (${zoneResult.fulfillment_pct.food_packets}%)` },
              { label: 'Water', value: `${zoneResult.allocated.water_liters} (${zoneResult.fulfillment_pct.water_liters}%)` },
              { label: 'Medical', value: `${zoneResult.allocated.medical_kits} (${zoneResult.fulfillment_pct.medical_kits}%)` },
              { label: 'Shelter', value: `${zoneResult.allocated.shelter_capacity} (${zoneResult.fulfillment_pct.shelter_capacity}%)` },
            ],
          })
        })
        .catch(() => {
          setActionResult({ title: `Allocation: ${zoneId}`, type: 'error', message: 'Could not reach the allocation API. Check the backend is running on port 8000.' })
        })
    }
  }

  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Command Dashboard</h1>

      {!loading && <AIRecommendationBanner allocation={allocation} zones={SAMPLE_ZONES} />}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Zones" value={String(totalZones).padStart(2, '0')} sublabel="Monitored disaster zones" />
        <StatCard label="Critical Zones" value={String(criticalZones).padStart(2, '0')} sublabel="Require immediate response" accent="#ef4444" />
        <StatCard label="Affected People" value={totalAffectedPopulation.toLocaleString()} sublabel="Across all active zones" accent="#3b82f6" />
        <StatCard label="Resource Gap" value={loading ? '...' : `${resourceGap}%`} sublabel="Current demand shortage" accent="#f5a623" />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1.4, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>SPATIAL OVERVIEW</div>
          <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Disaster Impact Map</div>
          <ZoneMap onZoneAction={handleZoneAction} />
        </div>

        <div style={{ flex: 1, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>ALLOCATION RESULT</div>
          <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Demand vs. Allocated</div>

          {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
          {!loading && <DemandVsAllocation zones={SAMPLE_ZONES} allocation={allocation} />}
        </div>
      </div>

      {!loading && (
        <div style={{ marginTop: '1.5rem' }}>
          <CriticalAlertsSummary
            allocation={allocation}
            zones={SAMPLE_ZONES}
            onViewAll={() => onNavigate && onNavigate('Alerts')}
          />
        </div>
      )}

      <PriorityOverride />
      <MissionsPanel />
      <ResourceTracking />

      <DataSourcesStatus />

      <ZoneActionModal result={actionResult} onClose={() => setActionResult(null)} />
    </div>
  )
}

export default Dashboard
