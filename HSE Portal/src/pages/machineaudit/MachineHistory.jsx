import { useState } from 'react';
import { IconChevronDown } from '../../components/icons';
import { STATUS_META, formatDate, formatDateTime } from './statusMeta';

const CHECK_COLOR = { Yes: 'var(--green-600)', No: 'var(--red-600)', 'N/A': 'var(--slate-500)' };

/** Latest audit of a machine, with its checklist answers behind a toggle (like FastAid's Last Inspection). */
export function LastInspection({ last }) {
  const [open, setOpen] = useState(false);

  if (!last) {
    return <div style={{ fontSize: 14, color: 'var(--slate-500)' }}>No previous audit on record for this machine</div>;
  }

  const meta = STATUS_META[last.status];
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--slate-500)' }}>
        <span>{formatDateTime(last.created_at)}</span>
        <span>· {last.audit_no} by {last.officer.name}</span>
        <span className={`pill ${meta.pill}`}>{meta.label}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={() => setOpen((o) => !o)}>
          View Previous Observations
          <span style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><IconChevronDown size={14} /></span>
        </button>
        {open ? (
          <div style={{ marginTop: 10 }}>
            {last.checklist.map((row, idx) => (
              <div key={row.item} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderTop: idx === 0 ? 'none' : '1px solid var(--slate-100)', fontSize: 12.5 }}>
                <span style={{ color: 'var(--slate-500)' }}>
                  {row.item}
                  {row.remarks ? <span style={{ color: 'var(--slate-700)' }}> — {row.remarks}</span> : null}
                </span>
                <span style={{ fontWeight: 700, color: CHECK_COLOR[row.status] }}>{row.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Every audit of one machine, latest first; `currentId` marks the audit being viewed. */
export function AuditHistoryTable({ history, currentId }) {
  return (
    <div className="table-wrap">
      <table className="data-table compact">
        <thead>
          <tr><th>Audit No</th><th>Date</th><th>Safety Officer</th><th>Non-compliance</th><th>Status</th></tr>
        </thead>
        <tbody>
          {history.length ? history.map((h) => {
            const noItems = h.checklist.filter((r) => r.status === 'No').map((r) => r.item);
            const meta = STATUS_META[h.status];
            const current = h.id === currentId;
            return (
              <tr key={h.id} style={current ? { background: 'var(--ma-primary-light)' } : undefined}>
                <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{h.audit_no}{current ? ' (this audit)' : ''}</td>
                <td>{formatDate(h.created_at)}</td>
                <td>{h.officer.name}</td>
                <td>{noItems.length ? noItems.join(', ') : <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>All OK</span>}</td>
                <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
              </tr>
            );
          }) : (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--slate-500)' }}>No audits recorded for this machine yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
