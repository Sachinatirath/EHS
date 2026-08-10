import { IconLogout } from './icons';

export default function Header({ title, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-crumb">
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
