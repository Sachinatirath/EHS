import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconFirstAid, IconClipboard } from './icons';
import { useFastAidAuth, selectRole } from '../pages/fastaid/store';

const GROUPS = [
  {
    role: 'area_incharge',
    label: 'Area Incharge',
    icon: IconFirstAid,
    children: [
      { id: 'fa-ai-home', label: 'Home' },
      { id: 'fa-ai-inspect', label: 'Start Inspection' },
      { id: 'fa-ai-inspections', label: 'My Inspections' },
      { id: 'fa-ai-alerts', label: 'Alerts' },
      { id: 'fa-ai-profile', label: 'Profile' },
    ],
  },
  {
    role: 'ohc',
    label: 'OHC Dashboard',
    icon: IconClipboard,
    children: [
      { id: 'fa-ohc-dashboard', label: 'Dashboard' },
      { id: 'fa-ohc-boxes', label: 'First Aid Boxes' },
      { id: 'fa-ohc-records', label: 'Records' },
      { id: 'fa-ohc-refills', label: 'Refill Requests' },
      { id: 'fa-ohc-alerts', label: 'Alerts' },
      { id: 'fa-ohc-profile', label: 'Profile' },
    ],
  },
];

export default function FastAidSidebar({ activeId, onNavigate, onBack }) {
  const auth = useFastAidAuth();

  useEffect(() => {
    if (!auth.user) selectRole('area_incharge');
  }, [auth.user]);
  const [expanded, setExpanded] = useState(() => new Set(['area_incharge']));

  const toggle = (role) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const pick = (role, id) => {
    selectRole(role);
    onNavigate(id);
  };

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>FastAid</span>
      </button>

      <nav className="sidebar-scroll">
        {GROUPS.map((group) => {
          const isOpen = expanded.has(group.role);
          const childActive = group.children.some((c) => c.id === activeId);
          const isActiveRole = auth.user?.role === group.role;
          const GroupIcon = group.icon;

          return (
            <div key={group.role}>
              <button
                type="button"
                className={`nav-item${isActiveRole && childActive ? ' active' : ''}${isOpen ? ' expanded' : ''}`}
                onClick={() => toggle(group.role)}
              >
                <span className="nav-icon"><GroupIcon size={17} /></span>
                <span className="nav-label">{group.label}</span>
                <span className="chevron"><IconChevronDown /></span>
              </button>
              <div className={`nav-submenu${isOpen || childActive ? ' open' : ''}`}>
                {group.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={`nav-item sub${activeId === child.id ? ' active' : ''}`}
                    onClick={() => pick(group.role, child.id)}
                  >
                    <span className="nav-label">{child.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {auth.user ? (
        <div style={{ padding: '12px 22px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Viewing as {auth.user.name}
          </div>
          <div style={{ fontSize: 11, color: '#8391b5', marginTop: 2 }}>
            {auth.user.employee_id} · {auth.user.role === 'ohc' ? 'OHC Team' : 'Area Incharge'}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
