import PageHeader from '../../components/PageHeader';
import { REVIEW_INBOX, TYPE_PILL, STATUS_PILL, PRIORITY_PILL } from '../../data/docReviewData';

export default function ReviewInboxPage({ pushToast }) {
  const overdueCount = REVIEW_INBOX.filter((d) => d.priority === 'OVERDUE').length;
  const pendingCount = REVIEW_INBOX.filter((d) => d.priority === 'PENDING').length;

  return (
    <div className="page-enter">
      <PageHeader
        title="Review Inbox"
        subtitle="Documents pending your review, ordered by priority and due date"
        badge={(
          <>
            <span className="pill pill-red">{overdueCount} Overdue</span>
            <span className="pill pill-blue" style={{ marginLeft: 8 }}>{pendingCount} Pending</span>
          </>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Title</th><th>Type</th><th>Version</th><th>Submitted By</th>
                <th>Date Submitted</th><th>Review Due</th><th>Priority</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {REVIEW_INBOX.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.id}</td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td><span className={`pill ${TYPE_PILL[d.type]}`}>{d.type}</span></td>
                  <td>{d.version}</td>
                  <td>{d.author}</td>
                  <td>{d.issueDate}</td>
                  <td style={{ color: d.priority === 'OVERDUE' ? 'var(--red-600)' : undefined }}>{d.reviewDue}</td>
                  <td><span className={`pill ${PRIORITY_PILL[d.priority]}`}>{d.priority}</span></td>
                  <td><span className={`pill ${STATUS_PILL[d.status]}`}>{d.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => pushToast(`Opening ${d.id} for review.`, 'info')}>Review</button>
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
