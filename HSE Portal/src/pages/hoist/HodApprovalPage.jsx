import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { IconCheckCircle, IconClose } from '../../components/icons';
import { HOD_APPROVALS } from '../../data/hoistData';

export default function HodApprovalPage({ pushToast }) {
  const [rows, setRows] = useState(HOD_APPROVALS);

  const badge = useMemo(() => (
    <span className="pill pill-amber" style={{ fontSize: 12.5, padding: '6px 14px' }}>
      {rows.length} PENDING
    </span>
  ), [rows.length]);

  const decide = (row, decision) => {
    setRows((r) => r.filter((x) => x.id !== row.id));
    if (decision === 'approve') {
      pushToast(`${row.id} approved for ${row.equipment}.`, 'success');
    } else {
      pushToast(`${row.id} rejected — ${row.equipment} sent back for corrective action.`, 'info');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Approval Centre"
        subtitle="Area HOD → Safety HOD approval workflow"
        actions={badge}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th><th>Equipment</th><th>Type</th><th>Score</th>
                <th>Recommendation</th><th>Submitted</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.equipment}</td>
                  <td>{r.type}</td>
                  <td style={{ fontWeight: 700 }}>{r.score}</td>
                  <td>{r.recommendation}</td>
                  <td>{r.submitted}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => decide(r, 'approve')}>
                        <IconCheckCircle size={14} /> Approve
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
