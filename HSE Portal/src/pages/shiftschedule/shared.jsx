import { useState } from 'react';
import Modal from '../../components/Modal';
import { IconCheckCircle, IconClose, IconEye } from '../../components/icons';
import { REQUEST_TYPES, STATUS_META, decideRequest, shiftInfo } from './store';

export function formatDay(key) {
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export function ShiftPill({ id }) {
  const s = shiftInfo(id);
  return s ? <span className={`pill pill-${s.variant}`}>Shift {s.id}</span> : <span>—</span>;
}

/** Requests list; `showEmployee` adds the requester column (HOD views). */
export function RequestsTable({ rows, loading, onOpen, showEmployee = false, rowProps, empty = 'No requests yet.' }) {
  const cols = showEmployee ? 10 : 9;
  return (
    <div className="table-wrap">
      <table className="data-table compact">
        <thead>
          <tr>
            <th>Request No</th><th>Shift Date</th>
            {showEmployee ? <th>Employee</th> : null}
            <th>Type</th><th>From</th><th>To</th><th>Swap With</th><th>Reason</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={cols} style={{ textAlign: 'center', padding: 24, color: 'var(--slate-500)' }}>Loading…</td></tr>
          ) : (
            <>
              {rows.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.id} {...rowProps?.(r.id)} style={{ cursor: 'pointer' }} onClick={() => onOpen(r)}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.request_no}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDay(r.date)}</td>
                    {showEmployee ? <td>{r.employee_name} <span style={{ color: 'var(--slate-500)' }}>({r.employee_id})</span></td> : null}
                    <td>{REQUEST_TYPES[r.type]}</td>
                    <td><ShiftPill id={r.from_shift} /></td>
                    <td><ShiftPill id={r.to_shift} /></td>
                    <td>{r.swap_with_name || '—'}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>{r.reason}</td>
                    <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                    <td>
                      <button
                        type="button"
                        className={`btn ${showEmployee && r.status === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '5px 12px' }}
                        onClick={(e) => { e.stopPropagation(); onOpen(r); }}
                      >
                        <IconEye size={14} /> {showEmployee && r.status === 'pending' ? 'Review' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr><td colSpan={cols} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>{empty}</td></tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="split-row">
      <span>{label}</span>
      <span style={{ color: 'var(--slate-900)', fontWeight: 700, textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/** Request details; when `canDecide`, the HOD can approve or reject with a remark. */
export function RequestModal({ request, onClose, canDecide = false, onDecided, pushToast }) {
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const decide = async (decision) => {
    setSaving(true);
    try {
      const updated = await decideRequest(request.id, decision, remark);
      pushToast(`${updated.request_no} ${decision === 'approved' ? 'approved — schedule updated' : 'rejected'}.`, decision === 'approved' ? 'success' : 'info');
      setRemark('');
      onDecided?.(updated);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const r = request;
  return (
    <Modal open={!!r} title={r ? `${r.request_no} · ${REQUEST_TYPES[r.type]}` : ''} onClose={() => { setRemark(''); onClose(); }} width={600}>
      {r ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><span className={`pill ${STATUS_META[r.status].pill}`}>{STATUS_META[r.status].label}</span></div>
          <div>
            <Row label="Employee">{r.employee_name} ({r.employee_id})</Row>
            <Row label="Department">{r.department}</Row>
            <Row label="Shift date">{formatDay(r.date)}</Row>
            <Row label="Current shift"><ShiftPill id={r.from_shift} /> {shiftInfo(r.from_shift)?.time}</Row>
            <Row label="Requested shift"><ShiftPill id={r.to_shift} /> {shiftInfo(r.to_shift)?.time}</Row>
            {r.type === 'swap' ? <Row label="Swap with">{r.swap_with_name} ({r.swap_with_id}) — moves to Shift {r.from_shift}</Row> : null}
            <Row label="Reason">{r.reason}</Row>
            <Row label="Submitted">{formatDateTime(r.created_at)}</Row>
            {r.decided_at ? <Row label={r.status === 'approved' ? 'Approved by' : 'Rejected by'}>{r.decided_by} · {formatDateTime(r.decided_at)}</Row> : null}
            {r.hod_remark ? <Row label="HOD remark">{r.hod_remark}</Row> : null}
          </div>

          {canDecide && r.status === 'pending' ? (
            <>
              <div className="field">
                <label>HOD Remark {`(required to reject)`}</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Comments for the employee…" />
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-success" disabled={saving} onClick={() => decide('approved')}>
                  <IconCheckCircle size={14} /> Approve
                </button>
                <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => decide('rejected')}>
                  <IconClose size={12} /> Reject
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
