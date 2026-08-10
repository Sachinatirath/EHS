import StatCard from '../../components/StatCard';
import {
  IconForklift, IconCheckCircle, IconClock, IconAlertTriangle, IconArrowUpRight,
  IconPercent, IconPlus,
} from '../../components/icons';

const DEPT_ROWS = [
  { dept: 'Production', open: 4, inProgress: 2, closed: 18 },
  { dept: 'Maintenance', open: 2, inProgress: 1, closed: 11 },
  { dept: 'Warehouse', open: 2, inProgress: 1, closed: 9 },
  { dept: 'Logistics', open: 1, inProgress: 0, closed: 7 },
];

const CONTROL_AREAS = [
  { label: 'Brakes', value: 96 },
  { label: 'Forks', value: 94 },
  { label: 'Reverse Alarm', value: 91 },
];

const FINDINGS = [
  { id: 'FL-07', title: 'Reverse Alarm', meta: 'Warehouse · Not functioning · Assigned to Maintenance', level: 'HIGH', pillClass: 'pill-amber' },
  { id: 'FL-14', title: 'Fork Crack', meta: 'Production · Critical defect · Assigned to Maintenance', level: 'CRITICAL', pillClass: 'pill-red' },
  { id: 'FL-21', title: 'Seat Belt', meta: 'Logistics · Damaged · Assigned to Logistics', level: 'OPEN', pillClass: 'pill-amber' },
];

export default function ForkliftDashboard({ pushToast, onNavigate }) {
  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Forklift Safety Dashboard</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Online inspection, observations, department assignment and closure tracking</p>
        </div>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('fl-observations')}>
            <IconPlus /> Observation
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('fl-audit')}>
            <IconPlus /> New Audit
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard value={32} label="Total Forklifts" color="#2563eb" bg="#eef4ff" icon={<IconForklift size={18} />} delay={0} />
        <StatCard value={27} label="Valid / Passed" color="#15803d" bg="#d9f6e4" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={3} label="Audit Due" color="#1d4ed8" bg="#eef4ff" icon={<IconClock size={18} />} delay={80} />
        <StatCard value={18} label="Observations" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={9} label="Open Actions" color="#b45309" bg="#fef1d6" icon={<IconArrowUpRight size={18} />} delay={160} />
        <StatCard value="93.8%" label="Compliance" color="#15803d" bg="#d9f6e4" icon={<IconPercent size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Forklift Compliance</h3>
            <div className="progress-track"><div className="progress-fill" style={{ width: '90.6%' }} /></div>
            <div className="split-row" style={{ marginTop: 8 }}>
              <span>Audited: 29</span>
              <span>Pending: 3</span>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 12px' }}>Department-wise Observation Status</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Department</th><th>Open</th><th>In Progress</th><th>Closed</th></tr>
                </thead>
                <tbody>
                  {DEPT_ROWS.map((r) => (
                    <tr key={r.dept}>
                      <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.dept}</td>
                      <td>{r.open}</td>
                      <td>{r.inProgress}</td>
                      <td>{r.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 12px' }}>Critical Control Areas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              {CONTROL_AREAS.map((c) => (
                <div key={c.label} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '14px 16px', background: 'var(--slate-50)' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--slate-500)', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>{c.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderTop: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Priority Findings</h3>
            {FINDINGS.map((f) => (
              <div key={f.id} className="finding-item" onClick={() => pushToast(`${f.id} — ${f.title} opened.`, 'info')}>
                <div className="finding-title">{f.id} — {f.title}</div>
                <div className="finding-meta">{f.meta}</div>
                <span className={`pill ${f.pillClass}`} style={{ marginTop: 6 }}>{f.level}</span>
              </div>
            ))}
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('fl-dept')}>
              View Department Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
