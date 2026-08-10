import PageHeader from '../../components/PageHeader';
import { IconDownload } from '../../components/icons';
import { AUDIT_TRAIL, STATUS_PILL } from '../../data/mocData';

export default function AuditTrailPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Audit Trail"
        subtitle="Track every submission, assessment, comment, approval, implementation and closure event"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => pushToast('Audit trail exported.', 'info')}>
            <IconDownload size={15} /> Export Audit Trail
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / Time</th><th>MOC</th><th>User / Role</th><th>Action</th><th>Comment</th><th>Result</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_TRAIL.map((r, i) => (
                <tr key={`${r.mocId}-${i}`}>
                  <td>{r.datetime}</td>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.mocId}</td>
                  <td>{r.user}</td>
                  <td style={{ fontWeight: 600 }}>{r.action}</td>
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
