import MyProfile from './MyProfile';
import Dashboard from './Dashboard';
import MachineAudit from './ehsAudit/MachineAudit';
import PowerToolsAudit from './ehsAudit/PowerToolsAudit';
import GenericAuditForm from './ehsAudit/GenericAuditForm';
import PermitForm from './forms/PermitForm';
import AuditTrainingPlanPage from './forms/AuditTrainingPlanPage';
import SafetyViolationPage from './forms/SafetyViolationPage';
import SafetyObservationPage from './forms/SafetyObservationPage';
import IncidentReportPage from './forms/IncidentReportPage';
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

export default function PortalContent({ view, pushToast }) {
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
    case 'dashboard':
      return <Dashboard />;
    case 'ehs-machine':
      return <MachineAudit pushToast={pushToast} />;
    case 'ehs-powertools':
      return <PowerToolsAudit pushToast={pushToast} />;
    case 'audit-training-plan':
      return <AuditTrainingPlanPage pushToast={pushToast} />;
    case 'safety-violation':
      return <SafetyViolationPage pushToast={pushToast} />;
    case 'safety-observation':
      return <SafetyObservationPage pushToast={pushToast} />;
    case 'incident-report':
      return <IncidentReportPage pushToast={pushToast} />;
    default:
      return (
        <div className="page-enter">
          <h1 className="page-title">{PAGE_TITLES[view] || 'Module'}</h1>
          <Placeholder title={PAGE_TITLES[view] || 'This module'} />
        </div>
      );
  }
}
