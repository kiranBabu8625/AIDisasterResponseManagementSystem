import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

const BASE_PREDICTIONS = {
  food: 1417,
  water: 6704,
  medical: 204,
  shelter: 989,
}

const RESOURCE_LABELS = { food: 'Food (packets)', water: 'Water (L)', medical: 'Medical Kits', shelter: 'Shelter Units' }

const DELAY_OPTIONS = [
  { label: 'No Delay', days: 0 },
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
]

const SUPPLY_OPTIONS = [
  { label: 'Full Supply (100%)', percent: 100 },
  { label: 'Mostly Available (80%)', percent: 80 },
  { label: 'Limited (60%)', percent: 60 },
  { label: 'Scarce (40%)', percent: 40 },
  { label: 'Critical Shortage (20%)', percent: 20 },
]

function ScenarioSimulator() {
  const [delayDays, setDelayDays] = useState(3)
  const [customDelay, setCustomDelay] = useState('')
  const [availablePercent, setAvailablePercent] = useState(60)
  const [customSupply, setCustomSupply] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const isPresetDelay = DELAY_OPTIONS.some((o) => o.days === delayDays)
  const isPresetSupply = SUPPLY_OPTIONS.some((o) => o.percent === availablePercent)

  const runSimulation = () => {
    setLoading(true)
    axios.post(`${API_BASE}/scenario/simulate`, {
      predictions: BASE_PREDICTIONS,
      delay_days: Number(delayDays),
      available_percent: Number(availablePercent),
    })
      .then((response) => {
        setResult(response.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '0.5rem' }}>Scenario Simulation</h1>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        A "what if" tool for coordinators — pick a delay and a supply level to see how demand and shortage change.
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '1rem' }}>BASELINE DEMAND (NORMAL CONDITIONS)</div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {Object.entries(BASE_PREDICTIONS).map(([res, val]) => (
            <div key={res}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{RESOURCE_LABELS[res]}</div>
              <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 700 }}>{val.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '1rem' }}>SCENARIO CONTROLS</div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>1. Choose response delay</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {DELAY_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => { setDelayDays(opt.days); setCustomDelay('') }}
                style={{
                  padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  border: isPresetDelay && delayDays === opt.days ? '2px solid #f5a623' : '1px solid #e2e8f0',
                  background: isPresetDelay && delayDays === opt.days ? '#fff7ed' : '#ffffff',
                  color: isPresetDelay && delayDays === opt.days ? '#f5a623' : '#64748b',
                }}
              >
                {opt.label}
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="number"
                min="0"
                placeholder="Custom"
                value={customDelay}
                onChange={(e) => { setCustomDelay(e.target.value); if (e.target.value !== '') setDelayDays(Number(e.target.value)) }}
                style={{
                  width: '80px', padding: '0.5rem', borderRadius: '6px', fontSize: '0.82rem',
                  border: !isPresetDelay ? '2px solid #f5a623' : '1px solid #e2e8f0',
                  color: '#1a202c',
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>days</span>
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.5rem' }}>Demand grows 5% for every day help is delayed.</div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#1a202c', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>2. Choose supply availability</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {SUPPLY_OPTIONS.map((opt) => (
              <button
                key={opt.percent}
                onClick={() => { setAvailablePercent(opt.percent); setCustomSupply('') }}
                style={{
                  padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  border: isPresetSupply && availablePercent === opt.percent ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: isPresetSupply && availablePercent === opt.percent ? '#eff6ff' : '#ffffff',
                  color: isPresetSupply && availablePercent === opt.percent ? '#3b82f6' : '#64748b',
                }}
              >
                {opt.label}
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Custom"
                value={customSupply}
                onChange={(e) => { setCustomSupply(e.target.value); if (e.target.value !== '') setAvailablePercent(Number(e.target.value)) }}
                style={{
                  width: '80px', padding: '0.5rem', borderRadius: '6px', fontSize: '0.82rem',
                  border: !isPresetSupply ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  color: '#1a202c',
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>%</span>
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.5rem' }}>What percentage of required supplies can actually be delivered.</div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.65rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, background: '#ffffff', border: '1px solid #f5a623', borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ color: '#f5a623', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '1rem', fontWeight: 700 }}>
              IF DELAYED {result.delay_scenario.delay_days} DAYS
            </div>
            {Object.entries(result.delay_scenario.updated_predictions).map(([res, val]) => {
              const baseline = BASE_PREDICTIONS[res]
              const increase = Math.round(((val - baseline) / baseline) * 100)
              return (
                <div key={res} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{RESOURCE_LABELS[res]}</div>
                  <div style={{ color: '#1a202c', fontSize: '0.95rem' }}>
                    {baseline.toLocaleString()} → <strong>{val.toLocaleString()}</strong>{' '}
                    <span style={{ color: '#f5a623' }}>(+{increase}%)</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ flex: 1, background: '#ffffff', border: '1px solid #3b82f6', borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ color: '#3b82f6', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '1rem', fontWeight: 700 }}>
              IF ONLY {result.shortage_scenario.available_percent}% SUPPLIES AVAILABLE
            </div>
            {Object.entries(result.shortage_scenario.breakdown).map(([res, vals]) => (
              <div key={res} style={{ marginBottom: '0.9rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{RESOURCE_LABELS[res]}</div>
                <div style={{ background: '#eef1f5', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                  <div style={{ width: `${(vals.available / vals.required) * 100}%`, background: '#3b82f6', height: '100%' }} />
                </div>
                <div style={{ color: '#1a202c', fontSize: '0.78rem' }}>
                  {vals.available.toLocaleString()} available · <span style={{ color: '#ef4444' }}>{vals.shortage.toLocaleString()} short</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScenarioSimulator
