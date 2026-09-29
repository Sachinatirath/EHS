import { useState } from 'react';
import { IconChevronLeft, IconChevronDown, IconUsers } from './icons';
import { useGemba, isEscalated } from '../pages/gembawalk/store';

const GROUPS = [
  {
    id: 'gemba',
    label: 'Gemba Walk',
    icon: IconUsers,
    children: [
      { id: 'gw-dashboard', label: 'Dashboard' },
      { id: 'gw-log', label: 'Log Observation' },
      { id: 'gw-records', label: 'All Observations Log' },
      { id: 'gw-escalations', label: 'Plant Head Escalations', badge: 'escalated' },
    ],
  },
];

export default function GembaWalkSidebar({ activeId, onNavigate, onBack }) {
  const { records, now } = useGemba(15000);
  const escalatedCount = records.filter((o) => isEscalated(o, now)).length;
  const [expanded, setExpanded] = useState(() => new Set(['gemba']));

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="sidebar so-theme">
      <button type="button" className="sidebar-brand" onClick={onBack}>
        <IconChevronLeft size={18} />
        <span style={{ fontSize: 16 }}>Gemba Walk</span>
      </button>

      <nav className="sidebar-scroll">
        {GROUPS.map((group) => {
          const isOpen = expanded.has(group.id);
          const childActive = group.children.some((c) => c.id === activeId);
          const GroupIcon = group.icon;

          return (
            <div key={group.id}>
              <button
                type="button"
                className={`nav-item${childActive ? ' active' : ''}${isOpen ? ' expanded' : ''}`}
                onClick={() => toggle(group.id)}
              >
                <span className="nav-icon"><GroupIcon size={17} /></span>
                <span className="nav-label">{group.label}</span>
                {escalatedCount && !isOpen ? <span className="nav-badge">{escalatedCount}</span> : null}
                <span className="chevron"><IconChevronDown /></span>
              </button>
              <div className={`nav-submenu${isOpen || childActive ? ' open' : ''}`}>
                {group.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={`nav-item sub${activeId === child.id ? ' active' : ''}`}
                    onClick={() => onNavigate(child.id)}
                  >
                    <span className="nav-label">{child.label}</span>
                    {child.badge === 'escalated' && escalatedCount ? <span className="nav-badge">{escalatedCount}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
