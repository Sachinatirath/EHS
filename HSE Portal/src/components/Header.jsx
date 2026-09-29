import { IconLogout } from './icons';

const IconMenu = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export default function Header({ title, onLogout, onMenu }) {
  return (
    <header className="app-header">
      <div className="header-crumb">
        <button type="button" className="icon-btn header-menu" aria-label="Open menu" onClick={onMenu}>
          <IconMenu />
        </button>
        <span className="header-title">{title}</span>
      </div>
      <div className="header-right">
        <span className="status-chip">
          <span className="status-dot" />
          admin
        </span>
        <button type="button" className="icon-btn" title="Log out" onClick={onLogout}>
          <IconLogout size={17} />
        </button>
      </div>
    </header>
  );
}
