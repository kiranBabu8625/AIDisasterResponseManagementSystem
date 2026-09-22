function StatCard({ label, value, sublabel, accent }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      flex: 1,
    }}>
      <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: accent || '#1a202c', fontSize: '2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
        {value}
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{sublabel}</div>
    </div>
  )
}

export default StatCard
