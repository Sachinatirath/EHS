import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconFirstAid, IconClipboard, IconStethoscope } from './icons';
import { useFastAidAuth, selectRole } from '../pages/fastaid/store';
import { useOhc } from '../pages/ohc/store';
import '../pages/ohc/ohc.css';

// The OHC clinic group isn't a FastAid demo role — its pages share one
// medical-team view, so picking them doesn't switch the FastAid persona.
const OHC_DMS = 'ohc_dms';

const GROUPS = [
  {
    role: OHC_DMS,
    label: 'Digital Occupational Health Management',
    icon: IconStethoscope,
    wrap: true,
    children: [
      { id: 'dm-dashboard', label: 'Dashboard' },
      { id: 'dm-employees', label: 'Employee Master' },
      { id: 'dm-op', label: 'OP Registration' },
      { id: 'dm-nurse', label: 'Nurse Assessment' },
      { id: 'dm-doctor', label: 'MBBS Doctor Consultation' },
      { id: 'dm-history', label: 'Medical History' },
      { id: 'dm-medicines', label: 'Medicine Inventory' },
      { id: 'dm-prescriptions', label: 'Prescriptions' },
      { id: 'dm-followup', label: 'Follow-up & Referral' },
      { id: 'dm-reports', label: 'Reports & Analytics' },
      { id: 'dm-settings', label: 'Settings' },
    ],
  },
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
  const { settings } = useOhc();
  const onOhc = activeId?.startsWith('dm-');

  useEffect(() => {
    if (!auth.user) selectRole('area_incharge');
  }, [auth.user]);
  const [expanded, setExpanded] = useState(() => new Set([OHC_DMS]));

  const toggle = (role) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const pick = (role, id) => {
    if (role !== OHC_DMS) selectRole(role);
    onNavigate(id);
  };

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>OHC</span>
      </button>

      <nav className="sidebar-scroll">
        {GROUPS.map((group) => {
          const isOpen = expanded.has(group.role);
          const childActive = group.children.some((c) => c.id === activeId);
          const isActiveRole = group.role === OHC_DMS ? onOhc : !onOhc && auth.user?.role === group.role;
          const GroupIcon = group.icon;

          return (
            <div key={group.role}>
              <button
                type="button"
                className={`nav-item${isActiveRole && childActive ? ' active' : ''}${isOpen ? ' expanded' : ''}`}
                onClick={() => toggle(group.role)}
              >
                <span className="nav-icon"><GroupIcon size={17} /></span>
                <span className={`nav-label${group.wrap ? ' wrap' : ''}`}>{group.label}</span>
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

      {onOhc ? (
        <div style={{ padding: '12px 22px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {settings.doctor}
          </div>
          <div style={{ fontSize: 11, color: '#8391b5', marginTop: 2 }}>
            OHC Medical Team · {settings.ohc_open ? 'Open' : 'Closed'}
          </div>
        </div>
      ) : auth.user ? (
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
