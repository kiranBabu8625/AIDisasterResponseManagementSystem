function CriticalAlertsSummary({ allocation, zones, onViewAll }) {
  if (!allocation || !zones) return null

  const alerts = []
  allocation.zones.forEach((z) => {
    Object.entries(z.fulfillment_pct).forEach(([resource, pct]) => {
      if (pct < 60) {
        const demand = zones.find((zone) => zone.zone_id === z.zone_id)[resource]
        const shortage = Math.round(demand - z.allocated[resource])
        alerts.push({
          zone_id: z.zone_id,
          resource: resource.replace('_', ' '),
          shortage,
          severity: pct < 30 ? 'CRITICAL' : 'WARNING',
        })
      }
    })
  })

  alerts.sort((a, b) => b.shortage - a.shortage)
  const topAlerts = alerts.slice(0, 3)

  if (topAlerts.length === 0) {
    return (
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>CRITICAL ALERTS</div>
        <div style={{ color: '#22c55e', fontSize: '0.85rem' }}>No critical alerts — all zones above 60% fulfillment.</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em' }}>CRITICAL ALERTS</div>
        {onViewAll && (
          <span onClick={onViewAll} style={{ color: '#3b82f6', fontSize: '0.78rem', cursor: 'pointer' }}>
            View all alerts →
          </span>
        )}
      </div>
      {topAlerts.map((a, i) => (
        <div key={i} style={{ color: '#1a202c', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
          <span style={{ color: a.severity === 'CRITICAL' ? '#ef4444' : '#f5a623' }}>
            {a.severity === 'CRITICAL' ? '🔴' : '🟠'}
          </span>{' '}
          {a.zone_id} — {a.resource} shortage {a.shortage.toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default CriticalAlertsSummary
