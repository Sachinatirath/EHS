import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ObservationModal from '../../components/ObservationModal';
import {
  IconPlus, IconSearch, IconDownload, IconAlertTriangle, IconArrowUpRight,
  IconClock, IconCheckCircle, IconPercent, IconFileText,
} from '../../components/icons';
import { OBSERVATIONS, OBS_STATUS_PILL, PRIORITY_PILL, DEPARTMENTS, nextObservationId } from '../../data/forkliftData';

export default function ObservationsPage({ pushToast }) {
  const [rows, setRows] = useState(OBSERVATIONS);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.forklift.toLowerCase().includes(q) || r.finding.toLowerCase().includes(q);
    const matchesDept = dept === 'All' || r.dept === dept;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  }), [rows, search, dept, status]);

  const stats = useMemo(() => {
    const total = rows.length;
    const critical = rows.filter((r) => r.priority === 'CRITICAL').length;
    const assigned = rows.filter((r) => r.hod).length;
    const overdue = rows.filter((r) => r.status === 'OVERDUE').length;
    const closed = rows.filter((r) => r.status === 'CLOSED').length;
    const closure = total ? Math.round((closed / total) * 100) : 0;
    return { total, critical, assigned, overdue, closed, closure };
  }, [rows]);

  const handleCreate = (data) => {
    const row = {
      id: nextObservationId(),
      forklift: data.forklift,
      finding: data.finding,
      dept: data.department,
      hod: data.hod || `${data.department} HOD`,
      due: data.dueDate || '—',
      priority: data.priority,
      status: 'OPEN',
    };
    setRows((r) => [row, ...r]);
    setModalOpen(false);
    pushToast(`${row.id} created and assigned to ${row.dept}.`, 'success');
  };

  const handleExport = () => pushToast('Observations exported to CSV.', 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Safety Observation Reporting"
        subtitle="Record observation and assign concern to the responsible department / HOD"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Observation
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={stats.total} label="Total" color="#2563eb" bg="#eef4ff" icon={<IconFileText size={18} />} delay={0} />
        <StatCard value={stats.critical} label="Critical" color="#b45309" bg="#fef1d6" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={stats.assigned} label="Assigned" color="#15803d" bg="#d9f6e4" icon={<IconArrowUpRight size={18} />} delay={80} />
        <StatCard value={stats.overdue} label="Overdue" color="#dc2626" bg="#fde0e0" icon={<IconClock size={18} />} delay={120} />
        <StatCard value={stats.closed} label="Closed" color="#15803d" bg="#d9f6e4" icon={<IconCheckCircle size={18} />} delay={160} />
        <StatCard value={`${stats.closure}%`} label="Closure %" color="#2563eb" bg="#eef4ff" icon={<IconPercent size={18} />} delay={200} />
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search observation / forklift..." />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['OPEN', 'IN PROGRESS', 'OVERDUE', 'CLOSED'].map((s) => <option key={s}>{s}</option>)}
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
                <th>Observation ID</th><th>Forklift</th><th>Finding</th><th>Concern Department</th>
                <th>HOD / Owner</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.forklift}</td>
                  <td>{r.finding}</td>
                  <td>{r.dept}</td>
                  <td>{r.hod}</td>
                  <td>{r.due}</td>
                  <td><span className={`pill ${PRIORITY_PILL[r.priority]}`}>{r.priority}</span></td>
                  <td><span className={`pill ${OBS_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => setModalOpen(true)}>Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No observations match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ObservationModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
