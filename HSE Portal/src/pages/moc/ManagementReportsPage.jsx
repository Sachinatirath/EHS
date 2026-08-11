import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
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
        <StatCard value={68} label="MOCs Raised" variant="blue" icon={<IconRepeat size={18} />} delay={0} />
        <StatCard value={7} label="High Risk" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
        <StatCard value={6} label="Pending Approval" variant="green" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={17} label="Open Actions" variant="red" icon={<IconArrowUpRight size={18} />} delay={120} />
        <StatCard value={3} label="Overdue" variant="amber" icon={<IconClock size={18} />} delay={160} />
        <StatCard value={32} label="Closed" variant="green" icon={<IconCheckSquare size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <Panel noMargin plain title="Department MOC Performance">
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
        </Panel>

        <Panel noMargin plain title="Recommended MOC Workflow" style={{ borderLeft: '3px solid var(--amber-500)' }}>
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
        </Panel>
      </div>
    </div>
  );
}
