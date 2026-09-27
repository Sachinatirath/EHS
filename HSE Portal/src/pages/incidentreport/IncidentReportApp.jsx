import './theme.css';
import WelcomePage from './WelcomePage';
import AgentHomePage from './AgentHomePage';
import CreateIncidentPage from './CreateIncidentPage';
import HodDashboardPage from './HodDashboardPage';
import HodIncidentsPage from './HodIncidentsPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';

function renderView(view, onNavigate, pushToast) {
  switch (view) {
    case 'ir-agent-home':
      return <AgentHomePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-agent-create':
      return <CreateIncidentPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-agent-alerts':
      return <NotificationsPage targetView="ir-agent-home" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-agent-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-hod-dashboard':
      return <HodDashboardPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-hod-incidents':
      return <HodIncidentsPage pushToast={pushToast} />;
    case 'ir-hod-alerts':
      return <NotificationsPage targetView="ir-hod-incidents" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ir-hod-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    default:
      return <WelcomePage />;
  }
}

export default function IncidentReportApp({ view, onNavigate, pushToast }) {
  return (
    <div className="ir-theme" style={{ minHeight: '100%' }}>
      {renderView(view, onNavigate, pushToast)}
    </div>
  );
}
