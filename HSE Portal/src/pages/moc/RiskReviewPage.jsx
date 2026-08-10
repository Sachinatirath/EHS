import PageHeader from '../../components/PageHeader';
import { RISK_REVIEW_QUEUE, RISK_PILL, STATUS_PILL } from '../../data/mocData';

export default function RiskReviewPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Screening & Technical Review"
        subtitle="Confirm whether MOC is required, identify affected disciplines and define review team"
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC</th><th>Change</th><th>Category</th><th>Department</th>
                <th>Initiator</th><th>Risk</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {RISK_REVIEW_QUEUE.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.category}</td>
                  <td>{r.department}</td>
                  <td>{r.hod}</td>
                  <td><span className={`pill ${RISK_PILL[r.risk]}`}>{r.risk}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Opened screening for ${r.id}.`, 'info')}>
                      Open Screening
                    </button>
                  </td>
                </tr>
              ))}
              {!RISK_REVIEW_QUEUE.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No MOCs pending screening or risk review.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
