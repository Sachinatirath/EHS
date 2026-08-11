import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import { IconFileText, IconPercent, IconAlertTriangle, IconCheckSquare, IconRepeat, IconArchive } from '../../components/icons';
import { DOC_TYPE_DISTRIBUTION, DOC_REVIEW_WORKFLOW } from '../../data/docReviewData';

export default function ManagementReportsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Document Review Management Reports"
        subtitle="Management-level view of document review compliance, overdue reviews, and lifecycle metrics"
        actions={(
          <button type="button" className="table-link" style={{ fontSize: 14 }} onClick={() => window.print()}>
            Print / PDF
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={247} label="Total Controlled Docs" variant="blue" icon={<IconFileText size={18} />} delay={0} />
        <StatCard value="89%" label="Review Compliance" variant="amber" icon={<IconPercent size={18} />} delay={40} />
        <StatCard value={5} label="Overdue Reviews" variant="green" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={9} label="Pending Approval" variant="red" icon={<IconCheckSquare size={18} />} delay={120} />
        <StatCard value={7} label="Revision Requests" variant="blue" icon={<IconRepeat size={18} />} delay={160} />
        <StatCard value={13} label="Archived" variant="blue" icon={<IconArchive size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Document Type Distribution</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Type</th><th>Count</th><th>Under Review</th><th>Overdue</th></tr>
              </thead>
              <tbody>
                {DOC_TYPE_DISTRIBUTION.map((d) => (
                  <tr key={d.type}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{d.type}</td>
                    <td>{d.count}</td>
                    <td>{d.underReview}</td>
                    <td>{d.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel noMargin style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Document Review Workflow</h3>
          <ul className="workflow-list">
            {DOC_REVIEW_WORKFLOW.map((s) => (
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
