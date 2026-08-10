import TrainingDashboard from './TrainingDashboard';
import EmployeeMasterPage from './EmployeeMasterPage';
import TrainingSessionsPage from './TrainingSessionsPage';
import TrainingMatrixPage from './TrainingMatrixPage';
import CertificatesExpiryPage from './CertificatesExpiryPage';
import SafetyInductionPage from './SafetyInductionPage';
import SpecialTrainingPage from './SpecialTrainingPage';
import IncidentCommunicationPage from './IncidentCommunicationPage';
import HodApprovalPage from './HodApprovalPage';
import NotificationsPage from './NotificationsPage';
import HodReportsPage from './HodReportsPage';
import Placeholder from '../../components/Placeholder';
import { TRAINING_TITLES } from '../../data/navConfig';

export default function TrainingApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'tr-dashboard':
      return <TrainingDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'tr-employees':
      return <EmployeeMasterPage pushToast={pushToast} />;
    case 'tr-sessions':
      return <TrainingSessionsPage pushToast={pushToast} />;
    case 'tr-matrix':
      return <TrainingMatrixPage pushToast={pushToast} />;
    case 'tr-certificates':
      return <CertificatesExpiryPage pushToast={pushToast} />;
    case 'tr-induction':
      return <SafetyInductionPage pushToast={pushToast} />;
    case 'tr-special':
      return <SpecialTrainingPage pushToast={pushToast} />;
    case 'tr-incident':
      return <IncidentCommunicationPage pushToast={pushToast} />;
    case 'tr-hod':
      return <HodApprovalPage pushToast={pushToast} />;
    case 'tr-notifications':
      return <NotificationsPage pushToast={pushToast} />;
    case 'tr-reports':
      return <HodReportsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{TRAINING_TITLES[view]}</h1>
          <Placeholder title={TRAINING_TITLES[view]} />
        </div>
      );
  }
}
