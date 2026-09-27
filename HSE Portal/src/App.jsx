import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import ForkliftSidebar from './components/ForkliftSidebar';
import SafetyViolationSidebar from './components/SafetyViolationSidebar';
import SafetyObservationSidebar from './components/SafetyObservationSidebar';
import IncidentReportSidebar from './components/IncidentReportSidebar';
import FastAidSidebar from './components/FastAidSidebar';
import MachineAuditSidebar from './components/MachineAuditSidebar';
import WebSlingSidebar from './components/WebSlingSidebar';
import HoistSidebar from './components/HoistSidebar';
import TrainingSidebar from './components/TrainingSidebar';
import MocSidebar from './components/MocSidebar';
import DocReviewSidebar from './components/DocReviewSidebar';
import FireSafetySidebar from './components/FireSafetySidebar';
import ShiftScheduleSidebar from './components/ShiftScheduleSidebar';
import Header from './components/Header';
import ToastStack from './components/Toast';
import TodayPlanPopup from './components/TodayPlanPopup';
import PortalContent from './pages/PortalContent';
import ForkliftApp from './pages/forklift/ForkliftApp';
import SafetyViolationApp from './pages/safetyviolation/SafetyViolationApp';
import SafetyObservationApp from './pages/safetyobservation/SafetyObservationApp';
import IncidentReportApp from './pages/incidentreport/IncidentReportApp';
import FastAidApp from './pages/fastaid/FastAidApp';
import MachineAuditApp from './pages/machineaudit/MachineAuditApp';
import WebSlingApp from './pages/websling/WebSlingApp';
import HoistApp from './pages/hoist/HoistApp';
import TrainingApp from './pages/training/TrainingApp';
import MocApp from './pages/moc/MocApp';
import DocReviewApp from './pages/docreview/DocReviewApp';
import FireSafetyApp from './pages/firesafety/FireSafetyApp';
import ShiftScheduleApp from './pages/shiftschedule/ShiftScheduleApp';
import useToasts from './hooks/useToasts';
import {
  PAGE_TITLES, FORKLIFT_TITLES, WEBSLING_TITLES, HOIST_TITLES, TRAINING_TITLES, MOC_TITLES, DOC_REVIEW_TITLES, FIRE_TITLES,
  SAFETY_VIOLATION_TITLES, SAFETY_OBSERVATION_TITLES, INCIDENT_REPORT_TITLES, FASTAID_TITLES, MACHINE_AUDIT_TITLES, SHIFT_SCHEDULE_TITLES,
  PORTAL_NAV,
} from './data/navConfig';

// Registry of EHS Audit sub-apps: each gets its own sidebar + content shell,
// reached by clicking an `isApp` nav item whose `appTarget` matches a key here.
const SUB_APPS = {
  forklift: { defaultView: 'fl-dashboard', titles: FORKLIFT_TITLES, Sidebar: ForkliftSidebar, App: ForkliftApp },
  websling: { defaultView: 'ws-dashboard', titles: WEBSLING_TITLES, Sidebar: WebSlingSidebar, App: WebSlingApp },
  hoist: { defaultView: 'ho-dashboard', titles: HOIST_TITLES, Sidebar: HoistSidebar, App: HoistApp },
  training: { defaultView: 'tr-dashboard', titles: TRAINING_TITLES, Sidebar: TrainingSidebar, App: TrainingApp },
  moc: { defaultView: 'moc-dashboard', titles: MOC_TITLES, Sidebar: MocSidebar, App: MocApp },
  docreview: { defaultView: 'dr-dashboard', titles: DOC_REVIEW_TITLES, Sidebar: DocReviewSidebar, App: DocReviewApp },
  firesafety: { defaultView: 'fs-dashboard', titles: FIRE_TITLES, Sidebar: FireSafetySidebar, App: FireSafetyApp },
  safetyviolation: { defaultView: 'sv-agent-home', titles: SAFETY_VIOLATION_TITLES, Sidebar: SafetyViolationSidebar, App: SafetyViolationApp },
  safetyobservation: { defaultView: 'so-agent-home', titles: SAFETY_OBSERVATION_TITLES, Sidebar: SafetyObservationSidebar, App: SafetyObservationApp },
  incidentreport: { defaultView: 'ir-agent-home', titles: INCIDENT_REPORT_TITLES, Sidebar: IncidentReportSidebar, App: IncidentReportApp },
  fastaid: { defaultView: 'fa-ai-home', titles: FASTAID_TITLES, Sidebar: FastAidSidebar, App: FastAidApp },
  shiftschedule: { defaultView: 'ss-emp-schedule', titles: SHIFT_SCHEDULE_TITLES, Sidebar: ShiftScheduleSidebar, App: ShiftScheduleApp },
  machineaudit: { defaultView: 'ma-officer-home', titles: MACHINE_AUDIT_TITLES, Sidebar: MachineAuditSidebar, App: MachineAuditApp },
};

// Maps each nested nav item id to its parent group id (e.g. 'ehs-forklift' -> 'ehs-audit'),
// so only the group the user actually clicked into gets expanded.
const PARENT_OF = Object.fromEntries(
  PORTAL_NAV.flatMap((g) => g.items)
    .flatMap((item) => (item.children || []).map((child) => [child.id, item.id])),
);

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('ehs-portal-authed') === '1');
  const [appMode, setAppMode] = useState('portal'); // 'portal' | one of the SUB_APPS keys
  const [portalView, setPortalView] = useState('home');
  const [subViews, setSubViews] = useState(() => (
    Object.fromEntries(Object.entries(SUB_APPS).map(([key, cfg]) => [key, cfg.defaultView]))
  ));
  const [expanded, setExpanded] = useState(() => new Set());
  const { toasts, push: pushToast, dismiss } = useToasts();

  const handleLoginSuccess = (remember) => {
    if (remember) localStorage.setItem('ehs-portal-authed', '1');
    setAuthed(true);
    setAppMode('portal');
    setPortalView('home');
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePortalNavigate = (id, item) => {
    // Open the group the page lives in; the user can still collapse it afterwards.
    const parentId = PARENT_OF[id];
    if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
    if (item?.isApp && SUB_APPS[item.appTarget]) {
      setSubViews((prev) => ({ ...prev, [item.appTarget]: SUB_APPS[item.appTarget].defaultView }));
      setAppMode(item.appTarget);
      return;
    }
    setPortalView(id);
  };

  // My Tasks → the task's module, already switched to the assignee's profile
  // with the record queued to be highlighted and opened.
  const openTask = (task) => {
    const target = task.go();
    if (target.portal) {
      handlePortalNavigate(target.portal, null);
      setAppMode('portal');
      return;
    }
    setSubViews((prev) => ({ ...prev, [target.app]: target.view }));
    setAppMode(target.app);
  };

  const openTodayPlan = () => {
    setExpanded((prev) => new Set(prev).add('audit-training-plan'));
    setAppMode('portal');
    setPortalView('atp-today');
  };

  const handleSubNavigate = (appKey) => (id) => setSubViews((prev) => ({ ...prev, [appKey]: id }));
  const handleBackToPortal = () => setAppMode('portal');
  const handleLogout = () => {
    localStorage.removeItem('ehs-portal-authed');
    setAuthed(false);
  };

  const activeSubApp = SUB_APPS[appMode];
  const title = activeSubApp ? activeSubApp.titles[subViews[appMode]] : (PAGE_TITLES[portalView] || 'SafeNextG');

  if (!authed) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      {appMode === 'portal' ? (
        <Sidebar activeId={portalView} expanded={expanded} onToggle={toggleExpand} onNavigate={handlePortalNavigate} />
      ) : (
        <activeSubApp.Sidebar
          activeId={subViews[appMode]}
          onNavigate={handleSubNavigate(appMode)}
          onBack={handleBackToPortal}
        />
      )}

      <div className="main-col">
        <Header title={title} onLogout={handleLogout} />
        <div className="content-scroll">
          {appMode === 'portal' ? (
            <PortalContent key={portalView} view={portalView} pushToast={pushToast} onNavigate={handlePortalNavigate} onOpenTask={openTask} />
          ) : (
            <activeSubApp.App
              key={subViews[appMode]}
              view={subViews[appMode]}
              onNavigate={handleSubNavigate(appMode)}
              pushToast={pushToast}
            />
          )}
        </div>
      </div>

      <TodayPlanPopup onViewPlan={openTodayPlan} />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
