import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { HOD_TRAINING_APPROVALS, APPROVAL_STATUS_PILL } from '../../data/trainingData';

export default function HodApprovalPage({ pushToast }) {
  const [rows, setRows] = useState(HOD_TRAINING_APPROVALS);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => rows.filter((r) => filter === 'All' || r.status === filter), [rows, filter]);

  const handleReview = (id) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status: 'Approved', verification: 'EHS Verified' } : row)));
    pushToast(`${id} approved.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Approval & Review"
        subtitle="Training records requiring management review"
      />

      <div className="workflow-strip">
        <strong>Approval flow:</strong> Training Created → Trainer / EHS Verification → HOD Review → Approve / Reject → If Rejected, Modification Required → Resubmit → Final Approved Record.
      </div>

      <div className="filter-bar" style={{ marginTop: 18 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          {Object.keys(APPROVAL_STATUS_PILL).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Approval ID</th><th>Training ID</th><th>Training</th><th>Participants</th>
                <th>Verification</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.trainingId}</td>
                  <td style={{ fontWeight: 600 }}>{r.training}</td>
                  <td>{r.participants} Employees</td>
                  <td>{r.verification}</td>
                  <td><span className={`pill ${APPROVAL_STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'Approved'
                      ? <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>Review</button>
                      : <button type="button" className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleReview(r.id)}>Review</button>}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No records match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
