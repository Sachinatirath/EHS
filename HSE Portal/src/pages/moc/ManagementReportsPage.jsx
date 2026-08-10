import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { IconPrinter, IconRepeat, IconAlertTriangle, IconCheckCircle, IconArrowUpRight, IconClock, IconCheckSquare } from '../../components/icons';
import { DEPARTMENT_PERFORMANCE, MOC_WORKFLOW_STEPS } from '../../data/mocData';

export default function ManagementReportsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Management Reports"
        subtitle="Management-level view of change risk, overdue actions, approvals and effectiveness"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            <IconPrinter size={15} /> Print / PDF
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={68} label="MOCs Raised" color="#2563eb" bg="#eef4ff" icon={<IconRepeat size={18} />} delay={0} />
        <StatCard value={7} label="High Risk" color="#b45309" bg="#fef1d6" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={6} label="Pending Approval" color="#15803d" bg="#d9f6e4" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={17} label="Open Actions" color="#dc2626" bg="#fde0e0" icon={<IconArrowUpRight size={18} />} delay={120} />
        <StatCard value={3} label="Overdue" color="#b45309" bg="#fef1d6" icon={<IconClock size={18} />} delay={160} />
        <StatCard value={32} label="Closed" color="#15803d" bg="#d9f6e4" icon={<IconCheckSquare size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Department MOC Performance</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Department</th><th>MOCs</th><th>High Risk</th><th>Open Actions</th><th>Overdue</th><th>Closure %</th></tr>
                </thead>
                <tbody>
                  {DEPARTMENT_PERFORMANCE.map((d) => (
                    <tr key={d.department}>
                      <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{d.department}</td>
                      <td>{d.mocs}</td>
                      <td>{d.highRisk}</td>
                      <td>{d.openActions}</td>
                      <td>{d.overdue}</td>
                      <td>{d.closure}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Recommended MOC Workflow</h3>
            <ul className="workflow-list">
              {MOC_WORKFLOW_STEPS.map((s) => (
                <li key={s.title} style={{ cursor: 'pointer' }} onClick={() => pushToast(s.title, 'info')}>
                  <span className="step-dot" />
                  <div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
