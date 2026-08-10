import { PORTAL_NAV } from '../data/navConfig';
import {
  IconUser, IconGrid, IconClipboard, IconChevronDown, IconCap, IconCalendarCheck,
  IconAlertTriangle, IconEye, IconFlag, IconFileText, IconRepeat, IconCheckSquare,
  IconShieldCheck, IconLayers, IconUsers, IconMail, IconFlame, IconHardHat, IconSettings,
} from './icons';

const ICONS = {
  user: IconUser,
  grid: IconGrid,
  clipboard: IconClipboard,
  cap: IconCap,
  calendarCheck: IconCalendarCheck,
  alertTriangle: IconAlertTriangle,
  eye: IconEye,
  flag: IconFlag,
  fileText: IconFileText,
  repeat: IconRepeat,
  checkSquare: IconCheckSquare,
  shieldCheck: IconShieldCheck,
  layers: IconLayers,
  users: IconUsers,
  mail: IconMail,
  flame: IconFlame,
  hardHat: IconHardHat,
  settings: IconSettings,
};

export default function Sidebar({ activeId, expanded, onToggle, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <IconShieldCheck size={22} />
        EHS PORTAL
      </div>
      <nav className="sidebar-scroll">
        {PORTAL_NAV.map((group, groupIdx) => (
          <div key={`${group.section}-${groupIdx}`}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] || IconGrid;
              const hasChildren = !!item.children;
              const isOpen = expanded.has(item.id);
              const isActive = !hasChildren && activeId === item.id;
              const childActive = hasChildren && item.children.some((c) => c.id === activeId);

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    className={`nav-item${isActive ? ' active' : ''}${isOpen ? ' expanded' : ''}`}
                    onClick={() => (hasChildren ? onToggle(item.id) : onNavigate(item.id, item))}
                  >
                    <span className="nav-icon"><Icon size={17} /></span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                    {hasChildren ? <span className="chevron"><IconChevronDown /></span> : null}
                  </button>
                  {hasChildren && (
                    <div className={`nav-submenu${isOpen || childActive ? ' open' : ''}`}>
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={`nav-item sub${activeId === child.id ? ' active' : ''}`}
                          onClick={() => onNavigate(child.id, child)}
                        >
                          <span className="nav-label">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
