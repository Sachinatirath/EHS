import { WEBSLING_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconSling, IconClipboard, IconCheckSquare, IconTool,
  IconFileText, IconGauge,
} from './icons';

const ICONS = {
  'ws-dashboard': IconGauge,
  'ws-master': IconSling,
  'ws-inspection': IconClipboard,
  'ws-hod': IconCheckSquare,
  'ws-corrective': IconTool,
  'ws-history': IconFileText,
  'ws-reports': IconGrid,
};

export default function WebSlingSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Web Sling</span>
      </button>
      <nav className="sidebar-scroll">
        {WEBSLING_NAV.map((item) => {
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
