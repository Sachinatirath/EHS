export default function StatCard({ value, label, icon, color, bg, delay = 0 }) {
  return (
    <div
      className="stat-card"
      style={{ '--accent-color': color, '--accent-bg': bg, animationDelay: `${delay}ms` }}
    >
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {icon ? <span className="stat-icon">{icon}</span> : null}
    </div>
  );
}
