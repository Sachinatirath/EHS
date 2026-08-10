import { DOC_REVIEW_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconGauge, IconClipboard, IconFileText, IconPlus,
  IconClock, IconUser, IconRepeat, IconCheckSquare, IconArchive,
} from './icons';

const ICONS = {
  'dr-dashboard': IconGauge,
  'dr-inbox': IconClipboard,
  'dr-documents': IconGrid,
  'dr-submit': IconPlus,
  'dr-pending': IconClock,
  'dr-assignments': IconUser,
  'dr-history': IconRepeat,
  'dr-approvals': IconCheckSquare,
  'dr-register': IconFileText,
  'dr-archive': IconArchive,
  'dr-reports': IconGrid,
};

export default function DocReviewSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Doc Review</span>
      </button>
      <nav className="sidebar-scroll">
        {DOC_REVIEW_NAV.map((item) => {
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
