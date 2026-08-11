import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { APPROVAL_QUEUE, RISK_PILL, STATUS_PILL } from '../../data/mocData';

export default function ApprovalCentrePage({ pushToast }) {
  const [rows, setRows] = useState(APPROVAL_QUEUE);

  const decide = (mocId, decision) => {
    if (decision === 'Approve') {
      setRows((r) => r.map((row) => (row.mocId === mocId ? { ...row, deptHod: 'APPROVED', safetyHod: 'APPROVED', status: 'IMPLEMENTATION' } : row)));
      pushToast(`${mocId} approved for implementation.`, 'success');
    } else if (decision === 'Return') {
      pushToast(`${mocId} returned to initiator for changes.`, 'info');
    } else {
      setRows((r) => r.map((row) => (row.mocId === mocId ? { ...row, status: 'REJECTED' } : row)));
      pushToast(`${mocId} rejected.`, 'error');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Approval Centre"
        subtitle="Multi-level approval — Technical / Department HOD / EHS / Safety HOD"
      />

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC</th><th>Change</th><th>Risk</th><th>Technical</th>
                <th>Dept HOD</th><th>Safety HOD</th><th>Status</th><th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mocId}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.mocId}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td><span className={`pill ${RISK_PILL[r.risk]}`}>{r.risk}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.technical]}`}>{r.technical}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.deptHod]}`}>{r.deptHod}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.safetyHod]}`}>{r.safetyHod}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => decide(r.mocId, 'Approve')}>Approve</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => decide(r.mocId, 'Return')}>Return</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => decide(r.mocId, 'Reject')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No MOCs pending approval.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
