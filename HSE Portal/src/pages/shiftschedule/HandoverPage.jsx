import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import {
  IconPlus, IconChevronLeft, IconClipboard, IconAlertTriangle, IconTool, IconCheckCircle,
  IconClock, IconCheckSquare, IconFileText, IconClose, IconArrowRight, IconSend, IconEye, IconUser, IconUsers,
} from '../../components/icons';
import { peekFocusTarget, useFocusTarget } from '../../utils/focusTarget';
import {
  SHIFTS, SS_DEPARTMENTS, shiftInfo, shiftOn, useShiftAuth, selectRole, selectEmployee, selectHodDepartment, listEmployees, hodName,
} from './store';
import {
  PRIORITY, useHandoverNotes, notesForDay, findNote, incomingFor, nextShiftOf, receiversOf,
  saveNote, deleteNote, acknowledgeNote, toggleTask, todayKey, addDays,
} from './handoverStore';
import { ShiftPill, formatDay } from './shared';

const VIEW = 'shift-handover';
const HISTORY_DAYS = 7;

const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatStamp = (iso) => `${new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${formatTime(iso)}`;
const initials = (name) => name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
const openTasks = (note) => note.tasks.filter((t) => !t.done).length;

function relativeDay(key) {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  return null;
}

function Avatar({ name, size = 30 }) {
  return <span className="ho-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials(name)}</span>;
}

function StatusPill({ note }) {
  if (!note) return <span className="pill pill-slate">Not written</span>;
  if (note.ack) return <span className="pill pill-green"><IconCheckCircle size={12} /> Taken over</span>;
  return <span className="pill pill-amber"><IconClock size={12} /> Awaiting takeover</span>;
}

/* ---------- page ---------- */

export default function HandoverPage({ pushToast }) {
  const { user } = useShiftAuth();
  const notes = useHandoverNotes();
  const today = todayKey();

  // A My Tasks link lands on the day of the note it points at.
  const [date, setDate] = useState(() => {
    const target = peekFocusTarget(VIEW);
    return notes.find((n) => n.id === target)?.date || today;
  });
  const [openId, setOpenId] = useState(null);
  const [editor, setEditor] = useState(null); // null | { note? , shift?, date? }

  const dept = user?.department;
  const dayNotes = dept ? notesForDay(notes, date, dept) : [];
  const { rowProps } = useFocusTarget(VIEW, dayNotes.map((n) => n.id), setOpenId);

  // Standalone portal page: default to the employee view the first time.
  useEffect(() => {
    if (!user) selectRole('employee');
  }, [user]);

  if (!user) return null;

  const isEmployee = user.role === 'employee';
  const myShift = isEmployee ? shiftOn(user.id, date) : null;
  const incoming = isEmployee ? incomingFor(notes, user.id, today) : null;
  const openNote = notes.find((n) => n.id === openId) || null;
  const rel = relativeDay(date);

  const history = notes
    .filter((n) => n.department === dept && n.date >= addDays(today, -(HISTORY_DAYS - 1)))
    .sort((a, b) => (a.date === b.date ? b.shift.localeCompare(a.shift) : b.date.localeCompare(a.date)));

  const pendingAck = history.filter((n) => !n.ack).length;
  const critical = history.filter((n) => n.priority === 'critical').length;
  const openWork = history.reduce((sum, n) => sum + openTasks(n), 0);
  const writtenToday = notesForDay(notes, today, dept).length;

  const writeFor = (shift, onDate = date) => setEditor({ shift, date: onDate });

  return (
    <div className="page-enter">
      <PageHeader
        title="Shift Handover Notes"
        subtitle={`${dept} · what each shift hands over to the next, day by day`}
        actions={isEmployee ? (
          <button type="button" className="btn btn-primary" onClick={() => writeFor(shiftOn(user.id, today), today)}>
            <IconPlus size={15} /> Write Handover
          </button>
        ) : null}
      />

      <ViewAsBar user={user} />

      {isEmployee ? <IncomingBanner incoming={incoming} onOpen={setOpenId} /> : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={`${writtenToday}/${SHIFTS.length}`} label="Handovers Written Today" variant="blue" icon={<IconFileText size={18} />} delay={0} />
          <StatCard value={pendingAck} label="Awaiting Takeover" variant="amber" icon={<IconClock size={18} />} delay={40} />
          <StatCard value={critical} label={`Critical (last ${HISTORY_DAYS} days)`} variant="red" icon={<IconAlertTriangle size={18} />} delay={80} />
          <StatCard value={openWork} label="Open Pending Tasks" variant="violet" icon={<IconCheckSquare size={18} />} delay={120} />
        </div>
      )}

      <Panel
        title="Day Handover Timeline"
        icon={<IconClipboard size={17} />}
        actions={(
          <div className="ho-daynav">
            <button type="button" className="icon-btn" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><IconChevronLeft size={16} /></button>
            <label className="ho-daynav-date">
              <span>{rel ? `${rel} · ` : ''}{formatDay(date)}</span>
              <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Pick a date" />
            </label>
            <button type="button" className="icon-btn ho-next" disabled={date >= today} onClick={() => setDate(addDays(date, 1))} aria-label="Next day"><IconChevronLeft size={16} /></button>
            {date !== today ? <button type="button" className="btn btn-outline ho-today-btn" onClick={() => setDate(today)}>Today</button> : null}
          </div>
        )}
      >
        <div className="ho-timeline">
          {SHIFTS.map((s, i) => {
            const note = findNote(dayNotes, date, s.id, dept);
            const to = nextShiftOf(date, s.id);
            const canWrite = isEmployee && date >= addDays(today, -2);
            return (
              <div key={s.id} className="ho-step" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="ho-step-head">
                  <ShiftPill id={s.id} />
                  <span className="ho-step-time">{s.time}</span>
                  {isEmployee && myShift === s.id ? <span className="pill pill-blue">Your shift</span> : null}
                </div>
                {note ? (
                  <button
                    type="button"
                    {...rowProps(note.id)}
                    className={`ho-card ho-p-${note.priority} ${rowProps(note.id).className || ''}`}
                    onClick={() => setOpenId(note.id)}
                  >
                    <div className="ho-card-top">
                      <Avatar name={note.author_name} />
                      <div className="ho-card-who">
                        <strong>{note.author_name}</strong>
                        <span>{formatStamp(note.created_at)}</span>
                      </div>
                      <span className={`pill ${PRIORITY[note.priority].pill}`}>{PRIORITY[note.priority].label}</span>
                    </div>
                    <p className="ho-card-summary">{note.summary}</p>
                    <div className="ho-card-meta">
                      {note.tasks.length ? (
                        <span className={openTasks(note) ? 'is-open' : 'is-done'}>
                          <IconCheckSquare size={13} /> {note.tasks.length - openTasks(note)}/{note.tasks.length} tasks done
                        </span>
                      ) : null}
                      {note.safety ? <span className="is-safety"><IconAlertTriangle size={13} /> Safety concern</span> : null}
                    </div>
                    <div className="ho-card-foot">
                      <StatusPill note={note} />
                      {note.ack ? <span className="ho-card-ack">by {note.ack.by_name} · {formatTime(note.ack.at)}</span> : null}
                    </div>
                  </button>
                ) : (
                  <div className="ho-card ho-card-empty">
                    <IconFileText size={22} />
                    <span>No handover written for Shift {s.id}</span>
                    {canWrite ? (
                      <button type="button" className="btn btn-outline" onClick={() => writeFor(s.id)}>
                        <IconPlus size={14} /> Write handover
                      </button>
                    ) : null}
                  </div>
                )}
                <div className="ho-step-to">
                  <IconArrowRight size={13} /> Hands over to <strong>Shift {to.shift}</strong>{to.date !== date ? ' (next day)' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title={`Handover History — last ${HISTORY_DAYS} days`} icon={<IconClock size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr><th>Date</th><th>Shift</th><th>Handed To</th><th>Written By</th><th>Priority</th><th>Pending Tasks</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {history.map((n) => {
                const to = nextShiftOf(n.date, n.shift);
                return (
                  <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => setOpenId(n.id)}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--slate-900)' }}>{formatDay(n.date)}</td>
                    <td><ShiftPill id={n.shift} /></td>
                    <td>Shift {to.shift}{to.date !== n.date ? ' (next day)' : ''}</td>
                    <td>{n.author_name}</td>
                    <td><span className={`pill ${PRIORITY[n.priority].pill}`}>{PRIORITY[n.priority].label}</span></td>
                    <td>{n.tasks.length ? `${openTasks(n)} open / ${n.tasks.length}` : '—'}</td>
                    <td><StatusPill note={n} /></td>
                    <td>
                      <button type="button" className="btn btn-outline" style={{ padding: '5px 12px' }} onClick={(e) => { e.stopPropagation(); setOpenId(n.id); }}>
                        <IconEye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!history.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No handovers in the last {HISTORY_DAYS} days.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <HandoverDetailModal
        note={openNote}
        user={user}
        onClose={() => setOpenId(null)}
        onEdit={(note) => { setOpenId(null); setEditor({ note }); }}
        pushToast={pushToast}
      />
      {editor ? (
        <HandoverEditorModal
          key={editor.note?.id || `${editor.date}-${editor.shift}`}
          user={user}
          initial={editor}
          onClose={() => setEditor(null)}
          onSaved={(note) => { setEditor(null); setDate(note.date); setOpenId(note.id); }}
          pushToast={pushToast}
        />
      ) : null}
    </div>
  );
}

/* ---------- who is viewing (employee or department HOD) ---------- */

function ViewAsBar({ user }) {
  const isHod = user.role === 'hod';
  return (
    <div className="ho-viewas">
      <span className="ho-viewas-label">Viewing as</span>
      <div className="ho-viewas-seg" role="tablist" aria-label="Role">
        <button type="button" role="tab" aria-selected={!isHod} className={!isHod ? 'is-active' : ''} onClick={() => selectRole('employee')}>
          <IconUser size={14} /> Employee
        </button>
        <button type="button" role="tab" aria-selected={isHod} className={isHod ? 'is-active' : ''} onClick={() => selectRole('hod')}>
          <IconUsers size={14} /> HOD
        </button>
      </div>
      {isHod ? (
        <select value={user.department} onChange={(e) => selectHodDepartment(e.target.value)} aria-label="HOD department">
          {SS_DEPARTMENTS.map((d) => <option key={d} value={d}>{d} HOD — {hodName(d)}</option>)}
        </select>
      ) : (
        <select value={user.id} onChange={(e) => selectEmployee(e.target.value)} aria-label="Employee">
          {listEmployees().map((e) => <option key={e.id} value={e.id}>{e.name} ({e.id}) · {e.department} · Shift {shiftOn(e.id, todayKey())}</option>)}
        </select>
      )}
    </div>
  );
}

/* ---------- incoming handover banner (employee) ---------- */

function IncomingBanner({ incoming, onOpen }) {
  const { shift, from, note } = incoming;
  if (!shift) return null;
  const fromLabel = `Shift ${from.shift}${from.date !== todayKey() ? ' (yesterday)' : ''}`;

  if (!note) {
    return (
      <div className="ho-banner ho-banner-empty">
        <span className="ho-banner-icon"><IconClock size={20} /></span>
        <div className="ho-banner-text">
          <strong>No handover yet for your Shift {shift}</strong>
          <span>{fromLabel} hasn&apos;t written its handover note. Check with the outgoing shift before starting work.</span>
        </div>
      </div>
    );
  }

  const open = openTasks(note);
  return (
    <div className={`ho-banner ho-banner-${note.ack ? 'done' : note.priority}`}>
      <span className="ho-banner-icon">{note.ack ? <IconCheckCircle size={20} /> : <IconClipboard size={20} />}</span>
      <div className="ho-banner-text">
        <strong>
          {note.ack ? `Shift ${shift} taken over from ${fromLabel}` : `Handover waiting for your Shift ${shift} — from ${fromLabel}`}
        </strong>
        <span>
          {note.author_name} · {formatStamp(note.created_at)}
          {open ? ` · ${open} pending task${open > 1 ? 's' : ''}` : ''}
          {note.safety ? ' · includes a safety concern' : ''}
          {note.ack ? ` · acknowledged by ${note.ack.by_name} at ${formatTime(note.ack.at)}` : ''}
        </span>
      </div>
      {!note.ack ? <span className={`pill ${PRIORITY[note.priority].pill}`}>{PRIORITY[note.priority].label}</span> : null}
      <button type="button" className={`btn ${note.ack ? 'btn-outline' : 'btn-primary'}`} onClick={() => onOpen(note.id)}>
        {note.ack ? <><IconEye size={14} /> View</> : <><IconCheckCircle size={14} /> Read &amp; Take Over</>}
      </button>
    </div>
  );
}

/* ---------- detail modal ---------- */

function HandoverDetailModal({ note, user, onClose, onEdit, pushToast }) {
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);

  if (!note) return null;

  const to = nextShiftOf(note.date, note.shift);
  const isAuthor = user.role === 'employee' && note.author_id === user.id;
  const sameDept = user.role === 'employee' && user.department === note.department;
  const canAck = sameDept && !isAuthor && !note.ack;
  const receivers = receiversOf(note);
  const close = () => { setRemark(''); onClose(); };

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      fn();
      if (okMsg) pushToast(okMsg, 'success');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const ack = () => run(() => { acknowledgeNote(user, note.id, remark); setRemark(''); }, `Shift ${to.shift} takeover acknowledged.`);
  const remove = () => {
    if (!window.confirm('Delete this handover note?')) return;
    run(() => { deleteNote(user, note.id); onClose(); }, 'Handover note deleted.');
  };

  return (
    <Modal open title={`Shift ${note.shift} Handover · ${formatDay(note.date)}`} onClose={close} width={680}>
      <div className="ho-detail">
        <div className="ho-detail-head">
          <Avatar name={note.author_name} size={42} />
          <div className="ho-card-who">
            <strong>{note.author_name}</strong>
            <span>{note.department} · Shift {note.shift} ({shiftInfo(note.shift)?.time}) · written {formatStamp(note.created_at)}{note.updated_at !== note.created_at ? ` · edited ${formatStamp(note.updated_at)}` : ''}</span>
          </div>
          <span className={`pill ${PRIORITY[note.priority].pill}`}>{PRIORITY[note.priority].label}</span>
        </div>

        <div className="ho-handoff">
          <ShiftPill id={note.shift} /> <IconArrowRight size={15} /> <ShiftPill id={to.shift} />
          <span>
            {to.date !== note.date ? `${formatDay(to.date)} · ` : ''}
            {receivers.length ? `Incoming: ${receivers.map((r) => r.name).join(', ')}` : 'No one rostered on the incoming shift'}
          </span>
        </div>

        <section className="ho-section">
          <h4><IconFileText size={15} /> Work done this shift</h4>
          <p>{note.summary}</p>
        </section>

        {note.tasks.length ? (
          <section className="ho-section">
            <h4><IconCheckSquare size={15} /> Pending work for next shift <span className="ho-count">{note.tasks.length - openTasks(note)}/{note.tasks.length}</span></h4>
            <div className="ho-progress"><i style={{ width: `${((note.tasks.length - openTasks(note)) / note.tasks.length) * 100}%` }} /></div>
            <ul className="ho-tasks">
              {note.tasks.map((t) => (
                <li key={t.id} className={t.done ? 'done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={t.done}
                      disabled={!sameDept || busy}
                      onChange={() => run(() => toggleTask(user, note.id, t.id))}
                    />
                    <span>{t.text}</span>
                  </label>
                  {t.done ? <small>✓ {t.done_by} · {formatStamp(t.done_at)}</small> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {note.safety ? (
          <section className="ho-section ho-section-safety">
            <h4><IconAlertTriangle size={15} /> Safety concerns</h4>
            <p>{note.safety}</p>
          </section>
        ) : null}

        {note.equipment ? (
          <section className="ho-section">
            <h4><IconTool size={15} /> Equipment / machine status</h4>
            <p>{note.equipment}</p>
          </section>
        ) : null}

        {note.ack ? (
          <div className="ho-ack-done">
            <IconCheckCircle size={18} />
            <div>
              <strong>Taken over by {note.ack.by_name}</strong> · {formatStamp(note.ack.at)}
              {note.ack.remark ? <p>&ldquo;{note.ack.remark}&rdquo;</p> : null}
            </div>
          </div>
        ) : canAck ? (
          <div className="ho-ack-box">
            <div className="field">
              <label>Takeover remark (optional)</label>
              <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="e.g. Read and understood, will follow up on the conveyor inspection." />
            </div>
            <button type="button" className="btn btn-success" disabled={busy} onClick={ack}>
              <IconCheckCircle size={14} /> Acknowledge &amp; Take Over
            </button>
          </div>
        ) : (
          <div className="info-callout">
            {isAuthor ? 'Waiting for the incoming shift to read and acknowledge your handover.' : 'Waiting for the incoming shift to acknowledge this handover.'}
          </div>
        )}

        {isAuthor && !note.ack ? (
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={remove}><IconClose size={12} /> Delete</button>
            <button type="button" className="btn btn-outline" disabled={busy} onClick={() => onEdit(note)}><IconFileText size={14} /> Edit Handover</button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

/* ---------- write / edit modal ---------- */

const TASK_SUGGESTIONS = [
  'Close open work permit',
  'Follow up on breakdown with Maintenance',
  'Complete pending housekeeping',
  'Replenish material at line',
];

function HandoverEditorModal({ user, initial, onClose, onSaved, pushToast }) {
  const editing = initial.note;
  const today = todayKey();
  const [form, setForm] = useState(() => ({
    date: editing?.date || initial.date || today,
    shift: editing?.shift || initial.shift || shiftOn(user.id, today),
    priority: editing?.priority || 'normal',
    summary: editing?.summary || '',
    safety: editing?.safety || '',
    equipment: editing?.equipment || '',
    tasks: editing?.tasks.map((t) => ({ ...t })) || [],
  }));
  const [taskText, setTaskText] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target?.value ?? e }));
  const addTask = (text = taskText) => {
    const t = text.trim();
    if (!t) return;
    setForm((f) => ({ ...f, tasks: [...f.tasks, { id: Math.random().toString(36).slice(2, 10), text: t, done: false, done_by: null, done_at: null }] }));
    setTaskText('');
  };
  const removeTask = (id) => setForm((f) => ({ ...f, tasks: f.tasks.filter((t) => t.id !== id) }));
  const to = nextShiftOf(form.date, form.shift);

  const submit = () => {
    setSaving(true);
    try {
      const pendingTyped = taskText.trim()
        ? [...form.tasks, { id: Math.random().toString(36).slice(2, 10), text: taskText.trim(), done: false, done_by: null, done_at: null }]
        : form.tasks;
      const note = saveNote(user, { ...form, tasks: pendingTyped, id: editing?.id });
      pushToast(editing ? 'Handover updated.' : `Handover saved — Shift ${to.shift} can now read it.`, 'success');
      onSaved(note);
    } catch (err) {
      pushToast(err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Modal open title={editing ? 'Edit Shift Handover' : 'Write Shift Handover'} onClose={onClose} width={680}>
      <div className="ho-editor">
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} min={addDays(today, -2)} max={today} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Your Shift</label>
            <select value={form.shift} onChange={set('shift')}>
              {SHIFTS.map((s) => <option key={s.id} value={s.id}>{s.label} · {s.time}</option>)}
            </select>
          </div>
        </div>

        <div className="ho-handoff">
          <ShiftPill id={form.shift} /> <IconArrowRight size={15} /> <ShiftPill id={to.shift} />
          <span>{user.department} · handed over to Shift {to.shift}{to.date !== form.date ? ' next day' : ''}</span>
        </div>

        <div className="field">
          <label>Priority</label>
          <div className="ho-priority" role="radiogroup" aria-label="Priority">
            {Object.entries(PRIORITY).map(([key, p]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={form.priority === key}
                className={`ho-priority-opt ho-p-${key}${form.priority === key ? ' is-active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, priority: key }))}
              >
                <i /> {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Work done this shift <span className="req">*</span></label>
          <textarea rows={3} value={form.summary} onChange={set('summary')} placeholder="Production status, jobs completed, anything unusual…" />
        </div>

        <div className="field">
          <label>Pending work for next shift</label>
          {form.tasks.length ? (
            <ul className="ho-task-edit">
              {form.tasks.map((t, i) => (
                <li key={t.id}>
                  <span className="ho-task-num">{i + 1}</span>
                  <span className={t.done ? 'done' : ''}>{t.text}</span>
                  <button type="button" className="icon-btn" onClick={() => removeTask(t.id)} aria-label={`Remove task ${t.text}`}><IconClose size={12} /></button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="ho-task-add">
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
              placeholder="Type a task and press Enter"
            />
            <button type="button" className="btn btn-outline" onClick={() => addTask()} disabled={!taskText.trim()}><IconPlus size={14} /> Add</button>
          </div>
          <div className="ho-chips">
            {TASK_SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => addTask(s)}>+ {s}</button>)}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Safety concerns / hazards</label>
            <textarea value={form.safety} onChange={set('safety')} placeholder="Open permits, spills, barricaded areas, near misses…" />
          </div>
          <div className="field">
            <label>Equipment / machine status</label>
            <textarea value={form.equipment} onChange={set('equipment')} placeholder="Breakdowns, machines under maintenance…" />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 4 }}>
          <button type="button" className="btn btn-outline" disabled={saving} onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={submit}>
            <IconSend size={15} /> {editing ? 'Save Changes' : 'Hand Over'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
