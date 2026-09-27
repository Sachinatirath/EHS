import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { MOC_REGISTER, MOC_CATEGORIES, MOC_DEPARTMENTS, RISK_PILL, STATUS_PILL } from '../../data/mocData';

const STATUSES = ['RISK REVIEW', 'APPROVAL', 'IMPLEMENTATION', 'VERIFICATION', 'CLOSED', 'REJECTED'];

export default function MocRegisterPage({ pushToast, onNavigate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [department, setDepartment] = useState('All');

  const filtered = useMemo(() => MOC_REGISTER.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
    const matchesCategory = category === 'All' || r.category === category;
    const matchesStatus = status === 'All' || r.status === status;
    const matchesDept = department === 'All' || r.department === department;
    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  }), [search, category, status, department]);

  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Register"
        subtitle="Central register for all temporary and permanent changes"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('moc-new')}>
            <IconPlus /> New MOC
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {MOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="All">All Departments</option>
          {MOC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('MOC register exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC No.</th><th>Raised</th><th>Change Title</th><th>Category</th>
                <th>Department</th><th>HOD</th><th>Risk</th><th>Status</th><th>Target</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.raised}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.category}</td>
                  <td>{r.department}</td>
                  <td>{r.hod}</td>
                  <td><span className={`pill ${RISK_PILL[r.risk]}`}>{r.risk}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>{r.target}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Editing ${r.id}.`, 'info')}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No MOCs match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
