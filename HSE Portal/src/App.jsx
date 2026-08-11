import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import ForkliftSidebar from './components/ForkliftSidebar';
import WebSlingSidebar from './components/WebSlingSidebar';
import HoistSidebar from './components/HoistSidebar';
import TrainingSidebar from './components/TrainingSidebar';
import MocSidebar from './components/MocSidebar';
import DocReviewSidebar from './components/DocReviewSidebar';
import FireSafetySidebar from './components/FireSafetySidebar';
import Header from './components/Header';
import ToastStack from './components/Toast';
import PortalContent from './pages/PortalContent';
import ForkliftApp from './pages/forklift/ForkliftApp';
import WebSlingApp from './pages/websling/WebSlingApp';
import HoistApp from './pages/hoist/HoistApp';
import TrainingApp from './pages/training/TrainingApp';
import MocApp from './pages/moc/MocApp';
import DocReviewApp from './pages/docreview/DocReviewApp';
import FireSafetyApp from './pages/firesafety/FireSafetyApp';
import useToasts from './hooks/useToasts';
import {
  PAGE_TITLES, FORKLIFT_TITLES, WEBSLING_TITLES, HOIST_TITLES, TRAINING_TITLES, MOC_TITLES, DOC_REVIEW_TITLES, FIRE_TITLES,
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
};

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('ehs-portal-authed') === '1');
  const [appMode, setAppMode] = useState('portal'); // 'portal' | one of the SUB_APPS keys
  const [portalView, setPortalView] = useState('dashboard');
  const [subViews, setSubViews] = useState(() => (
    Object.fromEntries(Object.entries(SUB_APPS).map(([key, cfg]) => [key, cfg.defaultView]))
  ));
  const [expanded, setExpanded] = useState(() => new Set());
  const { toasts, push: pushToast, dismiss } = useToasts();

  const handleLoginSuccess = (remember) => {
    if (remember) localStorage.setItem('ehs-portal-authed', '1');
    setAuthed(true);
    setAppMode('portal');
    setPortalView('dashboard');
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
    if (item?.isApp && SUB_APPS[item.appTarget]) {
      setExpanded((prev) => new Set(prev).add('ehs-audit'));
      setSubViews((prev) => ({ ...prev, [item.appTarget]: SUB_APPS[item.appTarget].defaultView }));
      setAppMode(item.appTarget);
      return;
    }
    setPortalView(id);
  };

  const handleSubNavigate = (appKey) => (id) => setSubViews((prev) => ({ ...prev, [appKey]: id }));
  const handleBackToPortal = () => setAppMode('portal');
  const handleLogout = () => {
    localStorage.removeItem('ehs-portal-authed');
    setAuthed(false);
  };

  const activeSubApp = SUB_APPS[appMode];
  const title = activeSubApp ? activeSubApp.titles[subViews[appMode]] : (PAGE_TITLES[portalView] || 'EHS Portal');

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
            <PortalContent key={portalView} view={portalView} pushToast={pushToast} />
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

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
