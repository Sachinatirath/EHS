import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import { IconPlus, IconAlertTriangle, IconClock, IconCheckCircle } from '../../components/icons';
import { SLINGS, CORRECTIVE_ACTIONS, CA_STATUS_PILL } from '../../data/webSlingData';

const EMPTY = { sling: SLINGS[0].id, finding: '', responsible: '', due: '' };
let caSeq = 32;

export default function CorrectiveActionsPage({ pushToast }) {
  const [rows, setRows] = useState(CORRECTIVE_ACTIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const stats = useMemo(() => ({
    open: rows.filter((r) => r.status === 'OPEN').length,
    inProgress: rows.filter((r) => r.status === 'IN PROGRESS').length,
    overdue: rows.filter((r) => r.status === 'OVERDUE').length,
    closed: rows.filter((r) => r.status === 'CLOSED').length + 18, // matches dashboard closed history baseline
  }), [rows]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.finding.trim()) return;
    const row = {
      id: `CA-2026-${String(caSeq++).padStart(3, '0')}`,
      sling: form.sling,
      finding: form.finding,
      responsible: form.responsible || 'Unassigned',
      due: form.due || '—',
      status: 'OPEN',
      action: 'View',
    };
    setRows((r) => [row, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`${row.id} logged for ${row.sling}.`, 'success');
  };

  const handleRowAction = (row) => {
    if (row.action === 'Escalate') {
      pushToast(`${row.id} escalated to ${row.responsible}.`, 'info');
    } else if (row.action === 'Evidence') {
      pushToast(`Opening evidence for ${row.id}.`, 'info');
    } else {
      pushToast(`Viewing ${row.id}.`, 'info');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Corrective Action Tracker"
        subtitle="Findings, responsible persons, due dates and closure verification"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Action
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={stats.open} label="Open" variant="blue" icon={<IconAlertTriangle size={18} />} delay={0} />
        <StatCard value={stats.inProgress} label="In Progress" variant="amber" icon={<IconClock size={18} />} delay={40} />
        <StatCard value={stats.overdue} label="Overdue" variant="green" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={stats.closed} label="Closed" variant="red" icon={<IconCheckCircle size={18} />} delay={120} />
      </div>

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action ID</th><th>Due Date</th><th>Sling</th><th>Finding</th>
                <th>Responsible</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.due}</td>
                  <td style={{ fontWeight: 700 }}>{r.sling}</td>
                  <td>{r.finding}</td>
                  <td>{r.responsible}</td>
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
      </Panel>

      <Modal open={modalOpen} title="Log Corrective Action" onClose={() => setModalOpen(false)} width={620}>
        <form onSubmit={handleCreate}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Sling</label>
              <select value={form.sling} onChange={set('sling')}>
                {SLINGS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Responsible</label>
              <input value={form.responsible} onChange={set('responsible')} placeholder="Department HOD" />
            </div>
            <div className="field">
              <label>Due Date</label>
              <input type="date" value={form.due} onChange={set('due')} />
            </div>
          </div>
          <div className="field" style={{ marginTop: 18 }}>
            <label>Finding <span className="req">*</span></label>
            <textarea value={form.finding} onChange={set('finding')} placeholder="Describe the defect or finding..." style={{ minHeight: 90 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Create Action</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
