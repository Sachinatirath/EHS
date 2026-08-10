import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { IconCheckCircle, IconClose } from '../../components/icons';
import { OBSERVATIONS, PRIORITY_PILL } from '../../data/forkliftData';

const INITIAL_ROWS = OBSERVATIONS
  .filter((o) => o.status !== 'CLOSED')
  .map((o) => ({
    id: o.id,
    forklift: o.forklift,
    concern: o.finding,
    dept: o.dept,
    priority: o.priority,
    submitted: o.due,
  }));

export default function HodApprovalPage({ pushToast }) {
  const [rows, setRows] = useState(INITIAL_ROWS);

  const pendingCount = rows.length;

  const decide = (row, decision) => {
    setRows((r) => r.filter((x) => x.id !== row.id));
    if (decision === 'accept') {
      pushToast(`${row.id} accepted — forwarded to Safety HOD verification.`, 'success');
    } else {
      pushToast(`${row.id} rejected and sent back to ${row.dept}.`, 'info');
    }
  };

  const badge = useMemo(() => (
    <span className="pill pill-amber" style={{ fontSize: 12.5, padding: '6px 14px' }}>
      {pendingCount} PENDING
    </span>
  ), [pendingCount]);

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Approval Centre"
        subtitle="Department HOD acceptance and Safety HOD verification"
        actions={badge}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit / Observation</th><th>Forklift</th><th>Concern</th>
                <th>Department</th><th>Priority</th><th>Submitted</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 700 }}>{r.forklift}</td>
                  <td>{r.concern}</td>
                  <td>{r.dept}</td>
                  <td><span className={`pill ${PRIORITY_PILL[r.priority]}`}>{r.priority}</span></td>
                  <td>{r.submitted}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => decide(r, 'accept')}>
                        <IconCheckCircle size={14} /> Accept
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => decide(r, 'reject')}>
                        <IconClose size={12} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>Nothing pending — all caught up.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
