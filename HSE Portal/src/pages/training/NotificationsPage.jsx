import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { IconPlus, IconClock, IconAlertTriangle, IconArrowUpRight, IconAlertTriangle as IconIncident, IconBell } from '../../components/icons';
import { NOTIFICATION_RULES } from '../../data/trainingData';

export default function NotificationsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Notifications & Reminders"
        subtitle="Training due, expiry, approval and incident communication alerts"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => pushToast('Reminder queued for all pending items.', 'success')}>
            <IconPlus /> Send Reminder
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={74} label="Training Due" color="#2563eb" bg="#eef4ff" icon={<IconClock size={18} />} delay={0} />
        <StatCard value={19} label="Certificate Expiry" color="#b45309" bg="#fef1d6" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={7} label="HOD Approval" color="#15803d" bg="#d9f6e4" icon={<IconArrowUpRight size={18} />} delay={80} />
        <StatCard value={24} label="Incident Ack" color="#dc2626" bg="#fde0e0" icon={<IconIncident size={18} />} delay={120} />
        <StatCard value={18} label="Sent Today" color="#b45309" bg="#fef1d6" icon={<IconBell size={18} />} delay={160} />
      </div>

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--green-500)' }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Notification Rules</h3>
          <ul className="workflow-list">
            {NOTIFICATION_RULES.map((r) => (
              <li key={r.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span>⏰</span>
                <span style={{ fontSize: 13.5, color: 'var(--slate-700)' }}>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
