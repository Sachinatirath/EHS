import SchedulePage from './SchedulePage';
import NewRequestPage from './NewRequestPage';
import MyRequestsPage from './MyRequestsPage';
import HodDashboardPage from './HodDashboardPage';
import HodRequestsPage from './HodRequestsPage';

export default function ShiftScheduleApp({ view, onNavigate, pushToast }) {
  switch (view) {
    case 'ss-emp-new':
      return <NewRequestPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ss-emp-requests':
      return <MyRequestsPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ss-hod-dashboard':
      return <HodDashboardPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'ss-hod-requests':
      return <HodRequestsPage pushToast={pushToast} />;
    case 'ss-emp-schedule':
    case 'ss-hod-schedule':
    default:
      return <SchedulePage onNavigate={onNavigate} />;
  }
}
