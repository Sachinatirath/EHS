import PageHeader from '../../components/PageHeader';
import { PENDING_REVIEW, TYPE_PILL, STATUS_PILL } from '../../data/docReviewData';

export default function PendingReviewPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Pending Document Reviews"
        subtitle="All documents currently in the review cycle — assign reviewers, track progress, and manage deadlines"
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Title</th><th>Type</th><th>Version</th><th>Submitted</th>
                <th>Days in Review</th><th>Reviewers</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_REVIEW.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.id}</td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td><span className={`pill ${TYPE_PILL[d.type]}`}>{d.type}</span></td>
                  <td>{d.version}</td>
                  <td>{d.issueDate}</td>
                  <td>{d.daysInReview}</td>
                  <td>
                    {(d.reviewers || []).map((r) => (
                      <span className="reviewer-chip" key={r.code}>
                        <span className="avatar">{r.code}</span> {r.name}
                      </span>
                    ))}
                  </td>
                  <td><span className={`pill ${STATUS_PILL[d.status]}`}>{d.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => pushToast(`Reviewer assignment updated for ${d.id}.`, 'info')}>Assign</button>
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
