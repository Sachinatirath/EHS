import MyProfile from './MyProfile';
import Dashboard from './Dashboard';
import HomePage from './HomePage';
import MyTasksPage from './MyTasksPage';
import PowerToolsAudit from './ehsAudit/PowerToolsAudit';
import GenericAuditForm from './ehsAudit/GenericAuditForm';
import PermitForm from './forms/PermitForm';
import AuditTrainingPlanPage from './forms/AuditTrainingPlanPage';
import TodayPlanPage from './forms/TodayPlanPage';
import HandoverPage from './shiftschedule/HandoverPage';
import Placeholder from '../components/Placeholder';
import { PAGE_TITLES } from '../data/navConfig';
import { PERMIT_TYPES } from '../data/formOptions';
import { IconTruck, IconSubstation, IconBoiler, IconBattery, IconCanteen } from '../components/icons';

const SIMPLE_AUDITS = {
  'ehs-outside-vehicles': { title: 'Outside Vehicles Audit', icon: <IconTruck size={17} /> },
  'ehs-substation': { title: 'Sub Station Audit', icon: <IconSubstation size={17} /> },
  'ehs-boiler': { title: 'Boiler Safety Audit', icon: <IconBoiler size={17} /> },
  'ehs-battery': { title: 'Battery Charging Station Audit', icon: <IconBattery size={17} /> },
  'ehs-canteen': { title: 'Canteen Safety Audit', icon: <IconCanteen size={17} /> },
};

export default function PortalContent({ view, pushToast, onNavigate, onOpenTask }) {
  if (SIMPLE_AUDITS[view]) {
    const { title, icon } = SIMPLE_AUDITS[view];
    return <GenericAuditForm title={title} icon={icon} pushToast={pushToast} />;
  }

  if (PERMIT_TYPES[view]) {
    return <PermitForm title={PERMIT_TYPES[view]} pushToast={pushToast} />;
  }

  switch (view) {
    case 'profile':
      return <MyProfile pushToast={pushToast} />;
    case 'my-tasks':
      return <MyTasksPage onOpenTask={onOpenTask} />;
    case 'home':
      return <HomePage onNavigate={onNavigate} onOpenTask={onOpenTask} />;
    case 'permits-dashboard':
      return <Dashboard />;
    case 'ehs-powertools':
      return <PowerToolsAudit pushToast={pushToast} />;
    case 'atp-today':
      return <TodayPlanPage pushToast={pushToast} />;
    case 'shift-handover':
      return <HandoverPage pushToast={pushToast} />;
    case 'atp-plan':
      return <AuditTrainingPlanPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{PAGE_TITLES[view] || 'Module'}</h1>
          <Placeholder title={PAGE_TITLES[view] || 'This module'} />
        </div>
      );
  }
}
