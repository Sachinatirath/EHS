import { MOC_NAV } from '../data/navConfig';
import {
  IconChevronLeft, IconGrid, IconGauge, IconClipboard, IconPlus, IconSearch,
  IconAlertTriangle, IconTool, IconCheckSquare, IconRepeat, IconCheckCircle, IconFileText,
} from './icons';

const ICONS = {
  'moc-dashboard': IconGauge,
  'moc-register': IconClipboard,
  'moc-new': IconPlus,
  'moc-risk-review': IconSearch,
  'moc-risk-assessment': IconAlertTriangle,
  'moc-actions': IconTool,
  'moc-approval': IconCheckSquare,
  'moc-implementation': IconRepeat,
  'moc-verification': IconCheckCircle,
  'moc-audit-trail': IconFileText,
  'moc-reports': IconGrid,
};

export default function MocSidebar({ activeId, onNavigate, onBack }) {
  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Management of Change</span>
      </button>
      <nav className="sidebar-scroll">
        {MOC_NAV.map((item) => {
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
