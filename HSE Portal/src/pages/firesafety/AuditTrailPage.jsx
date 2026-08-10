import PageHeader from '../../components/PageHeader';
import { IconDownload } from '../../components/icons';
import { AUDIT_TRAIL, STATUS_PILL } from '../../data/fireSafetyData';

export default function AuditTrailPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Audit Trail"
        subtitle="Complete traceability of audit, finding, assignment, evidence and closure events"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => pushToast('Audit trail exported to CSV.', 'info')}>
            <IconDownload size={15} /> Export CSV
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / Time</th><th>Asset</th><th>User</th><th>Event</th><th>Comment</th><th>Result</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_TRAIL.map((r, i) => (
                <tr key={`${r.ref}-${i}`}>
                  <td>{r.datetime}</td>
                  <td style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{r.ref}</td>
                  <td>{r.user}</td>
                  <td style={{ fontWeight: 600 }}>{r.event}</td>
                  <td>{r.comment}</td>
                  <td><span className={`pill ${STATUS_PILL[r.result] || 'pill-slate'}`}>{r.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
