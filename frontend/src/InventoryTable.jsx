import { useState } from 'react'

const RESOURCE_LABELS = {
  food_packets: { label: 'Food Packets', unit: 'pkts', max: 20000 },
  water_liters: { label: 'Water', unit: 'L', max: 30000 },
  medical_kits: { label: 'Medical Kits', unit: 'kits', max: 3000 },
  shelter_capacity: { label: 'Shelter Capacity', unit: 'units', max: 5000 },
}

function stockColor(pct) {
  if (pct < 30) return '#ef4444'
  if (pct < 60) return '#f5a623'
  return '#22c55e'
}

function InventoryTable({ resources, onChange }) {
  const [editingKey, setEditingKey] = useState(null)
  const [draftValue, setDraftValue] = useState('')

  const startEdit = (key, currentValue) => {
    setEditingKey(key)
    setDraftValue(String(currentValue))
  }

  const commitEdit = (key) => {
    const num = Number(draftValue)
    if (!isNaN(num) && num >= 0) {
      onChange({ ...resources, [key]: num })
    }
    setEditingKey(null)
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid #e2e8f0' }}>Resource</th>
          <th style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid #e2e8f0' }}>Stock Level</th>
          <th style={{ textAlign: 'right', color: '#64748b', fontSize: '0.75rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid #e2e8f0' }}>Available</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(resources).map(([key, value]) => {
          const meta = RESOURCE_LABELS[key] || { label: key, unit: '', max: value * 2 }
          const pct = Math.min(100, Math.round((value / meta.max) * 100))
          return (
            <tr key={key}>
              <td style={{ color: '#1a202c', fontSize: '0.85rem', padding: '0.6rem 0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                {meta.label}
              </td>
              <td style={{ padding: '0.6rem 0.25rem', borderBottom: '1px solid #e2e8f0', width: '40%' }}>
                <div style={{ background: '#eef1f5', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: stockColor(pct), height: '100%' }} />
                </div>
              </td>
              <td style={{ textAlign: 'right', padding: '0.6rem 0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                {editingKey === key ? (
                  <input
                    type="number"
                    autoFocus
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => commitEdit(key)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(key) }}
                    style={{
                      width: '90px', background: '#eef1f5', color: '#1a202c',
                      border: '1px solid #ef4444', borderRadius: '4px', padding: '0.25rem', textAlign: 'right',
                    }}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(key, value)}
                    style={{ color: '#1a202c', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px dashed #94a3b8' }}
                    title="Click to edit"
                  >
                    {value} {meta.unit}
                  </span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default InventoryTable
