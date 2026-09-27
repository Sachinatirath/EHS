import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconClock, IconPlus } from '../../components/icons';
import { dateKey, planDate } from '../../data/auditPlan';
import { SHIFTS, SS_DEPARTMENTS, scheduleFor, useShiftAuth } from './store';
import { ShiftPill, formatDay } from './shared';

/** Who works which shift on a date, with approved changes applied. */
export default function SchedulePage({ onNavigate }) {
  const { user } = useShiftAuth();
  const [date, setDate] = useState(() => dateKey(planDate()));
  const [dept, setDept] = useState(() => user?.department || 'all');

  if (!user) return null;

  const rows = scheduleFor(date, dept === 'all' ? null : dept);
  const isToday = date === dateKey(planDate());
  const me = user.role === 'employee' ? rows.find((r) => r.id === user.id) : null;

  return (
    <div className="page-enter">
      <PageHeader
        title={isToday ? "Today's Shift Schedule" : 'Shift Schedule'}
        subtitle={formatDay(date)}
        actions={user.role === 'employee' ? (
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ss-emp-new')}>
            <IconPlus size={15} /> Request Shift Change / Swap
          </button>
        ) : null}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div className="field" style={{ width: 200 }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </div>
        <div className="field" style={{ width: 200 }}>
          <label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All departments</option>
            {SS_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {me ? (
        <div className="info-callout" style={{ marginBottom: 18 }}>
          Your shift {isToday ? 'today' : 'on this day'}: <strong>Shift {me.shift}</strong> ({SHIFTS.find((s) => s.id === me.shift)?.time})
          {me.changed ? ' — changed by an approved request' : ''}
          {me.pending ? ` · request ${me.pending.request_no} is pending HOD approval` : ''}
        </div>
      ) : null}

      <div className="atp-shift-grid" style={{ marginBottom: 22 }}>
        {SHIFTS.map((s) => {
          const crew = rows.filter((r) => r.shift === s.id);
          return (
            <Panel key={s.id} title={`${s.label} · ${s.time}`} icon={<IconClock size={17} />} accent={s.variant} noMargin actions={<span className="pill pill-slate">{crew.length}</span>}>
              {crew.length ? (
                <ul className="atp-task-list">
                  {crew.map((r) => (
                    <li key={r.id}>
                      <span><strong>{r.name}</strong> <span style={{ color: 'var(--slate-500)' }}>· {r.id} · {r.department}</span></span>
                      {r.changed ? <span className="pill pill-blue">Changed</span> : null}
                    </li>
                  ))}
                </ul>
              ) : <div className="atp-empty">Nobody scheduled.</div>}
            </Panel>
          );
        })}
      </div>

      <Panel title="Schedule" icon={<IconClock size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr><th>Employee ID</th><th>Date</th><th>Name</th><th>Department</th><th>Designation</th><th>Shift</th><th>Timing</th><th>Note</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={r.id === user.id ? { background: 'var(--blue-50)' } : undefined}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDay(date)}</td>
                  <td>{r.name}</td>
                  <td>{r.department}</td>
                  <td>{r.role}</td>
                  <td><ShiftPill id={r.shift} /></td>
                  <td>{SHIFTS.find((s) => s.id === r.shift)?.time}</td>
                  <td>
                    {r.changed ? <span className="pill pill-blue">Changed from Shift {r.baseShift}</span> : null}
                    {r.pending ? <span className="pill pill-amber" style={{ marginLeft: 4 }}>Pending {r.pending.request_no}</span> : null}
                    {!r.changed && !r.pending ? '—' : null}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No employees.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
