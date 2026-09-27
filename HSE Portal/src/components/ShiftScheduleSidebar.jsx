import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconUser, IconUsers } from './icons';
import {
  useShiftAuth, selectRole, selectEmployee, selectHodDepartment, listEmployees, SS_DEPARTMENTS, hodName,
} from '../pages/shiftschedule/store';

const GROUPS = [
  {
    role: 'employee',
    label: 'Employee',
    icon: IconUser,
    children: [
      { id: 'ss-emp-schedule', label: "Today's Shift Schedule" },
      { id: 'ss-emp-new', label: 'Request Change / Swap' },
      { id: 'ss-emp-requests', label: 'My Requests' },
    ],
  },
  {
    role: 'hod',
    label: 'HOD',
    icon: IconUsers,
    children: [
      { id: 'ss-hod-dashboard', label: 'Dashboard' },
      { id: 'ss-hod-requests', label: 'Approvals' },
      { id: 'ss-hod-schedule', label: 'Shift Schedule' },
    ],
  },
];

const selectStyle = {
  width: '100%', marginTop: 6, padding: '6px 8px', borderRadius: 8, fontSize: 12.5,
  background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
};

export default function ShiftScheduleSidebar({ activeId, onNavigate, onBack }) {
  const { user } = useShiftAuth();
  const [expanded, setExpanded] = useState(() => new Set(['employee', 'hod']));

  // Land on the employee view the first time the module opens.
  useEffect(() => {
    if (!user) selectRole('employee');
  }, [user]);

  const toggle = (role) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    return next;
  });

  const pick = (role, id) => {
    selectRole(role);
    onNavigate(id);
  };

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Shift Schedule</span>
      </button>

      <nav className="sidebar-scroll">
        {GROUPS.map((group) => {
          const isOpen = expanded.has(group.role);
          const GroupIcon = group.icon;
          return (
            <div key={group.role}>
              <button
                type="button"
                className={`nav-item${user?.role === group.role ? ' active' : ''}${isOpen ? ' expanded' : ''}`}
                onClick={() => toggle(group.role)}
              >
                <span className="nav-icon"><GroupIcon size={17} /></span>
                <span className="nav-label">{group.label}</span>
                <span className="chevron"><IconChevronDown /></span>
              </button>
              <div className={`nav-submenu${isOpen ? ' open' : ''}`}>
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

      {user ? (
        <div style={{ padding: '12px 22px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>Viewing as {user.name}</div>
          {user.role === 'hod' ? (
            <select style={selectStyle} value={user.department} onChange={(e) => selectHodDepartment(e.target.value)} aria-label="HOD department">
              {SS_DEPARTMENTS.map((d) => <option key={d} value={d} style={{ color: '#000' }}>{d} HOD — {hodName(d)}</option>)}
            </select>
          ) : (
            <select style={selectStyle} value={user.id} onChange={(e) => selectEmployee(e.target.value)} aria-label="Employee">
              {listEmployees().map((e) => <option key={e.id} value={e.id} style={{ color: '#000' }}>{e.name} ({e.id}) · {e.department}</option>)}
            </select>
          )}
        </div>
      ) : null}
    </aside>
  );
}
