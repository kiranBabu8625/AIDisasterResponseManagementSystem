import { useState, useEffect } from 'react'
import axios from 'axios'
import ZoneMap from './ZoneMap.jsx'
import MissionDrawer from './MissionDrawer.jsx'

const API_BASE = 'http://127.0.0.1:8000'

const DEPOT = { name: 'Central Warehouse', latitude: 17.3850, longitude: 78.4867 }
const ZONE_LOCATIONS = [
  { zone_id: 'Z-101', latitude: 17.4400, longitude: 78.4983 },
  { zone_id: 'Z-102', latitude: 17.3616, longitude: 78.4747 },
  { zone_id: 'Z-103', latitude: 17.4239, longitude: 78.4738 },
  { zone_id: 'Z-104', latitude: 17.4000, longitude: 78.5100 },
]
const TEAM_NAMES = { 1: 'Team Alpha', 2: 'Team Bravo' }

const STATUS_COLORS = {
  assigned: '#f5a623',
  in_progress: '#3b82f6',
  completed: '#22c55e',
}

const NEXT_STATUS = {
  assigned: 'in_progress',
  in_progress: 'completed',
  completed: null,
}

function MissionsPanel() {
  const [missions, setMissions] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)

  const fetchMissions = () => {
    axios.get(`${API_BASE}/missions`)
      .then((response) => setMissions(response.data.missions))
      .catch(() => {})
  }

  useEffect(() => { fetchMissions() }, [])

  const dispatchMissions = () => {
    setLoading(true)
    axios.post(`${API_BASE}/routing/plan-routes`, {
      depot: DEPOT,
      zones: ZONE_LOCATIONS,
      num_vehicles: 2,
    })
      .then((routingResponse) => {
        setRoutes(routingResponse.data.routes)
        return axios.post(`${API_BASE}/missions/create-missions`, {
          routes: routingResponse.data.routes,
          team_names: TEAM_NAMES,
        })
      })
      .then(() => {
        fetchMissions()
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const advanceStatus = (e, missionId, currentStatus) => {
    e.stopPropagation()
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    axios.patch(`${API_BASE}/missions/${missionId}/status`, { new_status: next })
      .then(() => fetchMissions())
      .catch(() => {})
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>MISSION OPERATIONS</div>
          <div style={{ color: '#1a202c', fontSize: '1.1rem', fontWeight: 600 }}>Active Missions</div>
        </div>
        <button
          onClick={dispatchMissions}
          disabled={loading}
          style={{
            background: '#ef4444', color: 'white', border: 'none',
            borderRadius: '6px', padding: '0.6rem 1.1rem', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          {loading ? 'Planning routes...' : 'Dispatch New Missions'}
        </button>
      </div>

      {routes.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <ZoneMap routes={routes} />
        </div>
      )}

      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Click a mission to view full details</div>

      {missions.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          No missions yet. Click "Dispatch New Missions" to plan routes and assign teams.
        </div>
      )}

      {missions.map((m) => (
        <div
          key={m.mission_id}
          onClick={() => setSelectedMission(m)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.85rem 1rem', marginBottom: '0.5rem', borderRadius: '6px',
            background: '#eef1f5', border: '1px solid #e2e8f0', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ color: '#1a202c', fontWeight: 600, fontSize: '0.9rem' }}>
              {m.mission_id} — {m.team_name}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Zones: {m.zones.join(', ')} · {m.total_distance_km} km
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              color: STATUS_COLORS[m.status], fontSize: '0.75rem',
              fontWeight: 600, textTransform: 'uppercase',
            }}>
              {m.status.replace('_', ' ')}
            </span>
            {NEXT_STATUS[m.status] && (
              <button
                onClick={(e) => advanceStatus(e, m.mission_id, m.status)}
                style={{
                  background: 'transparent', color: '#64748b',
                  border: '1px solid #e2e8f0', borderRadius: '4px',
                  padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem',
                }}
              >
                Mark {NEXT_STATUS[m.status].replace('_', ' ')}
              </button>
            )}
          </div>
        </div>
      ))}

      <MissionDrawer mission={selectedMission} onClose={() => setSelectedMission(null)} />
    </div>
  )
}

export default MissionsPanel
