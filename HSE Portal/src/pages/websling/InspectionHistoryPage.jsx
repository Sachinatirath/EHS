import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconDownload } from '../../components/icons';
import { INSPECTION_HISTORY, HISTORY_STATUS_PILL, APPROVAL_PILL } from '../../data/webSlingData';

export default function InspectionHistoryPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Inspection History"
        subtitle="Complete digital lifecycle and audit trail"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => pushToast('Inspection history exported.', 'info')}>
            <IconDownload size={15} /> Export History
          </button>
        )}
      />

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sling</th><th>Date</th><th>Type</th><th>Inspector</th>
                <th>Score</th><th>Status</th><th>HOD</th><th>Safety HOD</th>
              </tr>
            </thead>
            <tbody>
              {INSPECTION_HISTORY.map((r, i) => (
                <tr key={`${r.sling}-${i}`}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.sling}</td>
                  <td>{r.date}</td>
                  <td>{r.type}</td>
                  <td>{r.inspector}</td>
                  <td style={{ fontWeight: 700 }}>{r.score}</td>
                  <td><span className={`pill ${HISTORY_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td><span className={`pill ${APPROVAL_PILL[r.hod]}`}>{r.hod}</span></td>
                  <td><span className={`pill ${APPROVAL_PILL[r.safetyHod]}`}>{r.safetyHod}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
