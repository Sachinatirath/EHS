import WebSlingDashboard from './WebSlingDashboard';
import OnlineInspectionPage from './OnlineInspectionPage';
import SlingMasterPage from './SlingMasterPage';
import HodApprovalsPage from './HodApprovalsPage';
import CorrectiveActionsPage from './CorrectiveActionsPage';
import InspectionHistoryPage from './InspectionHistoryPage';
import ReportsAnalyticsPage from './ReportsAnalyticsPage';
import Placeholder from '../../components/Placeholder';
import { WEBSLING_TITLES } from '../../data/navConfig';

export default function WebSlingApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'ws-dashboard':
      return <WebSlingDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ws-inspection':
      return <OnlineInspectionPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ws-master':
      return <SlingMasterPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'ws-hod':
      return <HodApprovalsPage pushToast={pushToast} />;
    case 'ws-corrective':
      return <CorrectiveActionsPage pushToast={pushToast} />;
    case 'ws-history':
      return <InspectionHistoryPage pushToast={pushToast} />;
    case 'ws-reports':
      return <ReportsAnalyticsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{WEBSLING_TITLES[view]}</h1>
          <Placeholder title={WEBSLING_TITLES[view]} />
        </div>
      );
  }
}
