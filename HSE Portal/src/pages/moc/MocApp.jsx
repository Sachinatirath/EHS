import MocDashboard from './MocDashboard';
import MocRegisterPage from './MocRegisterPage';
import NewMocPage from './NewMocPage';
import RiskReviewPage from './RiskReviewPage';
import RiskAssessmentPage from './RiskAssessmentPage';
import ActionAssignmentPage from './ActionAssignmentPage';
import ApprovalCentrePage from './ApprovalCentrePage';
import ImplementationPage from './ImplementationPage';
import PostChangeVerificationPage from './PostChangeVerificationPage';
import AuditTrailPage from './AuditTrailPage';
import ManagementReportsPage from './ManagementReportsPage';
import Placeholder from '../../components/Placeholder';
import { MOC_TITLES } from '../../data/navConfig';

export default function MocApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'moc-dashboard':
      return <MocDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'moc-register':
      return <MocRegisterPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'moc-new':
      return <NewMocPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'moc-risk-review':
      return <RiskReviewPage pushToast={pushToast} />;
    case 'moc-risk-assessment':
      return <RiskAssessmentPage pushToast={pushToast} />;
    case 'moc-actions':
      return <ActionAssignmentPage pushToast={pushToast} />;
    case 'moc-approval':
      return <ApprovalCentrePage pushToast={pushToast} />;
    case 'moc-implementation':
      return <ImplementationPage pushToast={pushToast} />;
    case 'moc-verification':
      return <PostChangeVerificationPage pushToast={pushToast} />;
    case 'moc-audit-trail':
      return <AuditTrailPage pushToast={pushToast} />;
    case 'moc-reports':
      return <ManagementReportsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{MOC_TITLES[view]}</h1>
          <Placeholder title={MOC_TITLES[view]} />
        </div>
      );
  }
}
