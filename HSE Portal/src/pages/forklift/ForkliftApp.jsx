import ForkliftDashboard from './ForkliftDashboard';
import ObservationsPage from './ObservationsPage';
import OnlineAuditPage from './OnlineAuditPage';
import ForkliftMasterPage from './ForkliftMasterPage';
import DepartmentAssignmentPage from './DepartmentAssignmentPage';
import HodApprovalPage from './HodApprovalPage';
import CorrectiveActionsPage from './CorrectiveActionsPage';
import AuditHistoryPage from './AuditHistoryPage';
import ManagementReportsPage from './ManagementReportsPage';
import Placeholder from '../../components/Placeholder';
import { FORKLIFT_TITLES } from '../../data/navConfig';

export default function ForkliftApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'fl-dashboard':
      return <ForkliftDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fl-observations':
      return <ObservationsPage pushToast={pushToast} />;
    case 'fl-audit':
      return <OnlineAuditPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fl-master':
      return <ForkliftMasterPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fl-dept':
      return <DepartmentAssignmentPage pushToast={pushToast} />;
    case 'fl-hod':
      return <HodApprovalPage pushToast={pushToast} />;
    case 'fl-corrective':
      return <CorrectiveActionsPage pushToast={pushToast} />;
    case 'fl-history':
      return <AuditHistoryPage pushToast={pushToast} />;
    case 'fl-reports':
      return <ManagementReportsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{FORKLIFT_TITLES[view]}</h1>
          <Placeholder title={FORKLIFT_TITLES[view]} />
        </div>
      );
  }
}
