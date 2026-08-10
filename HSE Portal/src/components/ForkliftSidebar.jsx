import { FORKLIFT_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconForklift, IconClipboard, IconEye, IconLayers,
  IconCheckSquare, IconTool, IconFileText, IconGauge,
} from './icons';

const ICONS = {
  'fl-dashboard': IconGauge,
  'fl-master': IconForklift,
  'fl-audit': IconClipboard,
  'fl-observations': IconEye,
  'fl-dept': IconLayers,
  'fl-hod': IconCheckSquare,
  'fl-corrective': IconTool,
  'fl-history': IconFileText,
  'fl-reports': IconGrid,
};

export default function ForkliftSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>ForkLift Safety</span>
      </button>
      <nav className="sidebar-scroll">
        {FORKLIFT_NAV.map((item) => {
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
