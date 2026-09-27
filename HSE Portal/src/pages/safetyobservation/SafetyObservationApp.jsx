import './theme.css';
import WelcomePage from './WelcomePage';
import AgentHomePage from './AgentHomePage';
import CreateObservationPage from './CreateObservationPage';
import HodDashboardPage from './HodDashboardPage';
import HodObservationsPage from './HodObservationsPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';

function renderView(view, onNavigate, pushToast) {
  switch (view) {
    case 'so-agent-home':
      return <AgentHomePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-agent-create':
      return <CreateObservationPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-agent-alerts':
      return <NotificationsPage targetView="so-agent-home" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-agent-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-hod-dashboard':
      return <HodDashboardPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-hod-observations':
      return <HodObservationsPage pushToast={pushToast} />;
    case 'so-hod-alerts':
      return <NotificationsPage targetView="so-hod-observations" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'so-hod-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    default:
      return <WelcomePage />;
  }
}

export default function SafetyObservationApp({ view, onNavigate, pushToast }) {
  return (
    <div className="so-theme" style={{ minHeight: '100%' }}>
      {renderView(view, onNavigate, pushToast)}
    </div>
  );
}
