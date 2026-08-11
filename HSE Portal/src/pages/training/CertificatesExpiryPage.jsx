import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconCheckCircle, IconClock, IconAlertTriangle, IconArrowUpRight, IconBell } from '../../components/icons';
import { CERTIFICATES, CERT_STATUS_PILL, TRAINING_TOPICS } from '../../data/trainingData';

const EMPTY = { empId: '', cert: '', training: TRAINING_TOPICS[0], issue: '', expiry: '', status: 'Valid' };

export default function CertificatesExpiryPage({ pushToast }) {
  const [rows, setRows] = useState(CERTIFICATES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.empId.toLowerCase().includes(q) || r.cert.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rows, search, statusFilter]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSend = (cert) => pushToast(`Expiry reminder sent for ${cert}.`, 'info');

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.empId.trim() || !form.cert.trim()) {
      pushToast('Employee ID and Certificate Number are required.', 'error');
      return;
    }
    setRows((r) => [{ cert: form.cert, empId: form.empId, name: '—', training: form.training, expiry: form.expiry || 'Not set', status: form.status }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`${form.cert} added and linked to ${form.empId}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Certificates & Expiry Tracking"
        subtitle="Certificate status, expiry reminders and renewal follow-up"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Add Certificate
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value="1,182" label="Valid" variant="blue" icon={<IconCheckCircle size={18} />} delay={0} />
        <StatCard value={19} label="Expiring ≤30 Days" variant="amber" icon={<IconClock size={18} />} delay={40} />
        <StatCard value={8} label="Expired" variant="green" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={14} label="Renewal Pending" variant="red" icon={<IconArrowUpRight size={18} />} delay={120} />
        <StatCard value={31} label="Reminder Sent" variant="amber" icon={<IconBell size={18} />} delay={160} />
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Employee ID / certificate..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          {Object.keys(CERT_STATUS_PILL).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate</th><th>Employee ID</th><th>Name</th><th>Training</th>
                <th>Expiry</th><th>Status</th><th>Reminder</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.cert}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.cert}</td>
                  <td>{r.empId}</td>
                  <td>{r.name}</td>
                  <td>{r.training}</td>
                  <td>{r.expiry}</td>
                  <td><span className={`pill ${CERT_STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'Valid'
                      ? '—'
                      : <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleSend(r.cert)}>Send</button>}
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.cert}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No certificates match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Add Training Certificate" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSave}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Employee ID *</label>
              <input value={form.empId} onChange={set('empId')} placeholder="EMP-1001" required />
            </div>
            <div className="field">
              <label>Certificate Number</label>
              <input value={form.cert} onChange={set('cert')} placeholder="CERT-XXXX" />
            </div>
            <div className="field">
              <label>Training</label>
              <select value={form.training} onChange={set('training')}>
                {TRAINING_TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Issue Date</label>
              <input type="date" value={form.issue} onChange={set('issue')} />
            </div>
            <div className="field">
              <label>Expiry Date</label>
              <input type="date" value={form.expiry} onChange={set('expiry')} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                {Object.keys(CERT_STATUS_PILL).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Certificate File</label>
            <input type="file" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Save Certificate &amp; Link Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
