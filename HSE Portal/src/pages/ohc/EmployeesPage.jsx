import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconEye } from '../../components/icons';
import {
  useOhc, addEmployee, updateEmployee, setPending, fmtDate, DEPARTMENTS, BLOOD_GROUPS, todayKey,
} from './store';
import { ExportBar, Empty } from './shared';
import { downloadPdf } from './ohcExport';
import { employeesExcel } from './reports';
import './ohc.css';

const BLANK = { id: '', name: '', department: DEPARTMENTS[0], role: '', gender: 'Male', age: '', blood_group: 'B+', allergy: 'None reported', phone: '' };

function EmployeeModal({ open, initial, onClose, pushToast }) {
  const editing = !!initial;
  const [form, setForm] = useState(initial || BLANK);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    try {
      if (!form.name.trim()) throw new Error('Name is required.');
      if (editing) {
        const { id, ...patch } = form;
        updateEmployee(id, { ...patch, age: Number(patch.age) || '' });
        pushToast(`${form.name} updated`, 'success');
      } else {
        const rec = addEmployee({ ...form, age: Number(form.age) || '' });
        pushToast(`${rec.id} • ${rec.name} added to Employee Master`, 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open={open} title={editing ? `Edit ${initial.id}` : 'Add Employee'} onClose={onClose} width={620}>
      <form onSubmit={save}>
        <div className="form-grid">
          <div className="field"><label>Employee ID<span className="req">*</span></label><input value={form.id} disabled={editing} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toUpperCase() }))} placeholder="EMP-1234" autoFocus={!editing} /></div>
          <div className="field"><label>Full Name<span className="req">*</span></label><input value={form.name} onChange={set('name')} /></div>
          <div className="field"><label>Department</label><select value={form.department} onChange={set('department')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="field"><label>Role / Designation</label><input value={form.role} onChange={set('role')} /></div>
          <div className="field"><label>Gender</label><select value={form.gender} onChange={set('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div className="field"><label>Age</label><input type="number" min="16" max="80" value={form.age} onChange={set('age')} /></div>
          <div className="field"><label>Blood Group</label><select value={form.blood_group} onChange={set('blood_group')}>{BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={set('phone')} inputMode="tel" /></div>
          <div className="field span-2"><label>Known Allergy</label><input value={form.allergy} onChange={set('allergy')} /></div>
        </div>
        {error ? <div className="ohc-error">{error}</div> : null}
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Employee'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function EmployeesPage({ onNavigate, pushToast }) {
  const { employees, visits } = useOhc();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | employee

  const lastVisit = useMemo(() => {
    const map = {};
    visits.forEach((v) => { if (!map[v.employee_id]) map[v.employee_id] = v.created_at; });
    return map;
  }, [visits]);

  const list = employees.filter((e) => {
    const hay = `${e.id} ${e.name} ${e.department} ${e.role}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) && (!dept || e.department === dept);
  });

  const view = (id) => {
    setPending('dm-history', { employeeId: id });
    onNavigate('dm-history');
  };

  const pdf = () => downloadPdf({
    title: 'Employee Master',
    filename: `OHC-employee-master-${todayKey()}.pdf`,
    blocks: [{ heading: `${list.length} employees`, columns: ['Employee ID', 'Name', 'Department', 'Role', 'Blood', 'Allergy', 'Last OHC Visit'], widths: [1.2, 1.8, 1.3, 1.6, 0.7, 1.4, 1.3], rows: list.map((e) => [e.id, e.name, e.department, e.role, e.blood_group, e.allergy, lastVisit[e.id] ? fmtDate(lastVisit[e.id]) : '—']) }],
  });

  return (
    <div className="page-enter ohc-page">
      <PageHeader
        title="Employee Master"
        subtitle="Central employee profile and OHC history index"
        actions={<ExportBar pushToast={pushToast} onPdf={pdf} onExcel={() => employeesExcel(list)} />}
      />

      <div className="filter-bar no-print">
        <div className="search-field">
          <IconSearch />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Employee ID, Name, Department, Role…" />
        </div>
        <select className="ohc-select" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setModal('new')}><IconPlus size={15} /> Add Employee</button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <div className="ohc-muted" style={{ marginBottom: 10 }}>{list.length} of {employees.length} employees</div>
          {list.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th><th>Blood</th><th>Last OHC Visit</th><th className="no-print">Profile</th></tr></thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id}>
                      <td><b>{e.id}</b></td>
                      <td>{e.name}</td>
                      <td>{e.department}</td>
                      <td>{e.role}</td>
                      <td><span className="pill pill-red">{e.blood_group}</span></td>
                      <td>{lastVisit[e.id] ? fmtDate(lastVisit[e.id]) : '—'}</td>
                      <td className="no-print" style={{ whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => view(e.id)}><IconEye size={14} /> View</button>{' '}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(e)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty title="No employees match">Try a different search or department.</Empty>}
        </div>
      </div>

      {modal ? (
        <EmployeeModal
          key={modal === 'new' ? 'new' : modal.id}
          open
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          pushToast={pushToast}
        />
      ) : null}
    </div>
  );
}
