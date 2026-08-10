import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { EMPLOYEES, STATUS_PILL, DEPARTMENTS, EMPLOYEE_TYPES } from '../../data/trainingData';

const EMPTY = { id: '', name: '', department: DEPARTMENTS[0], role: '', type: EMPLOYEE_TYPES[0], joined: '', hod: '', matrix: 'Auto Assign by Role' };

export default function EmployeeMasterPage({ pushToast }) {
  const [rows, setRows] = useState(EMPLOYEES);
  const [lookupId, setLookupId] = useState('');
  const [appliedLookup, setAppliedLookup] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    const matchesDept = department === 'All' || r.department === department;
    const matchesStatus = status === 'All' || r.status === status;
    const matchesLookup = !appliedLookup || r.id.toLowerCase() === appliedLookup.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus && matchesLookup;
  }), [rows, search, department, status, appliedLookup]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSearchLookup = (e) => {
    e.preventDefault();
    setAppliedLookup(lookupId.trim());
    if (lookupId.trim() && !rows.some((r) => r.id.toLowerCase() === lookupId.trim().toLowerCase())) {
      pushToast(`No employee found for ${lookupId.trim()}.`, 'error');
    }
  };
  const handleClearLookup = () => { setLookupId(''); setAppliedLookup(''); };

  const openModal = () => { setForm({ ...EMPTY, id: `EMP-${1000 + rows.length + 1}` }); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) {
      pushToast('Employee ID and Name are required.', 'error');
      return;
    }
    setRows((r) => [{ ...form, status: 'Training Due', compliance: 0, history: 0 }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} (${form.name}) added and training matrix assigned.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Employee Master & Training Profile"
        subtitle="Add employee once; every later training record is linked using Employee ID"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> Add Employee
          </button>
        )}
      />

      <div className="panel" style={{ margin: '0 0 18px', borderLeft: '3px solid var(--amber-500)' }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <IconSearch size={16} /> Employee ID Lookup
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--slate-500)', margin: '0 0 14px' }}>
            Enter Employee ID to see complete training history, pending items, certificates, expiry and compliance.
          </p>
          <form onSubmit={handleSearchLookup}>
            <div className="field" style={{ maxWidth: 320, marginBottom: 12 }}>
              <label>Employee ID</label>
              <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="EMP-1001" />
            </div>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-outline" onClick={handleClearLookup}>Clear</button>
            </div>
          </form>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID / name / department..." />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {Object.keys(STATUS_PILL).map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Employee tracker exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export Employee Tracker
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th>
                <th>Status</th><th>Compliance</th><th>Training History</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.role}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td>{r.compliance}%</td>
                  <td>{r.history} records</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing training profile for ${r.id}.`, 'info')}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No employees match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Add Employee / Contractor" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSave}>
          <div className="info-callout">
            <strong>Employee Master:</strong>&nbsp;Add employee once. Department + job role can be used to assign mandatory training automatically.
          </div>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Employee ID *</label>
              <input value={form.id} onChange={set('id')} placeholder="EMP-1011" required />
            </div>
            <div className="field">
              <label>Employee Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Full name" required />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Job Role</label>
              <input value={form.role} onChange={set('role')} placeholder="Operator / Technician / Engineer" />
            </div>
            <div className="field">
              <label>Employee Type</label>
              <select value={form.type} onChange={set('type')}>
                {EMPLOYEE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Date of Joining</label>
              <input type="date" value={form.joined} onChange={set('joined')} />
            </div>
            <div className="field">
              <label>HOD / Manager</label>
              <input value={form.hod} onChange={set('hod')} placeholder="HOD name" />
            </div>
            <div className="field">
              <label>Training Matrix</label>
              <select value={form.matrix} onChange={set('matrix')}>
                <option>Auto Assign by Role</option>
                <option>Manual Assignment</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Save Employee &amp; Assign Training Matrix</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
