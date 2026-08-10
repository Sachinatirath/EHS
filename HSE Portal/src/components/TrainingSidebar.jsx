import { TRAINING_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconUsers, IconBookOpen, IconGauge, IconAward,
  IconShieldCheck, IconCap, IconMegaphone, IconCheckSquare, IconBell, IconFileText,
} from './icons';

const ICONS = {
  'tr-dashboard': IconGauge,
  'tr-employees': IconUsers,
  'tr-sessions': IconBookOpen,
  'tr-matrix': IconGrid,
  'tr-certificates': IconAward,
  'tr-induction': IconShieldCheck,
  'tr-special': IconCap,
  'tr-incident': IconMegaphone,
  'tr-hod': IconCheckSquare,
  'tr-notifications': IconBell,
  'tr-reports': IconFileText,
};

export default function TrainingSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Training</span>
      </button>
      <nav className="sidebar-scroll">
        {TRAINING_NAV.map((item) => {
          const Icon = ICONS[item.id] || IconGrid;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item${activeId === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon"><Icon size={17} /></span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
