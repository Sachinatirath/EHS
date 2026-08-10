import { HOIST_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconHoist, IconClipboard, IconCheckSquare, IconTool,
  IconFileText, IconGauge,
} from './icons';

const ICONS = {
  'ho-dashboard': IconGauge,
  'ho-master': IconHoist,
  'ho-audit': IconClipboard,
  'ho-hod': IconCheckSquare,
  'ho-corrective': IconTool,
  'ho-history': IconFileText,
  'ho-reports': IconGrid,
};

export default function HoistSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Hoist &amp; EOT Crane</span>
      </button>
      <nav className="sidebar-scroll">
        {HOIST_NAV.map((item) => {
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
