import PageHeader from '../../components/PageHeader';
import { IconDownload } from '../../components/icons';
import { AUDIT_HISTORY, HISTORY_STATUS_PILL, APPROVAL_PILL } from '../../data/hoistData';

export default function AuditHistoryPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Audit History"
        subtitle="Complete equipment-wise inspection trail"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => pushToast('Audit history exported.', 'info')}>
            <IconDownload size={15} /> Export History
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Equipment</th><th>Audit Type</th><th>Inspector</th>
                <th>Score</th><th>Status</th><th>Area HOD</th><th>Safety HOD</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_HISTORY.map((r, i) => (
                <tr key={`${r.equipment}-${i}`}>
                  <td>{r.date}</td>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.equipment}</td>
                  <td>{r.type}</td>
                  <td>{r.inspector}</td>
                  <td style={{ fontWeight: 700 }}>{r.score}</td>
                  <td><span className={`pill ${HISTORY_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td><span className={`pill ${APPROVAL_PILL[r.areaHod]}`}>{r.areaHod}</span></td>
                  <td><span className={`pill ${APPROVAL_PILL[r.safetyHod]}`}>{r.safetyHod}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
