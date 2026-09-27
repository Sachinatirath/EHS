import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconShieldCheck, IconUsers } from './icons';
import { useMachineAuditAuth, selectRole } from '../pages/machineaudit/store';

const GROUPS = [
  {
    role: 'officer',
    label: 'Safety Officer',
    icon: IconShieldCheck,
    children: [
      { id: 'ma-officer-home', label: 'My Audits' },
      { id: 'ma-officer-create', label: 'New Machine Audit' },
      { id: 'ma-officer-machines', label: 'Audited Machines' },
      { id: 'ma-officer-alerts', label: 'Alerts' },
      { id: 'ma-officer-profile', label: 'Profile' },
    ],
  },
  {
    role: 'incharge',
    label: 'In-charge',
    icon: IconUsers,
    children: [
      { id: 'ma-incharge-home', label: 'Assigned Audits' },
      { id: 'ma-incharge-alerts', label: 'Alerts' },
      { id: 'ma-incharge-profile', label: 'Profile' },
    ],
  },
  {
    role: 'hod',
    label: 'HOD',
    icon: IconShieldCheck,
    children: [
      { id: 'ma-hod-dashboard', label: 'Dashboard' },
      { id: 'ma-hod-machines', label: 'Audited Machines' },
      { id: 'ma-hod-alerts', label: 'Alerts' },
      { id: 'ma-hod-profile', label: 'Profile' },
    ],
  },
];

export default function MachineAuditSidebar({ activeId, onNavigate, onBack }) {
  const auth = useMachineAuditAuth();

  useEffect(() => {
    if (!auth.user) selectRole('officer');
  }, [auth.user]);
  const [expanded, setExpanded] = useState(() => new Set(['officer', 'incharge', 'hod']));

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
    <aside className="sidebar ma-theme">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Machine Audit</span>
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
            {auth.user.employee_id} · {auth.user.role === 'officer' ? 'Safety Officer' : auth.user.title}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
