import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { APPROVALS_QUEUE, STATUS_PILL } from '../../data/docReviewData';

export default function ApprovalsPage({ pushToast }) {
  const [rows, setRows] = useState(APPROVALS_QUEUE);

  const decide = (id, decision) => {
    if (decision === 'Approve') {
      setRows((r) => r.map((row) => (row.id === id ? { ...row, hodApproval: 'APPROVED', ehsApproval: 'APPROVED', docControl: 'APPROVED', status: 'CURRENT' } : row)));
      pushToast(`${id} approved and issued.`, 'success');
    } else {
      pushToast(`${id} returned to reviewer.`, 'info');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Document Approvals"
        subtitle="Final approval queue — HOD / EHS / Document Controller sign-off before issuance"
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Title</th><th>Version</th><th>Review Completed</th>
                <th>HOD Approval</th><th>EHS Approval</th><th>Doc Control</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.version}</td>
                  <td><span className={`pill ${STATUS_PILL[r.reviewCompleted]}`}>{r.reviewCompleted}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.hodApproval]}`}>{r.hodApproval}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.ehsApproval]}`}>{r.ehsApproval}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.docControl]}`}>{r.docControl}</span></td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => decide(r.id, 'Approve')}>Approve</button>
                    <button type="button" className="table-link" onClick={() => decide(r.id, 'Return')}>Return</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No documents pending final approval.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
