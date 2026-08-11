import { STAT_VARIANTS } from '../data/statColors';

export default function StatCard({ value, label, icon, variant, color, bg, delay = 0 }) {
  const resolved = variant && STAT_VARIANTS[variant] ? STAT_VARIANTS[variant] : { color, bg };
  return (
    <div
      className="stat-card"
      style={{ '--accent-color': resolved.color, '--accent-bg': resolved.bg, animationDelay: `${delay}ms` }}
    >
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {icon ? <span className="stat-icon">{icon}</span> : null}
    </div>
  );
}
