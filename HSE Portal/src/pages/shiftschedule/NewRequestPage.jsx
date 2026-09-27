import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconUser, IconRepeat, IconSend } from '../../components/icons';
import { dateKey, planDate } from '../../data/auditPlan';
import { SHIFTS, hodName, listEmployees, shiftOn, submitRequest, useShiftAuth } from './store';

const READ_ONLY = { background: 'var(--slate-50)', color: 'var(--slate-700)', cursor: 'default' };

/** Employee form: move to another shift, or swap shifts with a colleague, on a date. */
export default function NewRequestPage({ onNavigate, pushToast }) {
  const { user } = useShiftAuth();
  const [type, setType] = useState('change');
  const [date, setDate] = useState(() => dateKey(planDate()));
  const [toShift, setToShift] = useState('');
  const [swapWith, setSwapWith] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const current = date ? shiftOn(user.id, date) : null;
  const colleagues = listEmployees(user.department)
    .filter((e) => e.id !== user.id)
    .map((e) => ({ ...e, shift: date ? shiftOn(e.id, date) : null }));
  const partner = colleagues.find((c) => c.id === swapWith);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const r = await submitRequest({ type, date, to_shift: toShift, swap_with_id: swapWith, reason });
      pushToast(`${r.request_no} submitted to ${hodName(r.department)} (HOD, ${r.department}) for approval.`, 'success');
      onNavigate('ss-emp-requests');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title="Shift Change / Swap Request" subtitle={`Submitted to ${hodName(user.department)} (HOD, ${user.department}) for approval`} />

      <Panel title="Employee" icon={<IconUser size={17} />}>
        <div className="form-grid">
          <div className="field"><label>Employee ID</label><input value={user.id} readOnly style={READ_ONLY} /></div>
          <div className="field"><label>Name</label><input value={user.name} readOnly style={READ_ONLY} /></div>
          <div className="field"><label>Department</label><input value={user.department} readOnly style={READ_ONLY} /></div>
          <div className="field"><label>Designation</label><input value={user.role} readOnly style={READ_ONLY} /></div>
        </div>
      </Panel>

      <Panel title="Request Details" icon={<IconRepeat size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Request Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="change">Change my shift</option>
              <option value="swap">Swap shift with another employee</option>
            </select>
          </div>
          <div className="field">
            <label>Shift Date</label>
            <input type="date" value={date} min={dateKey(planDate())} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>My Current Shift</label>
            <input value={current ? `Shift ${current} · ${SHIFTS.find((s) => s.id === current).time}` : ''} readOnly style={READ_ONLY} />
          </div>

          {type === 'change' ? (
            <div className="field">
              <label>Requested Shift</label>
              <select value={toShift} onChange={(e) => setToShift(e.target.value)}>
                <option value="">Select shift…</option>
                {SHIFTS.filter((s) => s.id !== current).map((s) => <option key={s.id} value={s.id}>{s.label} · {s.time}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div className="field">
                <label>Swap With (same department)</label>
                <select value={swapWith} onChange={(e) => setSwapWith(e.target.value)}>
                  <option value="">Select employee…</option>
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.shift === current}>
                      {c.name} ({c.id}) — Shift {c.shift}{c.shift === current ? ' (same shift)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>You Will Work</label>
                <input
                  value={partner ? `Shift ${partner.shift} · ${SHIFTS.find((s) => s.id === partner.shift).time}` : ''}
                  readOnly
                  placeholder="Pick an employee"
                  style={READ_ONLY}
                />
              </div>
            </>
          )}
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need this change?" />
        </div>
        {type === 'swap' && partner ? (
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--slate-500)' }}>
            If approved, you work Shift {partner.shift} and {partner.name} works Shift {current} on this date.
          </p>
        ) : null}
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" disabled={submitting} onClick={() => onNavigate('ss-emp-schedule')}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
          <IconSend size={15} /> {submitting ? 'Submitting…' : 'Submit to HOD'}
        </button>
      </div>
    </div>
  );
}
