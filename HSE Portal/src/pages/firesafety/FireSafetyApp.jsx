import FireSafetyDashboard from './FireSafetyDashboard';
import FireAssetRegisterPage from './FireAssetRegisterPage';
import FireEquipmentAuditPage from './FireEquipmentAuditPage';
import StartNewAuditPage from './StartNewAuditPage';
import ObservationsFindingsPage from './ObservationsFindingsPage';
import CorrectiveActionsPage from './CorrectiveActionsPage';
import AmcServicePage from './AmcServicePage';
import ServiceRequestsPage from './ServiceRequestsPage';
import FirePumpsAuditPage from './FirePumpsAuditPage';
import RefillingHydroTestPage from './RefillingHydroTestPage';
import ExpiryAlertsPage from './ExpiryAlertsPage';
import HodManagementReportPage from './HodManagementReportPage';
import AuditTrailPage from './AuditTrailPage';
import Placeholder from '../../components/Placeholder';
import { FIRE_TITLES } from '../../data/navConfig';

export default function FireSafetyApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'fs-dashboard':
      return <FireSafetyDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fs-register':
      return <FireAssetRegisterPage pushToast={pushToast} />;
    case 'fs-audit':
      return <FireEquipmentAuditPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fs-new-audit':
      return <StartNewAuditPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fs-observations':
      return <ObservationsFindingsPage pushToast={pushToast} />;
    case 'fs-corrective':
      return <CorrectiveActionsPage pushToast={pushToast} />;
    case 'fs-amc':
      return <AmcServicePage pushToast={pushToast} />;
    case 'fs-service-requests':
      return <ServiceRequestsPage pushToast={pushToast} />;
    case 'fs-pumps':
      return <FirePumpsAuditPage pushToast={pushToast} />;
    case 'fs-refill':
      return <RefillingHydroTestPage pushToast={pushToast} />;
    case 'fs-expiry':
      return <ExpiryAlertsPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'fs-reports':
      return <HodManagementReportPage pushToast={pushToast} />;
    case 'fs-audit-trail':
      return <AuditTrailPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{FIRE_TITLES[view]}</h1>
          <Placeholder title={FIRE_TITLES[view]} />
        </div>
      );
  }
}
