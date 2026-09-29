// Gemba Walk shares the Safety Observation colour theme (`.so-theme`).
import '../safetyobservation/theme.css';
import GembaDashboard from './GembaDashboard';
import GembaLogForm from './GembaLogForm';
import GembaRecords from './GembaRecords';
import GembaEscalations from './GembaEscalations';

function renderView(view, onNavigate, pushToast) {
  switch (view) {
    case 'gw-log':
      return <GembaLogForm onNavigate={onNavigate} pushToast={pushToast} />;
    case 'gw-records':
      return <GembaRecords onNavigate={onNavigate} pushToast={pushToast} />;
    case 'gw-escalations':
      return <GembaEscalations />;
    case 'gw-dashboard':
    default:
      return <GembaDashboard onNavigate={onNavigate} pushToast={pushToast} />;
  }
}

export default function GembaWalkApp({ view, onNavigate, pushToast }) {
  return (
    <div className="so-theme" style={{ minHeight: '100%' }}>
      {renderView(view, onNavigate, pushToast)}
    </div>
  );
}
