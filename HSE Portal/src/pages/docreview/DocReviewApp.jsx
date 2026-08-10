import DocReviewDashboard from './DocReviewDashboard';
import ReviewInboxPage from './ReviewInboxPage';
import AllDocumentsPage from './AllDocumentsPage';
import SubmitDocumentPage from './SubmitDocumentPage';
import PendingReviewPage from './PendingReviewPage';
import MyAssignmentsPage from './MyAssignmentsPage';
import ReviewHistoryPage from './ReviewHistoryPage';
import ApprovalsPage from './ApprovalsPage';
import MasterRegisterPage from './MasterRegisterPage';
import ObsoleteArchivePage from './ObsoleteArchivePage';
import ManagementReportsPage from './ManagementReportsPage';
import Placeholder from '../../components/Placeholder';
import { DOC_REVIEW_TITLES } from '../../data/navConfig';

export default function DocReviewApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'dr-dashboard':
      return <DocReviewDashboard pushToast={pushToast} onNavigate={onNavigate} />;
    case 'dr-inbox':
      return <ReviewInboxPage pushToast={pushToast} />;
    case 'dr-documents':
      return <AllDocumentsPage pushToast={pushToast} />;
    case 'dr-submit':
      return <SubmitDocumentPage pushToast={pushToast} onNavigate={onNavigate} />;
    case 'dr-pending':
      return <PendingReviewPage pushToast={pushToast} />;
    case 'dr-assignments':
      return <MyAssignmentsPage pushToast={pushToast} />;
    case 'dr-history':
      return <ReviewHistoryPage pushToast={pushToast} />;
    case 'dr-approvals':
      return <ApprovalsPage pushToast={pushToast} />;
    case 'dr-register':
      return <MasterRegisterPage pushToast={pushToast} />;
    case 'dr-archive':
      return <ObsoleteArchivePage pushToast={pushToast} />;
    case 'dr-reports':
      return <ManagementReportsPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{DOC_REVIEW_TITLES[view]}</h1>
          <Placeholder title={DOC_REVIEW_TITLES[view]} />
        </div>
      );
  }
}
