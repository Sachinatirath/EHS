import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch } from '../../components/icons';
import { SAFETY_ALERTS, ALERT_STATUS_PILL, DEPARTMENTS, nextIncidentId } from '../../data/trainingData';

const EMPTY = { title: '', date: '', departments: '', summary: '', action: '' };

export default function IncidentCommunicationPage({ pushToast }) {
  const [rows, setRows] = useState(SAFETY_ALERTS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [incidentId, setIncidentId] = useState(nextIncidentId());

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.title.toLowerCase().includes(q) || r.incident.toLowerCase().includes(q);
  }), [rows, search]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => { setIncidentId(nextIncidentId()); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      pushToast('Incident title is required.', 'error');
      return;
    }
    setRows((r) => [{
      alert: `SA-${String(r.length + 1).padStart(3, '0')}`,
      incident: incidentId,
      title: form.title,
      departments: form.departments || 'All Departments',
      issued: form.date || 'Today',
      status: 'Issued',
      ack: 0,
    }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`Safety alert created and notified to ${form.departments || 'all departments'}.`, 'success');
  };

  const handleNotify = (alert) => pushToast(`Reminder sent for ${alert}.`, 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Incident Communication"
        subtitle="Safety alerts, lessons learned, toolbox talks and acknowledgement"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> New Safety Alert
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incident / alert..." />
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert</th><th>Incident</th><th>Title</th><th>Departments</th>
                <th>Issued</th><th>Status</th><th>Acknowledgement</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.alert}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.alert}</td>
                  <td>{r.incident}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.departments}</td>
                  <td>{r.issued}</td>
                  <td><span className={`pill ${ALERT_STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td>{r.ack}%</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleNotify(r.alert)}>Notify</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No safety alerts match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Incident Safety Communication" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSave}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Incident ID</label>
              <input value={incidentId} readOnly />
            </div>
            <div className="field">
              <label>Communication Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="field">
              <label>Incident Title</label>
              <input value={form.title} onChange={set('title')} placeholder="Near Miss / Injury / Unsafe Condition" />
            </div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Concern Departments</label>
            <input value={form.departments} onChange={set('departments')} placeholder={DEPARTMENTS.slice(0, 2).join(', ')} />
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Incident Summary / Lessons Learned</label>
            <textarea rows={3} value={form.summary} onChange={set('summary')} />
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Required Corrective / Preventive Action</label>
            <textarea rows={3} value={form.action} onChange={set('action')} />
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Communication Evidence</label>
            <input type="file" multiple />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Create Alert &amp; Notify</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
