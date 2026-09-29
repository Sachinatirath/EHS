import { PORTAL_NAV } from '../data/navConfig';
import BrandMark from './BrandMark';
import {
  IconUser, IconGrid, IconClipboard, IconChevronDown, IconCap, IconCalendarCheck,
  IconAlertTriangle, IconEye, IconFlag, IconFileText, IconRepeat, IconCheckSquare,
  IconShieldCheck, IconLayers, IconUsers, IconMail, IconFlame, IconHardHat, IconSettings,
  IconFirstAid, IconHome, IconClock,
} from './icons';

const ICONS = {
  home: IconHome,
  clock: IconClock,
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
  firstAid: IconFirstAid,
  settings: IconSettings,
};

// Running index across all groups so the entrance animation staggers top to bottom.
const ANIM_INDEX = Object.fromEntries(PORTAL_NAV.flatMap((g) => g.items).map((item, i) => [item.id, i]));

export default function Sidebar({ activeId, expanded, onToggle, onNavigate }) {
  return (
    <aside className="sidebar sidebar-portal">
      <div className="sidebar-brand">
        <BrandMark tone="dark" />
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

              return (
                <div key={item.id} className="nav-anim" style={{ '--i': ANIM_INDEX[item.id] }}>
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
                    <div className={`nav-submenu${isOpen ? ' open' : ''}`}>
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
      <div className="sidebar-footer">
        <button
          type="button"
          className={`sidebar-user${activeId === 'profile' ? ' active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          <span className="sidebar-avatar">AD</span>
          <span className="sidebar-user-text">
            <strong>Admin</strong>
            <span>EHS Administrator · View profile</span>
          </span>
          <IconChevronDown size={16} />
        </button>
      </div>
    </aside>
  );
}
