import PageHeader from '../../components/PageHeader';
import { MY_ASSIGNMENTS, TYPE_PILL, STATUS_PILL, PRIORITY_PILL } from '../../data/docReviewData';

export default function MyAssignmentsPage({ pushToast }) {
  const overdueCount = MY_ASSIGNMENTS.filter((d) => d.priority === 'OVERDUE').length;
  const completedThisMonth = 6;
  const avgResponse = '3.2 days';

  return (
    <div className="page-enter">
      <PageHeader
        title="My Review Assignments"
        subtitle="Documents specifically assigned to you for technical / safety / quality review"
        badge={<span className="pill pill-red">{overdueCount} Overdue</span>}
      />

      <div style={{ display: 'flex', gap: 32, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, color: 'var(--slate-500)' }}>Pending <strong style={{ color: 'var(--slate-900)' }}>{MY_ASSIGNMENTS.length}</strong></span>
        <span style={{ fontSize: 13.5, color: 'var(--slate-500)' }}>Completed this month <strong style={{ color: 'var(--slate-900)' }}>{completedThisMonth}</strong></span>
        <span style={{ fontSize: 13.5, color: 'var(--slate-500)' }}>Overdue <strong style={{ color: 'var(--slate-900)' }}>{overdueCount}</strong></span>
        <span style={{ fontSize: 13.5, color: 'var(--slate-500)' }}>Avg. response <strong style={{ color: 'var(--slate-900)' }}>{avgResponse}</strong></span>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Assigned Date</th><th>Title</th><th>Type</th><th>Assigned By</th>
                <th>Due Date</th><th>Priority</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MY_ASSIGNMENTS.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.id}</td>
                  <td>{d.assignedDate}</td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td><span className={`pill ${TYPE_PILL[d.type]}`}>{d.type}</span></td>
                  <td>{d.assignedBy}</td>
                  <td>{d.dueDate}</td>
                  <td><span className={`pill ${PRIORITY_PILL[d.priority]}`}>{d.priority}</span></td>
                  <td><span className={`pill ${STATUS_PILL[d.status]}`}>{d.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => pushToast(`Starting review for ${d.id}.`, 'info')}>Start Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
