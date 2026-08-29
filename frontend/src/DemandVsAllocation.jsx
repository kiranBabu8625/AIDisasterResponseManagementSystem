function statusFor(pct) {
  if (pct < 50) return { label: 'Critical', color: '#ef4444' }
  if (pct < 80) return { label: 'Warning', color: '#f5a623' }
  return { label: 'Good', color: '#22c55e' }
}

function DemandVsAllocation({ zones, allocation }) {
  if (!zones || !allocation) return null

  const resources = [
    { key: 'food_packets', label: 'Food Packets', unit: 'pkts' },
    { key: 'water_liters', label: 'Water', unit: 'L' },
    { key: 'medical_kits', label: 'Medical Kits', unit: 'kits' },
    { key: 'shelter_capacity', label: 'Shelter', unit: 'units' },
  ]

  const totalDemand = {}
  zones.forEach((z) => {
    resources.forEach((r) => {
      totalDemand[r.key] = (totalDemand[r.key] || 0) + z[r.key]
    })
  })

  const totalAllocated = {}
  allocation.zones.forEach((z) => {
    resources.forEach((r) => {
      totalAllocated[r.key] = (totalAllocated[r.key] || 0) + z.allocated[r.key]
    })
  })

  return (
    <div>
      {resources.map((r) => {
        const demand = totalDemand[r.key] || 0
        const allocated = totalAllocated[r.key] || 0
        const maxVal = Math.max(demand, allocated, 1)
        const demandPct = (demand / maxVal) * 100
        const allocatedPct = (allocated / maxVal) * 100
        const gap = demand - allocated
        const coveragePct = demand > 0 ? Math.round((allocated / demand) * 100) : 100
        const status = statusFor(coveragePct)

        return (
          <div key={r.key} style={{ marginBottom: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: 600 }}>{r.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{coveragePct}% coverage</span>
                <span style={{
                  color: status.color, fontSize: '0.7rem', fontWeight: 700,
                  border: `1px solid ${status.color}`, borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>{status.label}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', width: '58px', flexShrink: 0 }}>Demand</span>
              <div style={{ flex: 1, background: '#eef1f5', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${demandPct}%`, background: '#94a3b8', height: '100%' }} />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', width: '70px', textAlign: 'right', flexShrink: 0 }}>
                {Math.round(demand)} {r.unit}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', width: '58px', flexShrink: 0 }}>Allocated</span>
              <div style={{ flex: 1, background: '#eef1f5', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${allocatedPct}%`, background: status.color, height: '100%' }} />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.7rem', width: '70px', textAlign: 'right', flexShrink: 0 }}>
                {Math.round(allocated)} {r.unit}
              </span>
            </div>

            {gap > 0 && (
              <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', textAlign: 'right' }}>
                Shortage: {Math.round(gap)} {r.unit}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DemandVsAllocation
