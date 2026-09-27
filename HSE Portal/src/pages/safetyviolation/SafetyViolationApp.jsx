import './theme.css';
import WelcomePage from './WelcomePage';
import AgentHomePage from './AgentHomePage';
import CreateViolationPage from './CreateViolationPage';
import HodDashboardPage from './HodDashboardPage';
import HodViolationsPage from './HodViolationsPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';

function renderView(view, onNavigate, pushToast) {
  switch (view) {
    case 'sv-agent-home':
      return <AgentHomePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-agent-create':
      return <CreateViolationPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-agent-alerts':
      return <NotificationsPage targetView="sv-agent-home" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-agent-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-hod-dashboard':
      return <HodDashboardPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-hod-violations':
      return <HodViolationsPage pushToast={pushToast} />;
    case 'sv-hod-alerts':
      return <NotificationsPage targetView="sv-hod-violations" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'sv-hod-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    default:
      return <WelcomePage />;
  }
}

export default function SafetyViolationApp({ view, onNavigate, pushToast }) {
  return (
    <div className="sv-theme" style={{ minHeight: '100%' }}>
      {renderView(view, onNavigate, pushToast)}
    </div>
  );
}
