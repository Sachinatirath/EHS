import { Fragment } from 'react';
import WelcomePage from './WelcomePage';
import AreaInchargeHomePage from './AreaInchargeHomePage';
import StartInspectionPage from './StartInspectionPage';
import MyInspectionsPage from './MyInspectionsPage';
import OhcDashboardPage from './OhcDashboardPage';
import BoxesPage from './BoxesPage';
import RecordsPage from './RecordsPage';
import RefillsPage from './RefillsPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import OhcDashboardDmPage from '../ohc/DashboardPage';
import EmployeesPage from '../ohc/EmployeesPage';
import OpRegistrationPage from '../ohc/OpRegistrationPage';
import NursePage from '../ohc/NursePage';
import DoctorPage from '../ohc/DoctorPage';
import HistoryPage from '../ohc/HistoryPage';
import MedicinesPage from '../ohc/MedicinesPage';
import PrescriptionsPage from '../ohc/PrescriptionsPage';
import FollowUpPage from '../ohc/FollowUpPage';
import ReportsPage from '../ohc/ReportsPage';
import SettingsPage from '../ohc/SettingsPage';

// Digital Occupational Health Management (OHC clinic) screens.
const OHC_PAGES = {
  'dm-dashboard': OhcDashboardDmPage,
  'dm-employees': EmployeesPage,
  'dm-op': OpRegistrationPage,
  'dm-nurse': NursePage,
  'dm-doctor': DoctorPage,
  'dm-history': HistoryPage,
  'dm-medicines': MedicinesPage,
  'dm-prescriptions': PrescriptionsPage,
  'dm-followup': FollowUpPage,
  'dm-reports': ReportsPage,
  'dm-settings': SettingsPage,
};

function renderView(view, onNavigate, pushToast) {
  const OhcPage = OHC_PAGES[view];
  if (OhcPage) return <OhcPage onNavigate={onNavigate} pushToast={pushToast} />;
  switch (view) {
    case 'fa-ai-home':
      return <AreaInchargeHomePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ai-inspect':
      return <StartInspectionPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ai-inspections':
      return <MyInspectionsPage pushToast={pushToast} />;
    case 'fa-ai-alerts':
      return <NotificationsPage role="area_incharge" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ai-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ohc-dashboard':
      return <OhcDashboardPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ohc-boxes':
      return <BoxesPage pushToast={pushToast} />;
    case 'fa-ohc-records':
      return <RecordsPage onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ohc-refills':
      return <RefillsPage pushToast={pushToast} />;
    case 'fa-ohc-alerts':
      return <NotificationsPage role="ohc" onNavigate={onNavigate} pushToast={pushToast} />;
    case 'fa-ohc-profile':
      return <ProfilePage onNavigate={onNavigate} pushToast={pushToast} />;
    default:
      return <WelcomePage />;
  }
}

// No theme wrapper: the portal's default styling is already FastAid's teal.
// `key={view}` remounts the page on every navigation so each one re-loads
// (and shows its skeleton) instead of reusing a previous page's state.
export default function FastAidApp({ view, onNavigate, pushToast }) {
  return <Fragment key={view}>{renderView(view, onNavigate, pushToast)}</Fragment>;
}
