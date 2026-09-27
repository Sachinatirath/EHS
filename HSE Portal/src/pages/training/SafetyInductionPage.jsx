import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { SAFETY_INDUCTIONS, EMPLOYEE_TYPES } from '../../data/trainingData';

const STATUS_PILL = { Valid: 'pill-green', Expired: 'pill-red' };
const EMPTY = { empId: '', date: '', type: EMPLOYEE_TYPES[0], topics: '' };

export default function SafetyInductionPage({ pushToast }) {
  const [rows, setRows] = useState(SAFETY_INDUCTIONS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.empId.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  }), [rows, search]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.empId.trim()) {
      pushToast('Employee ID is required.', 'error');
      return;
    }
    setRows((r) => [{
      id: `IND-${String(r.length + 1).padStart(3, '0')}`,
      empId: form.empId,
      name: '—',
      department: '—',
      date: form.date || 'Not set',
      status: 'Valid',
    }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`Safety induction record saved for ${form.empId}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Safety Induction"
        subtitle="Employee / contractor induction before site access"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Induction
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Employee ID / name..." />
        </div>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Safety induction register exported.', 'info')}>
          <IconDownload size={15} /> Export
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Date</th><th>Employee ID</th><th>Name</th><th>Department</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.date}</td>
                  <td>{r.empId}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.department}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No induction records match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Safety Induction Record" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSave}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Employee ID *</label>
              <input value={form.empId} onChange={set('empId')} placeholder="EMP-1001" required />
            </div>
            <div className="field">
              <label>Induction Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="field">
              <label>Induction Type</label>
              <select value={form.type} onChange={set('type')}>
                {EMPLOYEE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Topics Covered</label>
            <textarea rows={3} value={form.topics} onChange={set('topics')} placeholder="Site rules, PPE, emergency, work permits, reporting, prohibited practices..." />
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Evidence / Attendance Sheet</label>
            <input type="file" multiple />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Save Induction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
