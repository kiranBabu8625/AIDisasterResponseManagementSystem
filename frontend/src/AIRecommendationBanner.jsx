const RESOURCE_LABELS = {
  food_packets: { label: 'Food', unit: 'packets' },
  water_liters: { label: 'Water', unit: 'liters' },
  medical_kits: { label: 'Medical Kits', unit: 'kits' },
  shelter_capacity: { label: 'Shelter', unit: 'units' },
}

function generateRecommendation(allocation, zones) {
  if (!allocation || !zones) return null

  // Find the worst-off zone/resource (lowest fulfillment %)
  let worst = null
  allocation.zones.forEach((z) => {
    Object.entries(z.fulfillment_pct).forEach(([resource, pct]) => {
      if (!worst || pct < worst.pct) {
        worst = { zone_id: z.zone_id, resource, pct, allocated: z.allocated[resource] }
      }
    })
  })

  if (!worst || worst.pct >= 90) {
    return { type: 'ok', text: 'All zones are at 90%+ fulfillment. No urgent reallocation needed.' }
  }

  const worstZoneDemand = zones.find((z) => z.zone_id === worst.zone_id)[worst.resource]
  const shortageAmount = Math.round(worstZoneDemand - worst.allocated)

  // Find the best-off zone for the SAME resource, to suggest pulling from it
  let best = null
  allocation.zones.forEach((z) => {
    if (z.zone_id === worst.zone_id) return
    const pct = z.fulfillment_pct[worst.resource]
    if (!best || pct > best.pct) {
      best = { zone_id: z.zone_id, pct, allocated: z.allocated[worst.resource] }
    }
  })

  const meta = RESOURCE_LABELS[worst.resource] || { label: worst.resource, unit: '' }

  if (best && best.pct > worst.pct + 20) {
    const bestZoneDemand = zones.find((z) => z.zone_id === best.zone_id)[worst.resource]
    const transferable = Math.round(Math.min(best.allocated * 0.2, shortageAmount))
    const newAllocated = worst.allocated + transferable
    const newPct = Math.round((newAllocated / worstZoneDemand) * 100)

    return {
      type: 'suggestion',
      title: `Critical shortage detected in ${worst.zone_id}`,
      shortageLine: `${meta.label} shortage: ${shortageAmount.toLocaleString()} ${meta.unit}`,
      recommendationLine: `Reallocate ${transferable.toLocaleString()} ${meta.unit} from ${best.zone_id} → ${worst.zone_id}`,
      coverageLine: `Expected coverage: ${worst.zone_id}: ${worst.pct}% → ${newPct}%`,
    }
  }

  return {
    type: 'warning',
    title: `Critical shortage detected in ${worst.zone_id}`,
    shortageLine: `${meta.label} shortage: ${shortageAmount.toLocaleString()} ${meta.unit}`,
    recommendationLine: `No surplus zone available to reallocate from. Consider increasing total supply.`,
    coverageLine: null,
  }
}

function AIRecommendationBanner({ allocation, zones }) {
  const rec = generateRecommendation(allocation, zones)
  if (!rec) return null

  if (rec.type === 'ok') {
    return (
      <div style={{
        background: 'linear-gradient(90deg, #f0fdf4, #ffffff)', border: '1px solid #22c55e',
        borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
      }}>
        <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
          AI STATUS
        </div>
        <div style={{ color: '#1a202c', fontSize: '0.9rem' }}>{rec.text}</div>
      </div>
    )
  }

  const borderColor = rec.type === 'suggestion' ? '#3b82f6' : '#ef4444'
  const bg = rec.type === 'suggestion' ? 'linear-gradient(90deg, #eff6ff, #ffffff)' : 'linear-gradient(90deg, #fef2f2, #ffffff)'

  return (
    <div style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ color: borderColor, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        AI RECOMMENDATION
      </div>
      <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
        ⚠ {rec.title}
      </div>
      <div style={{ color: '#1a202c', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{rec.shortageLine}</div>
      <div style={{ color: '#1a202c', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
        <strong>Recommendation:</strong> {rec.recommendationLine}
      </div>
      {rec.coverageLine && (
        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{rec.coverageLine}</div>
      )}
    </div>
  )
}

export default AIRecommendationBanner
