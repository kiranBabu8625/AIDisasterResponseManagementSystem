import AllocationForm from './AllocationForm.jsx'
import PriorityOverride from './PriorityOverride.jsx'
import ResourceTracking from './ResourceTracking.jsx'

function ResourcesView() {
  return (
    <div>
      <h1 style={{ color: '#1a202c', fontSize: '1.6rem', marginBottom: '1.5rem' }}>Resources</h1>
      <AllocationForm />
      <PriorityOverride />
      <ResourceTracking />
    </div>
  )
}

export default ResourcesView
