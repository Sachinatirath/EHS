import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { ARCHIVE_STATS, ARCHIVED_DOCUMENTS } from '../../data/docReviewData';

export default function ObsoleteArchivePage() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Obsolete / Archived Documents"
        subtitle="Superseded documents retained for legal and reference purposes"
      />

      <Panel noMargin style={{ borderLeft: '3px solid var(--amber-500)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Archive Control</h3>
        <div className="spec-row">
          <div className="spec-item">
            <div className="spec-label">Archived Documents</div>
            <div className="spec-value">{ARCHIVE_STATS.archived}</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Retention Period</div>
            <div className="spec-value">{ARCHIVE_STATS.retention}</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Oldest Archived</div>
            <div className="spec-value">{ARCHIVE_STATS.oldest}</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Next Purge Review</div>
            <div className="spec-value">{ARCHIVE_STATS.nextPurge}</div>
          </div>
        </div>
      </Panel>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Original Title</th><th>Type</th><th>Superseded By</th>
                <th>Archived Date</th><th>Retention Until</th><th>Reason</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ARCHIVED_DOCUMENTS.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td><td>{d.title}</td><td>{d.type}</td><td>{d.supersededBy}</td>
                  <td>{d.archivedDate}</td><td>{d.retentionUntil}</td><td>{d.reason}</td>
                  <td><button type="button" className="table-link">View</button></td>
                </tr>
              ))}
              {!ARCHIVED_DOCUMENTS.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No obsolete documents currently archived.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
