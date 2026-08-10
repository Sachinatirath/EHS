import { FIRE_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconGauge, IconClipboard, IconFileText, IconPlus,
  IconEye, IconTool, IconRepeat, IconClock, IconAlertTriangle, IconCheckSquare,
} from './icons';

const ICONS = {
  'fs-dashboard': IconGauge,
  'fs-register': IconClipboard,
  'fs-audit': IconFileText,
  'fs-new-audit': IconPlus,
  'fs-observations': IconEye,
  'fs-corrective': IconTool,
  'fs-amc': IconRepeat,
  'fs-service-requests': IconRepeat,
  'fs-pumps': IconGauge,
  'fs-refill': IconClock,
  'fs-expiry': IconAlertTriangle,
  'fs-reports': IconCheckSquare,
  'fs-audit-trail': IconFileText,
};

export default function FireSafetySidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Fire Safety</span>
      </button>
      <nav className="sidebar-scroll">
        {FIRE_NAV.map((item) => {
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
