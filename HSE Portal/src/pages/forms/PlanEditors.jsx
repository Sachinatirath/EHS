import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconClipboard, IconCap, IconPlus, IconClose, IconUser } from '../../components/icons';
import { SHIFTS, getMonthPlan, saveMonthPlan } from '../../data/auditPlan';
import { EMPLOYEES } from '../../data/trainingData';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const SECTION_LABEL = { audits: 'Audit & Training Plan', trainings: 'Daily Training Plan' };

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

const findEmployee = (id) => EMPLOYEES.find((e) => e.id.toUpperCase() === id.trim().toUpperCase()) || null;

/** "Last edited by …" line plus the month's earlier edits of this section. */
function EditInfo({ monthKey, section }) {
  const [open, setOpen] = useState(false);
  const edits = getMonthPlan(monthKey).history.filter((h) => h.section === section);
  if (!edits.length) {
    return <div className="plan-edit-info">{monthLabel(monthKey)} · default plan, not edited yet</div>;
  }
  const [last, ...older] = edits;
  return (
    <div className="plan-edit-info">
      <IconUser size={14} />
      <span>
        {monthLabel(monthKey)} · last edited by <strong>{last.name}</strong> ({last.empId}, {last.department}) on {new Date(last.at).toLocaleString()}
      </span>
      {older.length ? (
        <button type="button" className="table-link" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : `${older.length} earlier edit${older.length === 1 ? '' : 's'}`}
        </button>
      ) : null}
      {open ? (
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, width: '100%' }}>
          {older.map((h) => <li key={h.at}>{h.name} ({h.empId}) · {new Date(h.at).toLocaleString()}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

/** Employee ID → name (auto-filled) and Save / Cancel for an edit. */
function SaveBar({ onSave, onCancel }) {
  const [empId, setEmpId] = useState('');
  const emp = findEmployee(empId);
  return (
    <div className="plan-save-bar">
      <div className="field" style={{ width: 180 }}>
        <label>Edited by — Employee ID</label>
        <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g. EMP-1001" list="plan-editor-ids" />
        <datalist id="plan-editor-ids">
          {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </datalist>
      </div>
      <div className="field" style={{ width: 220 }}>
        <label>Name &amp; Department</label>
        <input value={emp ? `${emp.name} · ${emp.department}` : ''} readOnly placeholder={empId.trim() ? 'No employee with this ID' : 'Auto-filled'} style={{ background: 'var(--slate-50)' }} />
      </div>
      <div className="btn-row" style={{ marginTop: 0, alignSelf: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={() => onSave(emp)}>Save Changes</button>
      </div>
    </div>
  );
}

function useSection(monthKey, section, pushToast, onSaved) {
  const [draft, setDraft] = useState(null);
  const startEdit = () => setDraft(JSON.parse(JSON.stringify(getMonthPlan(monthKey)[section])));
  const save = (emp, validate) => {
    if (!emp) {
      pushToast('Enter a valid Employee ID for who is editing.', 'error');
      return;
    }
    const problem = validate?.(draft);
    if (problem) {
      pushToast(problem, 'error');
      return;
    }
    try {
      saveMonthPlan(monthKey, section, draft, { empId: emp.id, name: emp.name, department: emp.department });
      pushToast(`${SECTION_LABEL[section]} for ${monthLabel(monthKey)} saved — edited by ${emp.name}.`, 'success');
      setDraft(null);
      onSaved();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };
  return { draft, setDraft, startEdit, save, cancel: () => setDraft(null) };
}

/** Monthly audit matrix (activity × day, "P" = planned). Editable per month. */
export function AuditPlanMatrix({ monthKey, day, daysInMonth, onPickDay, pushToast, onSaved }) {
  const { draft, setDraft, startEdit, save, cancel } = useSection(monthKey, 'audits', pushToast, onSaved);
  const rows = draft || getMonthPlan(monthKey).audits;
  const editing = !!draft;

  const update = (idx, patch) => setDraft((d) => d.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const toggleDay = (idx, d) => {
    if (d > daysInMonth) return;
    const row = draft[idx];
    update(idx, { days: row.days.includes(d) ? row.days.filter((x) => x !== d) : [...row.days, d].sort((a, b) => a - b) });
  };
  const addRow = () => setDraft((d) => [...d, { id: Math.max(0, ...d.map((r) => r.id)) + 1, name: '', shift: 'A', days: [] }]);
  const removeRow = (idx) => setDraft((d) => d.filter((_, i) => i !== idx));
  const validate = (d) => (d.some((r) => !r.name.trim()) ? 'Every row needs an activity name.' : null);

  return (
    <Panel
      title={`Audit & Training Plan — ${monthLabel(monthKey)}`}
      icon={<IconClipboard size={17} />}
      bodyStyle={{ paddingTop: 16 }}
      actions={!editing ? <button type="button" className="btn btn-outline" style={{ padding: '5px 12px' }} onClick={startEdit}>Edit Month</button> : null}
    >
      <EditInfo monthKey={monthKey} section="audits" />
      {editing ? <p className="plan-edit-hint">Click a day cell to add or remove “P”. Change names and shifts, add or remove rows, then save with your Employee ID.</p> : null}
      <div className="table-wrap">
        <table className="data-table atp-matrix">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th className="atp-matrix-name">Audit &amp; Training</th>
              <th>Shift</th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className={`${d === day ? 'atp-col-active' : ''}${d > daysInMonth ? ' atp-col-off' : ''}`}
                  onClick={() => !editing && onPickDay(d)}
                  title={!editing && d <= daysInMonth ? `View day ${d}` : undefined}
                >
                  {d}
                </th>
              ))}
              {editing ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, idx) => (
              <tr key={a.id}>
                <td>{idx + 1}</td>
                <td className="atp-matrix-name">
                  {editing ? <input value={a.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="Activity name" style={{ minWidth: 200 }} /> : a.name}
                </td>
                <td>
                  {editing ? (
                    <select value={a.shift} onChange={(e) => update(idx, { shift: e.target.value })}>
                      {SHIFTS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
                    </select>
                  ) : a.shift}
                </td>
                {DAYS.map((d) => (
                  <td
                    key={d}
                    className={`${d === day ? 'atp-col-active' : ''}${editing ? ' atp-cell-edit' : ''}${d > daysInMonth ? ' atp-col-off' : ''}`}
                    onClick={editing ? () => toggleDay(idx, d) : undefined}
                  >
                    {a.days.includes(d) ? <span className="atp-p">P</span> : null}
                  </td>
                ))}
                {editing ? (
                  <td>
                    <button type="button" className="icon-btn" aria-label="Remove row" onClick={() => removeRow(idx)}><IconClose size={12} /></button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <>
          <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={addRow}><IconPlus size={14} /> Add Activity</button>
          <SaveBar onSave={(emp) => save(emp, validate)} onCancel={cancel} />
        </>
      ) : null}
    </Panel>
  );
}

/** Monthly daily training plan — a training per shift per day. Editable per month. */
export function DailyTrainingTable({ monthKey, day, daysInMonth, isToday, done, onPickDay, pushToast, onSaved }) {
  const { draft, setDraft, startEdit, save, cancel } = useSection(monthKey, 'trainings', pushToast, onSaved);
  const rows = (draft || getMonthPlan(monthKey).trainings).filter((t) => t.day <= daysInMonth);
  const editing = !!draft;
  const update = (dayNo, shiftId, value) => setDraft((d) => d.map((t) => (t.day === dayNo ? { ...t, [shiftId]: value } : t)));

  return (
    <Panel
      title={`Daily Training Plan — ${monthLabel(monthKey)}`}
      icon={<IconCap size={17} />}
      bodyStyle={{ paddingTop: 16 }}
      actions={!editing ? <button type="button" className="btn btn-outline" style={{ padding: '5px 12px' }} onClick={startEdit}>Edit Month</button> : null}
    >
      <EditInfo monthKey={monthKey} section="trainings" />
      {editing ? <p className="plan-edit-hint">Type the training for each shift and day (leave blank for no training), then save with your Employee ID.</p> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th style={{ width: 60 }}>Day</th>{SHIFTS.map((s) => <th key={s.id}>{s.label} · {s.time}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                onClick={editing ? undefined : () => onPickDay(t.day)}
                style={{ cursor: editing ? 'default' : 'pointer', ...(t.day === day ? { background: 'var(--blue-50)' } : null) }}
              >
                <td style={{ fontWeight: 700 }}>
                  {t.day}
                  {t.day === day && !editing ? <div><span className="pill pill-teal">{isToday ? 'Today' : 'Selected'}</span></div> : null}
                </td>
                {SHIFTS.map((s) => {
                  if (editing) {
                    return (
                      <td key={s.id}>
                        <input value={t[s.id] || ''} onChange={(e) => update(t.day, s.id, e.target.value)} placeholder="No training" style={{ width: '100%' }} />
                      </td>
                    );
                  }
                  const isDone = t.day === day && done.includes(`${t.id}-${s.id}`);
                  return (
                    <td key={s.id} style={{ fontWeight: t.day === day ? 600 : 400 }}>
                      {t[s.id] || <span style={{ color: 'var(--slate-400)' }}>—</span>}
                      {t.day === day && t[s.id]
                        ? <span className={`pill ${isDone ? 'pill-green' : 'pill-amber'}`} style={{ marginLeft: 8 }}>{isDone ? 'Done' : 'Pending'}</span>
                        : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? <SaveBar onSave={(emp) => save(emp)} onCancel={cancel} /> : null}
    </Panel>
  );
}
