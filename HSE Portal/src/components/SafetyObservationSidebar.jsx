import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconEye, IconClipboard } from './icons';
import { useSafetyObservationAuth, selectRole } from '../pages/safetyobservation/store';

const GROUPS = [
  {
    role: 'agent',
    label: 'Agent UI',
    icon: IconEye,
    children: [
      { id: 'so-agent-home', label: 'Home' },
      { id: 'so-agent-create', label: 'New Observation' },
      { id: 'so-agent-alerts', label: 'Alerts' },
      { id: 'so-agent-profile', label: 'Profile' },
    ],
  },
  {
    role: 'hod',
    label: 'HOD Dashboard',
    icon: IconClipboard,
    children: [
      { id: 'so-hod-dashboard', label: 'Dashboard' },
      { id: 'so-hod-observations', label: 'Observations' },
      { id: 'so-hod-alerts', label: 'Alerts' },
      { id: 'so-hod-profile', label: 'Profile' },
    ],
  },
];

export default function SafetyObservationSidebar({ activeId, onNavigate, onBack }) {
  const auth = useSafetyObservationAuth();

  useEffect(() => {
    if (!auth.user) selectRole('agent');
  }, [auth.user]);
  const [expanded, setExpanded] = useState(() => new Set(['agent']));

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
    <aside className="sidebar so-theme">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Safety Observation</span>
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
            {auth.user.employee_id} · {auth.user.role === 'hod' ? (auth.user.department === 'Manager' ? 'Manager' : `Shift ${auth.user.shift} HOD · ${auth.user.department}`) : 'Safety Agent'}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
