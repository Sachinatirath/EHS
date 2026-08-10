import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ObservationModal from '../../components/ObservationModal';
import { IconPlus, IconAlertTriangle, IconClock, IconCheckCircle, IconPercent } from '../../components/icons';
import { CORRECTIVE_ACTIONS, CA_STATUS_PILL, nextActionId } from '../../data/forkliftData';

export default function CorrectiveActionsPage({ pushToast }) {
  const [rows, setRows] = useState(CORRECTIVE_ACTIONS);
  const [modalOpen, setModalOpen] = useState(false);

  const stats = useMemo(() => {
    const open = rows.filter((r) => r.status === 'OPEN').length;
    const inProgress = rows.filter((r) => r.status === 'IN PROGRESS').length;
    const overdue = 2; // sample overdue count consistent with dashboard figures
    const closed = rows.filter((r) => r.status === 'CLOSED').length + 8; // matches dashboard's closed history total
    const critical = 3;
    const total = open + inProgress + closed;
    const closureRate = total ? Math.round((closed / total) * 100) : 0;
    return { open, inProgress, overdue, closed, critical, closureRate };
  }, [rows]);

  const handleCreate = (data) => {
    const row = {
      id: nextActionId(),
      forklift: data.forklift,
      finding: data.finding,
      dept: data.department,
      owner: data.hod || `${data.department} HOD`,
      due: data.dueDate || '—',
      status: 'OPEN',
      action: 'Escalate',
    };
    setRows((r) => [row, ...r]);
    setModalOpen(false);
    pushToast(`${row.id} logged for ${row.dept}.`, 'success');
  };

  const handleRowAction = (row) => {
    if (row.action === 'Escalate') {
      pushToast(`${row.id} escalated to ${row.dept} HOD.`, 'info');
    } else if (row.action === 'Remind') {
      pushToast(`Reminder sent to ${row.owner}.`, 'info');
    } else {
      pushToast(`Opening evidence for ${row.id}.`, 'info');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Corrective Action Tracker"
        subtitle="Department-wise action owner, due date, evidence and closure"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Action
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={stats.open} label="Open" color="#2563eb" bg="#eef4ff" icon={<IconAlertTriangle size={18} />} delay={0} />
        <StatCard value={stats.inProgress} label="In Progress" color="#b45309" bg="#fef1d6" icon={<IconClock size={18} />} delay={40} />
        <StatCard value={stats.overdue} label="Overdue" color="#15803d" bg="#d9f6e4" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={stats.closed} label="Closed" color="#dc2626" bg="#fde0e0" icon={<IconCheckCircle size={18} />} delay={120} />
        <StatCard value={stats.critical} label="Critical" color="#b45309" bg="#fef1d6" icon={<IconAlertTriangle size={18} />} delay={160} />
        <StatCard value={`${stats.closureRate}%`} label="Closure Rate" color="#2563eb" bg="#eef4ff" icon={<IconPercent size={18} />} delay={200} />
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action ID</th><th>Forklift</th><th>Finding</th><th>Department</th>
                <th>Owner</th><th>Due</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.forklift}</td>
                  <td>{r.finding}</td>
                  <td>{r.dept}</td>
                  <td>{r.owner}</td>
                  <td>{r.due}</td>
                  <td><span className={`pill ${CA_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleRowAction(r)}>
                      {r.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ObservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitLabel="Create Action"
      />
    </div>
  );
}
