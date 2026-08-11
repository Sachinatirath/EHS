import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
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
        <StatCard value={74} label="Training Due" variant="blue" icon={<IconClock size={18} />} delay={0} />
        <StatCard value={19} label="Certificate Expiry" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={7} label="HOD Approval" variant="green" icon={<IconArrowUpRight size={18} />} delay={80} />
        <StatCard value={24} label="Incident Ack" variant="red" icon={<IconIncident size={18} />} delay={120} />
        <StatCard value={18} label="Sent Today" variant="amber" icon={<IconBell size={18} />} delay={160} />
      </div>

      <Panel noMargin plain title="Notification Rules" style={{ borderLeft: '3px solid var(--green-500)' }}>
        <ul className="workflow-list">
          {NOTIFICATION_RULES.map((r) => (
            <li key={r.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span>⏰</span>
              <span style={{ fontSize: 13.5, color: 'var(--slate-700)' }}>{r.text}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
