import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
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
        <StatCard value={247} label="Total Controlled Docs" color="#2563eb" bg="#eef4ff" icon={<IconFileText size={18} />} delay={0} />
        <StatCard value="89%" label="Review Compliance" color="#b45309" bg="#fef1d6" icon={<IconPercent size={18} />} delay={40} />
        <StatCard value={5} label="Overdue Reviews" color="#15803d" bg="#d9f6e4" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={9} label="Pending Approval" color="#dc2626" bg="#fde0e0" icon={<IconCheckSquare size={18} />} delay={120} />
        <StatCard value={7} label="Revision Requests" color="#2563eb" bg="#eef4ff" icon={<IconRepeat size={18} />} delay={160} />
        <StatCard value={13} label="Archived" color="#2563eb" bg="#eef4ff" icon={<IconArchive size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
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
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
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
          </div>
        </div>
      </div>
    </div>
  );
}
