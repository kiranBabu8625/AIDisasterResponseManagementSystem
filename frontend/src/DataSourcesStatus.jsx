import { useState, useEffect } from 'react'

const SOURCES = [
  { name: 'USGS', baseMinutesAgo: 2 },
  { name: 'GDACS', baseMinutesAgo: 3 },
  { name: 'NDMA', baseMinutesAgo: 5 },
  { name: 'Satellite', baseMinutesAgo: 12 },
]

function DataSourcesStatus() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000) // advance every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>DATA SOURCES</div>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {SOURCES.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: 600 }}>{s.name}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              Updated {s.baseMinutesAgo + tick} min ago
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataSourcesStatus
