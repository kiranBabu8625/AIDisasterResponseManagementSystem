const NAV_ITEMS = ['Dashboard', 'Live Data', 'Disaster Zones', 'Resources', 'Missions', 'Alerts', 'Scenario Simulation']

function Sidebar({ activeView, onNavigate }) {
  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: '#eef1f5',
      borderRight: '1px solid #e2e8f0',
      padding: '1.5rem 1rem',
      boxSizing: 'border-box',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: '#ef4444', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 'bold', color: 'white',
        }}>R</div>
        <div>
          <div style={{ color: '#1a202c', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>RESPONSE</div>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '0.1em' }}>COMMAND</div>
        </div>
      </div>

      <nav>
        {NAV_ITEMS.map((item) => (
          <div
            key={item}
            onClick={() => onNavigate(item)}
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '0.35rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeView === item ? '#ef4444' : 'transparent',
              color: activeView === item ? '#fff' : '#64748b',
              fontWeight: activeView === item ? 600 : 400,
            }}
          >
            {item}
          </div>
        ))}
      </nav>

      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>System Online</span>
      </div>
    </div>
  )
}

export default Sidebar
