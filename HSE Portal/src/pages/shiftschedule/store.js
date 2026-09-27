import { useSyncExternalStore } from 'react';
import { EMPLOYEES, EMPLOYEE_DETAILS, DEPARTMENTS } from '../../data/trainingData';
import { SHIFTS, dateKey, planDate } from '../../data/auditPlan';

/**
 * Shift Schedule runs entirely on in-memory dummy data — no backend call.
 *
 * Every employee has a base shift (A, B or C). An employee can ask to move to
 * another shift on a date, or to swap shifts with a colleague of the same
 * department. The request goes to the department HOD, who approves or rejects
 * it; approved requests change the schedule for that date.
 */

export { SHIFTS };
export const SS_DEPARTMENTS = DEPARTMENTS.filter((d) => EMPLOYEES.some((e) => e.department === d));
export const REQUEST_TYPES = { change: 'Shift Change', swap: 'Shift Swap' };

export const STATUS_META = {
  pending: { label: 'Pending HOD Approval', pill: 'pill-amber' },
  approved: { label: 'Approved', pill: 'pill-green' },
  rejected: { label: 'Rejected', pill: 'pill-red' },
};

export function shiftInfo(id) {
  return SHIFTS.find((s) => s.id === id);
}

// Base roster: employees of a department are spread across A, B, C in turn.
const employees = EMPLOYEES.map((e) => ({ ...e, ...EMPLOYEE_DETAILS[e.id] }));
const baseShift = {};
SS_DEPARTMENTS.forEach((dept) => {
  employees.filter((e) => e.department === dept).forEach((e, i) => { baseShift[e.id] = SHIFTS[i % SHIFTS.length].id; });
});

export function listEmployees(department) {
  return department ? employees.filter((e) => e.department === department) : employees;
}

export function findEmployee(id) {
  return employees.find((e) => e.id === id) || null;
}

const HOD_NAMES = Object.fromEntries(SS_DEPARTMENTS.map((d) => [d, employees.find((e) => e.department === d)?.hod || `${d} HOD`]));
export function hodName(department) {
  return HOD_NAMES[department];
}

/* ----- requests ----- */

const today = planDate();
const dayOffset = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();

let requests = [];
let nextId = 1;

function makeRequest(fields) {
  const r = {
    id: nextId,
    request_no: `SSR-2026-${String(nextId).padStart(4, '0')}`,
    status: 'pending',
    hod_remark: null,
    decided_at: null,
    decided_by: null,
    ...fields,
  };
  nextId += 1;
  return r;
}

/** Shift of `empId` on `date` (YYYY-MM-DD), with any approved change or swap applied. */
export function shiftOn(empId, date) {
  let shift = baseShift[empId];
  requests
    .filter((r) => r.status === 'approved' && r.date === date)
    .sort((a, b) => (a.decided_at < b.decided_at ? -1 : 1))
    .forEach((r) => {
      if (r.employee_id === empId) shift = r.to_shift;
      else if (r.type === 'swap' && r.swap_with_id === empId) shift = r.from_shift;
    });
  return shift;
}

// Seed a few requests so both dashboards have something to show.
[
  { type: 'change', employee_id: 'EMP-1001', date: dayOffset(1), to_shift: 'B', reason: 'Family function in the morning.', created_at: hoursAgo(5) },
  { type: 'swap', employee_id: 'EMP-1002', date: dayOffset(2), swap_with_id: 'EMP-1004', reason: 'Medical appointment during my shift.', created_at: hoursAgo(20) },
  { type: 'change', employee_id: 'EMP-1007', date: dayOffset(0), to_shift: 'C', reason: 'Travelling back from native place.', created_at: hoursAgo(30), status: 'approved', decided: 26 },
  { type: 'change', employee_id: 'EMP-1003', date: dayOffset(3), to_shift: 'C', reason: 'Personal work.', created_at: hoursAgo(48), status: 'rejected', decided: 40, remark: 'Stores night shift already fully staffed.' },
].forEach(({ decided, remark, status, ...f }) => {
  const emp = findEmployee(f.employee_id);
  const from = shiftOn(f.employee_id, f.date);
  const to = f.type === 'swap' ? shiftOn(f.swap_with_id, f.date) : f.to_shift;
  const r = makeRequest({ ...f, department: emp.department, employee_name: emp.name, from_shift: from, to_shift: to, swap_with_name: f.swap_with_id ? findEmployee(f.swap_with_id).name : null });
  if (status) {
    r.status = status;
    r.decided_at = hoursAgo(decided);
    r.decided_by = hodName(emp.department);
    r.hod_remark = remark || null;
  }
  requests.push(r);
});

/* ----- who is viewing ----- */

let state = { role: null, employeeId: employees[0].id, hodDept: SS_DEPARTMENTS[0] };
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useShiftAuth() {
  const snap = useSyncExternalStore(subscribe, () => state);
  if (!snap.role) return { user: null };
  if (snap.role === 'hod') {
    return { user: { role: 'hod', name: hodName(snap.hodDept), department: snap.hodDept, employee_id: `HOD · ${snap.hodDept}` } };
  }
  const emp = findEmployee(snap.employeeId);
  return { user: { ...emp, role: 'employee', employee_id: emp.id } };
}

export function selectRole(role) { setState({ role }); }
export function selectEmployee(employeeId) { setState({ employeeId }); }
export function selectHodDepartment(hodDept) { setState({ hodDept }); }

/* ----- mock API ----- */

function respond(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(fn()); } catch (err) { reject(err); }
    }, 200);
  });
}

const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

/** Requests visible to the current profile: an employee's own (or swaps naming them), or the HOD's department. */
export function listRequests() {
  return respond(() => requests
    .filter((r) => (state.role === 'hod'
      ? r.department === state.hodDept
      : r.employee_id === state.employeeId || r.swap_with_id === state.employeeId))
    .sort(byNewest)
    .map((r) => ({ ...r })));
}

/** Schedule rows for a date: every employee (optionally one department) with their shift that day. */
export function scheduleFor(date, department) {
  return listEmployees(department).map((e) => {
    const shift = shiftOn(e.id, date);
    const changed = shift !== baseShift[e.id];
    const pending = requests.find((r) => r.status === 'pending' && r.date === date && (r.employee_id === e.id || r.swap_with_id === e.id));
    return { ...e, shift, baseShift: baseShift[e.id], changed, pending };
  });
}

export function submitRequest({ type, date, to_shift, swap_with_id, reason }) {
  return respond(() => {
    const emp = findEmployee(state.employeeId);
    if (!date) throw new Error('Pick the date for the change.');
    if (date < dateKey(planDate())) throw new Error('The date cannot be in the past.');
    if (!reason?.trim()) throw new Error('Enter a reason for the request.');
    const from = shiftOn(emp.id, date);
    let to = to_shift;
    let swapName = null;
    if (type === 'swap') {
      const other = findEmployee(swap_with_id);
      if (!other) throw new Error('Pick the employee to swap with.');
      if (other.department !== emp.department) throw new Error('You can only swap with an employee of your own department.');
      to = shiftOn(other.id, date);
      if (to === from) throw new Error(`${other.name} is already on Shift ${from} that day — pick someone on a different shift.`);
      swapName = other.name;
    } else if (!to || to === from) {
      throw new Error('Pick a shift different from your current one.');
    }
    const clash = requests.find((r) => r.status === 'pending' && r.date === date
      && [r.employee_id, r.swap_with_id].some((id) => id && (id === emp.id || id === swap_with_id)));
    if (clash) throw new Error(`There is already a pending request (${clash.request_no}) for that date.`);

    const r = makeRequest({
      type,
      employee_id: emp.id,
      employee_name: emp.name,
      department: emp.department,
      date,
      from_shift: from,
      to_shift: to,
      swap_with_id: type === 'swap' ? swap_with_id : null,
      swap_with_name: swapName,
      reason: reason.trim(),
      created_at: new Date().toISOString(),
    });
    requests = [r, ...requests];
    return { ...r };
  });
}

/** HOD approves or rejects a pending request of their department. */
export function decideRequest(id, decision, remark) {
  return respond(() => {
    const r = requests.find((x) => x.id === id);
    if (!r) throw new Error('Request not found');
    if (state.role !== 'hod' || r.department !== state.hodDept) throw new Error(`Only the ${r.department} HOD can decide this request.`);
    if (r.status !== 'pending') throw new Error('This request has already been decided.');
    if (decision === 'rejected' && !remark?.trim()) throw new Error('Enter a remark explaining the rejection.');
    if (decision === 'approved') {
      // The schedule may have changed since the request was raised.
      if (shiftOn(r.employee_id, r.date) !== r.from_shift) throw new Error(`${r.employee_name}'s shift on that date has changed since this was requested — reject it and ask for a new request.`);
      if (r.type === 'swap' && shiftOn(r.swap_with_id, r.date) !== r.to_shift) throw new Error(`${r.swap_with_name}'s shift on that date has changed since this was requested.`);
    }
    r.status = decision;
    r.hod_remark = remark?.trim() || null;
    r.decided_at = new Date().toISOString();
    r.decided_by = hodName(r.department);
    return { ...r };
  });
}

/* ----- read-only access for the portal's My Tasks page ----- */

export function tasksSnapshot() {
  return requests;
}
