import { useEffect, useMemo, useRef, useState } from 'react';
import { PORTAL_NAV } from '../data/navConfig';
import {
  IconLogout, IconSearch, IconCalendarCheck, IconChevronDown, IconUser, IconClock, IconArrowRight,
} from './icons';

const IconMenu = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

// Every page reachable from the portal sidebar, with its group as context ("EHS Audit › ForkLift").
const SEARCH_INDEX = PORTAL_NAV.flatMap((g) => g.items).flatMap((item) => (
  item.children
    ? item.children.map((c) => ({ ...c, hint: item.label }))
    : [{ ...item, hint: item.isApp ? 'Module' : 'Page' }]
));

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Closes a popover when clicking outside `ref` or pressing Escape. */
function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
}

function HeaderSearch({ onNavigate }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  useDismiss(wrapRef, open, () => setOpen(false));

  // Ctrl/Cmd + K focuses the search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? SEARCH_INDEX.filter((r) => r.label.toLowerCase().includes(term) || r.hint.toLowerCase().includes(term))
      : SEARCH_INDEX.filter((r) => r.isApp);
    return list.slice(0, 8);
  }, [q]);

  const pick = (r) => {
    onNavigate(r.id, r);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); pick(results[cursor]); }
  };

  return (
    <div className={`hdr-search${open ? ' open' : ''}`} ref={wrapRef}>
      <IconSearch size={16} />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => { setQ(e.target.value); setCursor(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Jump to a module or page…"
        aria-label="Search pages"
      />
      <kbd>Ctrl K</kbd>
      {open ? (
        <div className="hdr-pop hdr-results" role="listbox">
          <div className="hdr-pop-label">{q.trim() ? 'Results' : 'Modules'}</div>
          {results.length ? results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="option"
              aria-selected={i === cursor}
              className={`hdr-result${i === cursor ? ' active' : ''}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(r)}
            >
              <span className="hdr-result-label">{r.label}</span>
              <span className="hdr-result-hint">{r.hint}</span>
              <IconArrowRight size={14} />
            </button>
          )) : <div className="hdr-empty">No page matches “{q}”.</div>}
        </div>
      ) : null}
    </div>
  );
}

function UserMenu({ onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="hdr-user-wrap" ref={ref}>
      <button type="button" className={`hdr-user${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="hdr-avatar">AD</span>
        <span className="hdr-user-text">
          <strong>Admin</strong>
          <span>EHS Administrator</span>
        </span>
        <IconChevronDown size={15} />
      </button>
      {open ? (
        <div className="hdr-pop hdr-menu" role="menu">
          <div className="hdr-menu-head">
            <span className="hdr-avatar hdr-avatar-lg">AD</span>
            <div>
              <strong>Admin</strong>
              <span><span className="status-dot" /> Online · EHS Administrator</span>
            </div>
          </div>
          <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => { setOpen(false); onProfile(); }}>
            <IconUser size={16} /> My Profile
          </button>
          <button type="button" role="menuitem" className="hdr-menu-item hdr-menu-danger" onClick={() => { setOpen(false); onLogout(); }}>
            <IconLogout size={16} /> Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Header({ title, section, onLogout, onMenu, onNavigate, onTodayPlan }) {
  const now = useNow();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const date = now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <header className={`app-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-crumb">
        <button type="button" className="icon-btn header-menu" aria-label="Open menu" onClick={onMenu}>
          <IconMenu />
        </button>
        <div className="header-heading">
          {section ? <span className="header-section">{section}</span> : null}
          <span key={title} className="header-title">{title}</span>
        </div>
      </div>

      <HeaderSearch onNavigate={onNavigate} />

      <div className="header-right">
        <span className="hdr-clock" title={now.toLocaleString()}>
          <IconClock size={15} />
          <span>{date}</span>
          <strong>{time}</strong>
        </span>
        <button type="button" className="hdr-icon-btn" title="Today's Audit & Training Plan" aria-label="Today's plan" onClick={onTodayPlan}>
          <IconCalendarCheck size={18} />
        </button>
        <UserMenu onProfile={() => onNavigate('profile')} onLogout={onLogout} />
      </div>
    </header>
  );
}
