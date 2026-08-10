import HoistDashboard from './HoistDashboard';
import OnlineAuditPage from './OnlineAuditPage';
import EquipmentMasterPage from './EquipmentMasterPage';
import HodApprovalPage from './HodApprovalPage';
import CorrectiveActionsPage from './CorrectiveActionsPage';
import AuditHistoryPage from './AuditHistoryPage';
import ManagementReportsPage from './ManagementReportsPage';
import Placeholder from '../../components/Placeholder';
import { HOIST_TITLES } from '../../data/navConfig';

export default function HoistApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'ho-dashboard':
      return <HoistDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ho-audit':
      return <OnlineAuditPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ho-master':
      return <EquipmentMasterPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ho-hod':
      return <HodApprovalPage pushToast={pushToast} />;
    case 'ho-corrective':
      return <CorrectiveActionsPage pushToast={pushToast} />;
    case 'ho-history':
      return <AuditHistoryPage pushToast={pushToast} />;
    case 'ho-reports':
      return <ManagementReportsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{HOIST_TITLES[view]}</h1>
          <Placeholder title={HOIST_TITLES[view]} />
        </div>
      );
  }
}
