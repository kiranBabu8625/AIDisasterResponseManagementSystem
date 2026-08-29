import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Dashboard from './Dashboard.jsx'
import RealDashboard from './RealDashboard.jsx'
import DisasterZonesView from './DisasterZonesView.jsx'
import ResourcesView from './ResourcesView.jsx'
import MissionsView from './MissionsView.jsx'
import AlertsView from './AlertsView.jsx'
import ScenarioSimulator from './ScenarioSimulator.jsx'

function App() {
  const [activeView, setActiveView] = useState('Dashboard')

  const renderView = () => {
    if (activeView === 'Dashboard') return <Dashboard onNavigate={setActiveView} />
    if (activeView === 'Live Data') return <RealDashboard />
    if (activeView === 'Disaster Zones') return <DisasterZonesView />
    if (activeView === 'Resources') return <ResourcesView />
    if (activeView === 'Missions') return <MissionsView />
    if (activeView === 'Alerts') return <AlertsView />
    if (activeView === 'Scenario Simulation') return <ScenarioSimulator />
    return <Dashboard onNavigate={setActiveView} />
  }

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div style={{ marginLeft: '240px', padding: '2rem' }}>
        {renderView()}
      </div>
    </div>
  )
}

export default App
