import { useSyncExternalStore } from 'react';

/**
 * Machine Audit runs entirely on in-memory dummy data — no backend call.
 *
 * Flow: the Safety Officer submits an audit (and signs it) → it is assigned
 * to all three in-charges below → each in-charge completes their part with a
 * signature (note and photo optional) → only once all three have completed can the
 * Safety Officer close the audit.
 *
 * The HOD has a read-only view of every audited machine, month by month.
 */

export const CHECKLIST_ITEMS = [
  'Machine Guard Installed',
  'Emergency Stop Working',
  'Electrical Panel Locked',
  'Warning Labels Available',
  'PPE Used by Operator',
];

export const INCHARGE_ROLES = [
  { key: 'shift', label: 'Shift In-charge' },
  { key: 'mech', label: 'Mech Dept In-charge' },
  { key: 'ele', label: 'Ele Dept In-charge' },
];

export const MACHINE_DEPARTMENTS = ['Manufacturing', 'Production', 'Maintenance', 'Quality', 'Utilities'];

const OFFICER = {
  id: 1,
  employee_id: 'SO001',
  name: 'Rahul Deshpande',
  role: 'officer',
  department: 'EHS',
  phone: '+91 98765 10001',
  email: 'rahul.deshpande@example.com',
  address: 'EHS Office, Plant Campus, Pune',
};

let officerUser = { ...OFFICER };
let incharges = {
  shift: { id: 11, employee_id: 'SIC001', name: 'Prakash Jadhav', department: 'Production (Shift)', phone: '+91 98765 20011', email: 'prakash.jadhav@example.com' },
  mech: { id: 12, employee_id: 'MIC001', name: 'Sanjay Pawar', department: 'Mechanical Maintenance', phone: '+91 98765 20012', email: 'sanjay.pawar@example.com' },
  ele: { id: 13, employee_id: 'EIC001', name: 'Kavita Naik', department: 'Electrical Maintenance', phone: '+91 98765 20013', email: 'kavita.naik@example.com' },
};
incharges = Object.fromEntries(Object.entries(incharges).map(([key, u]) => [key, {
  ...u,
  role: 'incharge',
  incharge: key,
  title: INCHARGE_ROLES.find((r) => r.key === key).label,
  address: `${u.department} Office, Plant Campus, Pune`,
}]));

// Read-only reviewer of all machine audits.
let hodUser = {
  id: 21,
  employee_id: 'MHOD001',
  name: 'Sunil Kamat',
  role: 'hod',
  title: 'HOD',
  department: 'Plant Engineering',
  phone: '+91 98765 20021',
  email: 'sunil.kamat@example.com',
  address: 'Plant Engineering HOD Office, Plant Campus, Pune',
};

export function inchargeFor(key) {
  return incharges[key];
}

/** How many of the three in-charges have completed this audit. */
export function signoffCount(audit) {
  return INCHARGE_ROLES.filter(({ key }) => audit.signoffs[key]?.status === 'completed').length;
}

export function roleLabel(key) {
  return INCHARGE_ROLES.find((r) => r.key === key)?.label || key;
}

/** Checklist rows marked "No" — these become the Overall Observation points. */
export function observationPoints(checklist) {
  return checklist.filter((row) => row.status === 'No');
}

/* ----- seed data ----- */

function placeholderPhoto(title, subtitle) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#4338ca"/><circle cx="320" cy="170" r="70" fill="#fff" opacity=".92"/><path d="M290 170l20 20 40-44" stroke="#4338ca" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="320" y="315" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${title}</text><text x="320" y="352" font-family="Arial" font-size="18" fill="#fff" opacity=".85" text-anchor="middle">${subtitle}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

function seedChecklist(noItems) {
  return CHECKLIST_ITEMS.map((item) => {
    const remarks = noItems[item];
    return remarks
      ? { item, status: 'No', remarks, photo_url: placeholderPhoto(item, 'Audit evidence') }
      : { item, status: 'Yes', remarks: '', photo_url: null };
  });
}

function seedSignoff(key, doneDaysAgo, note) {
  if (doneDaysAgo === null) return { status: 'pending', note: null, photo_url: null, signature_data: null, completed_at: null };
  return {
    status: 'completed',
    note,
    photo_url: placeholderPhoto(roleLabel(key), 'Action taken'),
    signature_data: null,
    completed_at: daysAgo(doneDaysAgo),
  };
}

function seedAudit(id, fields) {
  const { created, signoffs, closed, ...rest } = fields;
  const audit = {
    id,
    audit_no: `MA-2026-${String(id).padStart(5, '0')}`,
    officer: OFFICER,
    officer_signature: null,
    notes: '',
    created_at: daysAgo(created),
    updated_at: daysAgo(created),
    signoffs: Object.fromEntries(INCHARGE_ROLES.map(({ key }) => [key, seedSignoff(key, ...signoffs[key])])),
    closure_note: closed ? closed[1] : null,
    closed_at: closed ? daysAgo(closed[0]) : null,
    ...rest,
  };
  audit.status = deriveStatus(audit);
  return audit;
}

function deriveStatus(audit) {
  if (audit.closed_at) return 'closed';
  return INCHARGE_ROLES.every(({ key }) => audit.signoffs[key].status === 'completed') ? 'ready_to_close' : 'pending_incharge';
}

let audits = [
  seedAudit(1, {
    machine_name: 'CNC Lathe', machine_id: 'CNC-L-014', department: 'Manufacturing', location: 'Shop Floor A', audit_date: daysAgo(20).slice(0, 10),
    checklist: seedChecklist({ 'Machine Guard Installed': 'Chuck guard missing after tool change' }),
    created: 20,
    signoffs: { shift: [19, 'Operators briefed; machine stopped until guard refitted.'], mech: [18, 'Chuck guard refitted and interlock tested.'], ele: [18, 'Interlock wiring checked — OK.'] },
    closed: [17, 'All actions verified on site.'],
  }),
  seedAudit(2, {
    machine_name: 'Hydraulic Press', machine_id: 'HP-200-03', department: 'Production', location: 'Press Shop', audit_date: daysAgo(6).slice(0, 10),
    checklist: seedChecklist({ 'Emergency Stop Working': 'E-stop button does not latch', 'Warning Labels Available': 'Pinch-point label faded' }),
    created: 6,
    signoffs: { shift: [5, 'Press isolated; operators moved to Press 04.'], mech: [4, 'New pinch-point labels fixed.'], ele: [null] },
  }),
  seedAudit(3, {
    machine_name: 'Air Compressor', machine_id: 'AC-75-01', department: 'Utilities', location: 'Compressor House', audit_date: daysAgo(4).slice(0, 10),
    checklist: seedChecklist({ 'Electrical Panel Locked': 'Panel door lock broken' }),
    created: 4,
    signoffs: { shift: [3, 'Area cordoned off.'], mech: [3, 'No mechanical issue found.'], ele: [2, 'Panel lock replaced; key with shift in-charge.'] },
  }),
  seedAudit(4, {
    machine_name: 'Bench Grinder', machine_id: 'BG-06', department: 'Maintenance', location: 'Tool Room', audit_date: daysAgo(1).slice(0, 10),
    checklist: seedChecklist({ 'PPE Used by Operator': 'Operator grinding without face shield', 'Machine Guard Installed': 'Tool rest gap more than 3 mm' }),
    created: 1,
    signoffs: { shift: [null], mech: [null], ele: [null] },
  }),
  // Earlier audits of the same machines, so each has an audit history.
  seedAudit(5, {
    machine_name: 'CNC Lathe', machine_id: 'CNC-L-014', department: 'Manufacturing', location: 'Shop Floor A', audit_date: daysAgo(80).slice(0, 10),
    checklist: seedChecklist({ 'Warning Labels Available': 'Rotating-parts label missing' }),
    created: 80,
    signoffs: { shift: [79, 'Operators informed.'], mech: [78, 'Label fixed.'], ele: [78, 'No electrical issue.'] },
    closed: [77, 'Verified label on machine.'],
  }),
  seedAudit(6, {
    machine_name: 'CNC Lathe', machine_id: 'CNC-L-014', department: 'Manufacturing', location: 'Shop Floor A', audit_date: daysAgo(140).slice(0, 10),
    checklist: seedChecklist({}),
    created: 140,
    signoffs: { shift: [139, 'No action needed.'], mech: [139, 'No action needed.'], ele: [139, 'No action needed.'] },
    closed: [138, 'All points compliant.'],
  }),
  seedAudit(7, {
    machine_name: 'Hydraulic Press', machine_id: 'HP-200-03', department: 'Production', location: 'Press Shop', audit_date: daysAgo(95).slice(0, 10),
    checklist: seedChecklist({ 'PPE Used by Operator': 'Operator without safety gloves' }),
    created: 95,
    signoffs: { shift: [94, 'Gloves issued and operator counselled.'], mech: [93, 'No mechanical issue.'], ele: [93, 'No electrical issue.'] },
    closed: [92, 'PPE compliance checked on next shift.'],
  }),
];

let notifications = [
  { id: 1, message: 'MA-2026-00003 — all in-charges completed. Ready for you to close.', audit_id: 3, is_read: false, created_at: daysAgo(2), target: 'officer' },
  { id: 2, message: 'New machine audit MA-2026-00004 (Bench Grinder) assigned to you', audit_id: 4, is_read: false, created_at: daysAgo(1), target: 'incharge' },
  { id: 3, message: 'New machine audit MA-2026-00002 (Hydraulic Press) assigned to you', audit_id: 2, is_read: true, created_at: daysAgo(6), target: 'incharge' },
  { id: 4, message: 'MA-2026-00001 (CNC Lathe) was audited and closed', audit_id: 1, is_read: true, created_at: daysAgo(17), target: 'hod' },
];
let nextAuditId = audits.length + 1;
let nextNotificationId = notifications.length + 1;

/* ----- machine history ----- */

const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

// Audits belong to the same machine when their Machine IDs match, or — if
// either has no ID — when their machine names match.
function sameMachine(a, machine) {
  const id = machine.machine_id?.trim().toLowerCase();
  if (id && a.machine_id) return a.machine_id.toLowerCase() === id;
  return a.machine_name.toLowerCase() === (machine.machine_name || '').trim().toLowerCase();
}

/** Every audit of this machine, latest first. */
export function machineHistory(machine) {
  if (!machine.machine_id?.trim() && !machine.machine_name?.trim()) return [];
  return audits.filter((a) => sameMachine(a, machine)).sort(byNewest);
}

/**
 * One row per audited machine from a list of audits: latest audit details,
 * how many times it was audited and how many are still open.
 */
export function summarizeMachines(list) {
  const groups = new Map();
  [...list].sort(byNewest).forEach((a) => {
    const key = (a.machine_id || a.machine_name).toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  });
  return [...groups.entries()].map(([key, history]) => {
    const last = history[0];
    return {
      key,
      machine_id: last.machine_id,
      machine_name: last.machine_name,
      department: last.department,
      location: last.location,
      last,
      history,
      total: history.length,
      open: history.filter((h) => h.status !== 'closed').length,
      nonCompliance: last.checklist.filter((r) => r.status === 'No').length,
    };
  });
}

/** One entry per audited machine (details from its latest audit), for picking a machine to re-audit. */
export function knownMachines() {
  const seen = new Map();
  [...audits].sort(byNewest).forEach((a) => {
    const key = (a.machine_id || a.machine_name).toLowerCase();
    if (!seen.has(key)) seen.set(key, { machine_id: a.machine_id, machine_name: a.machine_name, department: a.department, location: a.location });
  });
  return [...seen.values()];
}

/* ----- who is viewing ----- */

let state = { role: null, inchargeKey: 'shift' };
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function currentUser() {
  if (state.role === 'hod') return hodUser;
  return state.role === 'incharge' ? incharges[state.inchargeKey] : officerUser;
}

export function useMachineAuditAuth() {
  const snap = useSyncExternalStore(subscribe, () => state);
  return { user: snap.role ? currentUser() : null };
}

export function selectRole(role) {
  setState({ role });
}

export function selectIncharge(key) {
  setState({ inchargeKey: key });
}

export function logout() {
  setState({ role: null });
}

/* ----- mock API ----- */

// A small artificial delay so skeleton loaders are visible instead of a flash.
function respond(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, 250);
  });
}

function notify(message, auditId, target) {
  notifications = [
    { id: nextNotificationId++, message, audit_id: auditId, is_read: false, created_at: new Date().toISOString(), target },
    ...notifications,
  ];
}

function findAudit(id) {
  const audit = audits.find((a) => a.id === Number(id));
  if (!audit) throw new Error('Audit not found');
  return audit;
}

export function listAudits() {
  return respond(() => [...audits].sort(byNewest));
}

export function getAudit(id) {
  return respond(() => findAudit(id));
}

export function createAudit(body) {
  return respond(() => {
    const now = new Date().toISOString();
    const audit = {
      id: nextAuditId,
      audit_no: `MA-2026-${String(nextAuditId).padStart(5, '0')}`,
      officer: officerUser,
      ...body,
      signoffs: Object.fromEntries(INCHARGE_ROLES.map(({ key }) => [key, seedSignoff(key, null)])),
      closure_note: null,
      closed_at: null,
      created_at: now,
      updated_at: now,
    };
    audit.status = deriveStatus(audit);
    nextAuditId += 1;
    audits = [audit, ...audits];
    notify(`New machine audit ${audit.audit_no} (${audit.machine_name}) assigned to you`, audit.id, 'incharge');
    return audit;
  });
}

/** The in-charge currently viewing completes their part of the audit. */
export function completeSignoff(id, { note, photo_url, signature_data }) {
  return respond(() => {
    const audit = findAudit(id);
    const key = state.inchargeKey;
    if (audit.status === 'closed') throw new Error('This audit is already closed.');
    if (audit.signoffs[key].status === 'completed') throw new Error('You have already completed this audit.');
    const now = new Date().toISOString();
    audit.signoffs = { ...audit.signoffs, [key]: { status: 'completed', note, photo_url, signature_data, completed_at: now } };
    audit.status = deriveStatus(audit);
    audit.updated_at = now;
    notify(`${audit.audit_no} completed by ${incharges[key].name} (${roleLabel(key)})`, audit.id, 'officer');
    if (audit.status === 'ready_to_close') {
      notify(`${audit.audit_no} — all in-charges completed. Ready for you to close.`, audit.id, 'officer');
    }
    return audit;
  });
}

export function closeAudit(id, { closure_note }) {
  return respond(() => {
    const audit = findAudit(id);
    if (audit.status !== 'ready_to_close') {
      const waiting = INCHARGE_ROLES.filter(({ key }) => audit.signoffs[key].status !== 'completed').map((r) => r.label);
      throw new Error(`Cannot close yet — waiting on ${waiting.join(', ')}.`);
    }
    const now = new Date().toISOString();
    audit.status = 'closed';
    audit.closure_note = closure_note || null;
    audit.closed_at = now;
    audit.updated_at = now;
    notify(`${audit.audit_no} was closed by ${officerUser.name}`, audit.id, 'incharge');
    notify(`${audit.audit_no} (${audit.machine_name}) was audited and closed`, audit.id, 'hod');
    return audit;
  });
}

export function listNotifications() {
  return respond(() => notifications.filter((n) => n.target === state.role));
}

export function markNotificationRead(id) {
  return respond(() => {
    const n = notifications.find((x) => x.id === id);
    if (!n) throw new Error('Notification not found');
    n.is_read = true;
    return n;
  });
}

export function updateProfile(values) {
  return respond(() => {
    if (state.role === 'incharge') {
      incharges = { ...incharges, [state.inchargeKey]: { ...incharges[state.inchargeKey], ...values } };
    } else if (state.role === 'hod') {
      hodUser = { ...hodUser, ...values };
    } else {
      officerUser = { ...officerUser, ...values };
    }
    setState({}); // re-render anything showing the current user
    return currentUser();
  });
}

/* ----- read-only access for the portal's My Tasks page ----- */

export function tasksSnapshot() {
  return { audits, officer: officerUser };
}
