import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmployeeProfileModal from './EmployeeProfileModal';
import { exportEmployeeTrackerExcel } from '../../utils/trainingExcel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { EMPLOYEES, STATUS_PILL, DEPARTMENTS, EMPLOYEE_TYPES, EMPLOYEE_TRAINING_RECORDS } from '../../data/trainingData';

const recordCount = (empId) => EMPLOYEE_TRAINING_RECORDS.filter((r) => r.empId === empId).length;

const EMPTY = { id: '', name: '', department: DEPARTMENTS[0], role: '', type: EMPLOYEE_TYPES[0], joined: '', hod: '' };

export default function EmployeeMasterPage({ pushToast }) {
  const [rows, setRows] = useState(EMPLOYEES);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [profile, setProfile] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!filtered.length) {
      pushToast('No employees to export for the current filters.', 'error');
      return;
    }
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await exportEmployeeTrackerExcel(filtered, `employee-training-tracker-${stamp}.xlsx`);
      pushToast(`Exported ${filtered.length} employee(s) to Excel.`, 'success');
    } catch (err) {
      pushToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    const matchesDept = department === 'All' || r.department === department;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  }), [rows, search, department, status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));


  const openModal = () => { setForm({ ...EMPTY, id: `EMP-${1000 + rows.length + 1}` }); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) {
      pushToast('Employee ID and Name are required.', 'error');
      return;
    }
    setRows((r) => [{ ...form, status: 'Training Due', compliance: 0, history: 0 }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} (${form.name}) added to Employee Master.`, 'success');
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
        <button type="button" className="btn btn-outline" onClick={handleExport} disabled={exporting}>
          <IconDownload size={15} /> {exporting ? 'Exporting…' : 'Export Employee Tracker'}
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
                <tr key={r.id} className="ep-row-clickable" onClick={() => setProfile(r)} title="Click to view training profile">
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.role}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td>{r.compliance}%</td>
                  <td>{recordCount(r.id)} records</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={(e) => { e.stopPropagation(); setProfile(r); }}>
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

      <EmployeeProfileModal employee={profile} onClose={() => setProfile(null)} pushToast={pushToast} />

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
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Save Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
