import { useSyncExternalStore } from 'react';
import { SHIFTS, dateKey, planDate } from '../../data/auditPlan';
import { findEmployee, listEmployees, shiftOn } from './store';

/**
 * Shift handover notes — one note per department, per shift, per day.
 *
 * The outgoing shift writes what was done, what is still pending, safety
 * concerns and equipment status. The incoming shift (same department, next
 * shift: A → B → C → next day's A) reads it, ticks off pending work and
 * acknowledges the takeover. Notes are kept in localStorage (no backend yet).
 */

const STORAGE_KEY = 'ehs-shift-handover-notes';

export const PRIORITY = {
  normal: { label: 'Normal', pill: 'pill-green' },
  attention: { label: 'Needs Attention', pill: 'pill-amber' },
  critical: { label: 'Critical', pill: 'pill-red' },
};

const SHIFT_IDS = SHIFTS.map((s) => s.id);

function addDays(key, n) {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export const todayKey = () => dateKey(planDate());
export { addDays };

/** The shift that receives the handover written by `shift` on `date`. */
export function nextShiftOf(date, shift) {
  const i = SHIFT_IDS.indexOf(shift);
  return i === SHIFT_IDS.length - 1
    ? { date: addDays(date, 1), shift: SHIFT_IDS[0] }
    : { date, shift: SHIFT_IDS[i + 1] };
}

/** The shift whose handover `shift` on `date` takes over from. */
export function prevShiftOf(date, shift) {
  const i = SHIFT_IDS.indexOf(shift);
  return i === 0
    ? { date: addDays(date, -1), shift: SHIFT_IDS[SHIFT_IDS.length - 1] }
    : { date, shift: SHIFT_IDS[i - 1] };
}

/* ----- persistence ----- */

let notes = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to seed data */ }
  return seed();
}

function commit(next) {
  notes = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* storage full / blocked */ }
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useHandoverNotes() {
  return useSyncExternalStore(subscribe, () => notes);
}

/* ----- seed data ----- */

function seed() {
  const today = todayKey();
  const yesterday = addDays(today, -1);
  const at = (date, hour, min = 0) => {
    const d = new Date(`${date}T00:00:00`);
    d.setHours(hour, min);
    return d.toISOString();
  };
  const task = (text, done = false, by = null, when = null) => ({ id: uid(), text, done, done_by: by, done_at: when });

  let n = 0;
  const make = (fields) => {
    n += 1;
    const author = findEmployee(fields.author_id);
    return {
      id: `ho-seed-${n}`,
      note_no: `HO-${fields.date.replaceAll('-', '')}-${fields.shift}-${n}`,
      department: author.department,
      author_name: author.name,
      safety: '',
      equipment: '',
      tasks: [],
      ack: null,
      updated_at: fields.created_at,
      ...fields,
    };
  };

  return [
    make({
      date: yesterday, shift: 'A', author_id: 'EMP-1001', priority: 'normal', created_at: at(yesterday, 13, 45),
      summary: 'Line 2 ran at full capacity — 1,240 units completed against a target of 1,200. Housekeeping done at all workstations.',
      equipment: 'All machines running normally.',
      tasks: [task('Replenish packaging material at Line 2 before 16:00', true, 'Priya N', at(yesterday, 15, 10))],
      ack: { by_id: 'EMP-1006', by_name: 'Priya N', at: at(yesterday, 14, 5), remark: 'Received, thanks.' },
    }),
    make({
      date: yesterday, shift: 'B', author_id: 'EMP-1006', priority: 'attention', created_at: at(yesterday, 21, 40),
      summary: 'Production target achieved. Changeover to model X-200 started on Line 1 at 20:30 — 60% complete.',
      safety: 'Oil leak near press P-04 — area barricaded and absorbent placed. Maintenance informed.',
      equipment: 'Press P-04 under observation for hydraulic leak.',
      tasks: [
        task('Complete Line 1 changeover to X-200', true, 'Ramesh G', at(yesterday, 23, 30)),
        task('Follow up with Maintenance on P-04 leak', true, 'Ramesh G', at(today, 1, 15)),
      ],
      ack: { by_id: 'EMP-1008', by_name: 'Ramesh G', at: at(yesterday, 22, 10), remark: '' },
    }),
    make({
      date: yesterday, shift: 'C', author_id: 'EMP-1008', priority: 'normal', created_at: at(today, 5, 40),
      summary: 'Night shift ran smoothly. X-200 changeover finished; first-piece inspection approved by QA at 00:20.',
      equipment: 'P-04 leak fixed by Maintenance at 02:00. All machines available.',
      tasks: [task('Share night production report with Production HOD')],
      ack: { by_id: 'EMP-1001', by_name: 'Ravi Kumar', at: at(today, 6, 10), remark: 'Will send the report.' },
    }),
    make({
      date: today, shift: 'A', author_id: 'EMP-1001', priority: 'critical', created_at: at(today, 13, 50),
      summary: 'Completed 980 units on Line 2. Line 1 stopped from 11:00 to 12:15 due to conveyor belt misalignment.',
      safety: 'Conveyor guard on Line 1 was found open during the stoppage — re-fitted. Do NOT run Line 1 with the guard removed.\nWet floor near the coolant tank — cleaning in progress.',
      equipment: 'Line 1 conveyor: belt re-aligned, running at reduced speed pending Maintenance inspection.',
      tasks: [
        task('Get Line 1 conveyor inspected by Maintenance before full speed'),
        task('Close the open hot-work permit HW-0412 at the welding bay'),
        task('Confirm wet floor near coolant tank is dry and remove the sign'),
      ],
    }),
    make({
      date: today, shift: 'A', author_id: 'EMP-1002', priority: 'attention', created_at: at(today, 13, 30),
      summary: 'Preventive maintenance done on compressors C-1 and C-2. Breakdown call on Line 1 conveyor attended.',
      equipment: 'Compressor C-2 running hot (82°C) — monitor every 2 hours.',
      tasks: [task('Inspect Line 1 conveyor bearings'), task('Log C-2 temperature at 16:00 and 18:00')],
    }),
  ];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ----- queries ----- */

export function notesForDay(all, date, department) {
  return all.filter((x) => x.date === date && (!department || x.department === department));
}

export function findNote(all, date, shift, department) {
  return all.find((x) => x.date === date && x.shift === shift && x.department === department) || null;
}

/** The handover waiting for `empId` at the start of their shift on `date`. */
export function incomingFor(all, empId, date) {
  const emp = findEmployee(empId);
  if (!emp) return { shift: null, from: null, note: null };
  const shift = shiftOn(empId, date);
  const from = prevShiftOf(date, shift);
  return { shift, from, note: findNote(all, from.date, from.shift, emp.department) };
}

/** People of the department who work the shift that receives `note`. */
export function receiversOf(note) {
  const to = nextShiftOf(note.date, note.shift);
  return listEmployees(note.department).filter((e) => shiftOn(e.id, to.date) === to.shift);
}

/* ----- mutations ----- */

function patch(id, fn) {
  const note = notes.find((x) => x.id === id);
  if (!note) throw new Error('Handover note not found.');
  const next = { ...note, ...fn(note) };
  commit(notes.map((x) => (x.id === id ? next : x)));
  return next;
}

/** Create or update the user's handover for a shift. */
export function saveNote(user, { id, date, shift, priority, summary, safety, equipment, tasks }) {
  if (user?.role !== 'employee') throw new Error('Only employees can write a shift handover.');
  if (!date) throw new Error('Pick the date.');
  if (date > todayKey()) throw new Error('You cannot write a handover for a future date.');
  if (date < addDays(todayKey(), -2)) throw new Error('Handovers can only be written for the last 2 days.');
  if (!SHIFT_IDS.includes(shift)) throw new Error('Pick your shift.');
  if (!summary?.trim()) throw new Error('Describe the work done in your shift.');

  const clean = (tasks || []).map((t) => ({ ...t, text: t.text.trim() })).filter((t) => t.text);
  const now = new Date().toISOString();
  const existing = findNote(notes, date, shift, user.department);

  if (id) {
    const note = notes.find((x) => x.id === id);
    if (!note) throw new Error('Handover note not found.');
    if (note.author_id !== user.id) throw new Error(`Only ${note.author_name} can edit this handover.`);
    if (note.ack) throw new Error('This handover was already acknowledged — it can no longer be edited.');
    if (existing && existing.id !== id) throw new Error(`Shift ${shift} on that date already has a handover by ${existing.author_name}.`);
    return patch(id, () => ({ date, shift, priority, summary: summary.trim(), safety: safety.trim(), equipment: equipment.trim(), tasks: clean, updated_at: now }));
  }

  if (existing) throw new Error(`${existing.author_name} already wrote the Shift ${shift} handover for ${user.department} on this date — open it to read or add to it.`);
  const note = {
    id: uid(),
    note_no: `HO-${date.replaceAll('-', '')}-${shift}-${String(notes.length + 1).padStart(3, '0')}`,
    date,
    shift,
    department: user.department,
    author_id: user.id,
    author_name: user.name,
    priority,
    summary: summary.trim(),
    safety: safety.trim(),
    equipment: equipment.trim(),
    tasks: clean,
    ack: null,
    created_at: now,
    updated_at: now,
  };
  commit([note, ...notes]);
  return note;
}

export function deleteNote(user, id) {
  const note = notes.find((x) => x.id === id);
  if (!note) throw new Error('Handover note not found.');
  if (note.author_id !== user?.id) throw new Error(`Only ${note.author_name} can delete this handover.`);
  if (note.ack) throw new Error('An acknowledged handover cannot be deleted.');
  commit(notes.filter((x) => x.id !== id));
}

/** Incoming shift confirms it has read the handover and taken over. */
export function acknowledgeNote(user, id, remark) {
  return patch(id, (note) => {
    if (user?.role !== 'employee') throw new Error('Only an employee of the incoming shift can acknowledge.');
    if (note.department !== user.department) throw new Error(`Only ${note.department} employees can acknowledge this handover.`);
    if (note.author_id === user.id) throw new Error('You cannot acknowledge your own handover.');
    if (note.ack) throw new Error(`Already acknowledged by ${note.ack.by_name}.`);
    return { ack: { by_id: user.id, by_name: user.name, at: new Date().toISOString(), remark: remark?.trim() || '' } };
  });
}

/** Tick / un-tick a pending task — anyone in the department can update it. */
export function toggleTask(user, id, taskId) {
  return patch(id, (note) => {
    if (user?.role !== 'employee' || note.department !== user.department) throw new Error(`Only ${note.department} employees can update these tasks.`);
    return {
      tasks: note.tasks.map((t) => (t.id !== taskId ? t : t.done
        ? { ...t, done: false, done_by: null, done_at: null }
        : { ...t, done: true, done_by: user.name, done_at: new Date().toISOString() })),
    };
  });
}

/* ----- read-only access for the portal's My Tasks page ----- */

export function handoverSnapshot() {
  return notes;
}
