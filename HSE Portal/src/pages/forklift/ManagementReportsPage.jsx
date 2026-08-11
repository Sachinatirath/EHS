import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import {
  IconPrinter, IconDownload, IconForklift, IconClock, IconPercent,
  IconAlertTriangle, IconArrowUpRight, IconCheckCircle,
} from '../../components/icons';
import { DEPT_CLOSURE_PERFORMANCE, MANAGEMENT_WORKFLOW } from '../../data/forkliftData';

export default function ManagementReportsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Management Reports & Analytics"
        subtitle="Forklift audit, observations, department accountability and closure review"
        actions={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              <IconPrinter size={15} /> Print / PDF
            </button>
            <button type="button" className="btn btn-primary" onClick={() => pushToast('Report data exported to CSV.', 'info')}>
              <IconDownload size={15} /> Export CSV
            </button>
          </>
        )}
      />

      <div className="stat-grid">
        <StatCard value={32} label="Forklifts" variant="blue" icon={<IconForklift size={18} />} delay={0} />
        <StatCard value={29} label="Audited" variant="amber" icon={<IconClock size={18} />} delay={40} />
        <StatCard value="93.8%" label="Compliance" variant="green" icon={<IconPercent size={18} />} delay={80} />
        <StatCard value={18} label="Observations" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={9} label="Open Actions" variant="blue" icon={<IconArrowUpRight size={18} />} delay={160} />
        <StatCard value="50%" label="Closure" variant="green" icon={<IconCheckCircle size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Department Closure Performance</h3>
          {DEPT_CLOSURE_PERFORMANCE.map((d) => (
            <div className="dept-bar-row" key={d.dept}>
              <div className="dept-bar-head">
                <span>{d.dept}</span>
                <span>{d.value}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${d.value}%` }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel noMargin accent="amber">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Recommended Management Workflow</h3>
          <ul className="workflow-list">
            {MANAGEMENT_WORKFLOW.map((step) => (
              <li key={step.title}>
                <span className="step-dot" />
                <div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 14 }}
            onClick={() => pushToast('Management report generated.', 'success')}
          >
            Generate Management Report
          </button>
        </Panel>
      </div>
    </div>
  );
}
