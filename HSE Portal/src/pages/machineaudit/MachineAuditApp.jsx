import './theme.css';
import WelcomePage from './WelcomePage';
import OfficerHomePage from './OfficerHomePage';
import CreateAuditPage from './CreateAuditPage';
import InchargeHomePage from './InchargeHomePage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import HodDashboardPage from './HodDashboardPage';
import AuditedMachinesPage from './AuditedMachinesPage';

function renderView(view, onNavigate, pushToast) {
  switch (view) {
    case 'ma-officer-home':
      return <OfficerHomePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ma-officer-create':
      return <CreateAuditPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ma-officer-alerts':
      return <NotificationsPage targetView="ma-officer-home" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ma-incharge-alerts':
      return <NotificationsPage targetView="ma-incharge-home" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ma-officer-profile':
    case 'ma-incharge-profile':
    case 'ma-hod-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ma-officer-machines':
      return <AuditedMachinesPage pushToast={pushToast} />;
    case 'ma-hod-dashboard':
      return <HodDashboardPage pushToast={pushToast} />;
    case 'ma-hod-machines':
      return <AuditedMachinesPage pushToast={pushToast} />;
    case 'ma-hod-alerts':
      return <NotificationsPage targetView="ma-hod-machines" pushToast={pushToast} />;
    case 'ma-incharge-home':
      return <InchargeHomePage pushToast={pushToast} />;
    default:
      return <WelcomePage />;
  }
}

export default function MachineAuditApp({ view, onNavigate, pushToast }) {
  return (
    <div className="ma-theme" style={{ minHeight: '100%' }}>
      {renderView(view, onNavigate, pushToast)}
    </div>
  );
}
