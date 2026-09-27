import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { FORKLIFTS, FORKLIFT_TYPES, DEPARTMENTS, MASTER_STATUS_PILL } from '../../data/forkliftData';

const EMPTY = { id: '', type: FORKLIFT_TYPES[0], capacity: '', location: '', department: DEPARTMENTS[0] };

export default function ForkliftMasterPage({ pushToast, onNavigate }) {
  const [rows, setRows] = useState(FORKLIFTS);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q);
    const matchesDept = dept === 'All' || r.department === dept;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  }), [rows, search, dept, status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => {
    const nextNum = rows.length + 1;
    setForm({ ...EMPTY, id: `FL-${String(nextNum).padStart(2, '0')}` });
    setModalOpen(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.id.trim()) return;
    setRows((r) => [{ ...form, status: 'VALID', nextDue: 'Not yet audited' }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} registered successfully.`, 'success');
  };

  const handleExport = () => pushToast('Forklift register exported to CSV.', 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Forklift Master Register"
        subtitle="Equipment profile, capacity, location and inspection status"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> Register Forklift
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID..." />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['VALID', 'DUE SOON', 'REJECTED'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={handleExport}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Next Due</th><th>Type</th><th>Capacity</th><th>Location</th>
                <th>Department</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{f.id}</td>
                  <td>{f.nextDue}</td>
                  <td>{f.type}</td>
                  <td>{f.capacity}</td>
                  <td>{f.location}</td>
                  <td>{f.department}</td>
                  <td><span className={`pill ${MASTER_STATUS_PILL[f.status]}`}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${f.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onNavigate('fl-audit')}>Audit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No forklifts match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Register New Forklift" onClose={() => setModalOpen(false)} width={620}>
        <form onSubmit={handleRegister}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Forklift ID</label>
              <input value={form.id} onChange={set('id')} placeholder="FL-32" />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                {FORKLIFT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Capacity</label>
              <input value={form.capacity} onChange={set('capacity')} placeholder="2.5T" />
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Warehouse-01" />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
