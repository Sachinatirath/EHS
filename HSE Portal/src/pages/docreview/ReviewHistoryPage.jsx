import PageHeader from '../../components/PageHeader';
import { REVIEW_HISTORY, STATUS_PILL } from '../../data/docReviewData';

export default function ReviewHistoryPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Document Review History"
        subtitle="Complete audit trail of all review comments, revisions, approvals, and lifecycle events"
        actions={(
          <button type="button" className="table-link" style={{ fontSize: 14 }} onClick={() => pushToast('Review history exported.', 'info')}>
            Export History
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / Time</th><th>Document</th><th>User / Role</th><th>Action</th><th>Comment</th><th>Result</th>
              </tr>
            </thead>
            <tbody>
              {REVIEW_HISTORY.map((r, i) => (
                <tr key={`${r.doc}-${i}`}>
                  <td>{r.datetime}</td>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.doc}</td>
                  <td>{r.user}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.action}</td>
                  <td>{r.comment}</td>
                  <td><span className={`pill ${STATUS_PILL[r.result]}`}>{r.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
