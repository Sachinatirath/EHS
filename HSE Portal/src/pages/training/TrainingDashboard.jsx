import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import CreateTrainingSessionModal from './CreateTrainingSessionModal';
import { IconUsers, IconCheckCircle, IconClock, IconAlertTriangle, IconArrowUpRight, IconPlus } from '../../components/icons';

const COMPLIANCE_ITEMS = [
  { label: 'Safety Induction', value: 98 },
  { label: 'General Safety', value: 94 },
  { label: 'Special Training', value: 91 },
  { label: 'Emergency', value: 96 },
];

const ATTENTION_ITEMS = [
  { title: '19 certificates', sub: 'Expired / due for action' },
  { title: '74 employee trainings', sub: 'Due for renewal' },
  { title: '7 HOD approvals', sub: 'Pending review' },
  { title: '24 acknowledgements', sub: 'Reminder pending' },
];

export default function TrainingDashboard({ pushToast, onNavigate }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (session) => {
    setModalOpen(false);
    pushToast(`${session.id} (${session.topic}) saved with ${session.participants.length} participant(s).`, 'success');
    onNavigate('tr-sessions');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Training Management Dashboard"
        subtitle="Employee master → training matrix → sessions → certificates → approval → alerts"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Training Session
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value="1,284" label="Total Employees" color="#2563eb" bg="#eef4ff" icon={<IconUsers size={18} />} delay={0} />
        <StatCard value="1,106" label="Fully Compliant" color="#b45309" bg="#fef1d6" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={74} label="Training Due" color="#15803d" bg="#d9f6e4" icon={<IconClock size={18} />} delay={80} />
        <StatCard value={19} label="Certificates Expiring" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={7} label="HOD Pending" color="#2563eb" bg="#eef4ff" icon={<IconArrowUpRight size={18} />} delay={160} />
      </div>

      <div className="workflow-strip">
        <strong>End-to-end workflow:</strong> Employee Master → Role/Department Training Matrix → Create Training Session → Add Employee IDs → Attendance → Assessment → Certificate → Employee-wise Tracking → Expiry Reminder → HOD Review → Approval → HOD Report.
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Training Compliance</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {COMPLIANCE_ITEMS.map((c) => (
                <span key={c.label} className="pill pill-green">{c.label} {c.value}%</span>
              ))}
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '93%' }} /></div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--slate-500)' }}>
              Overall mandatory training compliance: <strong style={{ color: 'var(--slate-900)' }}>93%</strong>
            </div>
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderTop: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Immediate Attention</h3>
            <ul className="side-list">
              {ATTENTION_ITEMS.map((a) => (
                <li key={a.title} style={{ cursor: 'pointer' }} onClick={() => pushToast(`${a.title} — ${a.sub}`, 'info')}>
                  <div className="side-title">{a.title}</div>
                  <div className="side-sub">{a.sub}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <CreateTrainingSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
