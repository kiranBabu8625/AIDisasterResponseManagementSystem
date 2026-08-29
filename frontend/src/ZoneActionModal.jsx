function ZoneActionModal({ result, onClose }) {
  if (!result) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px',
        padding: '1.5rem', width: '380px', maxWidth: '90vw', zIndex: 61,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ color: '#1a202c', fontSize: '1rem', fontWeight: 700 }}>{result.title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {result.type === 'error' && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', lineHeight: '1.5' }}>{result.message}</div>
        )}

        {result.type === 'success' && (
          <div style={{ color: '#1a202c', fontSize: '0.85rem', lineHeight: '1.6' }}>
            {result.rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: '#64748b' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ZoneActionModal
