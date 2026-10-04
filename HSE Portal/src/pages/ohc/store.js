import { useSyncExternalStore } from 'react';
import { buildSeed } from './seed';

/**
 * Digital Occupational Health Management (OHC) — the clinic workflow:
 * OP registration → nurse assessment → MBBS consultation → pharmacy issue,
 * with follow-ups / referrals and every closed visit kept in the employee's
 * medical history. There is no backend yet, so everything lives in
 * localStorage and survives a page refresh.
 */

const STORAGE_KEY = 'ohc-dms-data-v1';

/* ---------- dates ---------- */

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
export const todayKey = () => dayKey(new Date());
export const addDays = (key, n) => {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (v) => {
  if (!v) return '—';
  const d = typeof v === 'string' && v.length === 10 ? new Date(`${v}T00:00:00`) : new Date(v);
  return `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};
export const fmtMonth = (v) => {
  if (!v) return '—';
  const d = new Date(`${v.slice(0, 10)}T00:00:00`);
  return `${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};
export const fmtTime = (v) => (v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtDateTime = (v) => (v ? `${fmtDate(v)} ${fmtTime(v)}` : '—');

/* ---------- reference data ---------- */

export const DEPARTMENTS = ['Production', 'Maintenance', 'Warehouse', 'Utility', 'Quality', 'Admin'];
export const COMPLAINTS = ['Headache', 'Cold', 'Fever', 'Body Pain', 'Stomach Pain', 'Minor Injury', 'Eye Irritation', 'Dizziness', 'Acidity', 'Other'];
export const VISIT_TYPES = ['Normal OHC Visit', 'Follow-up', 'Referral Review', 'Injury on Duty', 'Pre-employment Check'];
export const FITNESS = ['Fit for Work', 'Fit with Advice', 'Rest Advised', 'Refer'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const MED_CATEGORIES = ['Analgesic', 'Antacid', 'Antihistamine', 'Electrolyte', 'Supplement', 'Topical', 'Dressing', 'Ophthalmic', 'Antispasmodic', 'Other'];

export const STAGES = {
  nurse: { label: 'Nurse', pill: 'pill-amber' },
  doctor: { label: 'Doctor', pill: 'pill-blue' },
  pharmacy: { label: 'Pharmacy', pill: 'pill-violet' },
  completed: { label: 'Completed', pill: 'pill-green' },
};

/* ---------- state ---------- */

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.version === 1) return saved;
  } catch {
    /* storage unavailable or corrupt — fall back to the seed data */
  }
  return buildSeed();
}

let data = load();
const listeners = new Set();

function commit(next) {
  data = { ...data, ...next };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota / private-mode errors */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useOhc() {
  return useSyncExternalStore(subscribe, () => data);
}
export const getOhc = () => data;

// One-shot hand-off between pages (e.g. "Save & Start Nurse Assessment"
// opens the nurse page with the new visit already selected).
const pending = {};
export function setPending(view, payload) { pending[view] = payload; }
export function takePending(view) {
  const p = pending[view];
  delete pending[view];
  return p;
}

/* ---------- selectors ---------- */

export const findEmployee = (id) => data.employees.find((e) => e.id.toLowerCase() === String(id || '').trim().toLowerCase()) || null;
export const empLabel = (id) => {
  const e = findEmployee(id);
  return e ? `${e.id} • ${e.name}` : id;
};

export function medicineStatus(m, expiryDays = data.settings.expiry_days) {
  const today = todayKey();
  if (m.expiry < today) return { key: 'expired', label: 'Expired', pill: 'pill-red' };
  if (m.stock <= 0) return { key: 'out', label: 'Out of Stock', pill: 'pill-red' };
  if (m.expiry <= addDays(today, expiryDays)) return { key: 'expiring', label: 'Expiring Soon', pill: 'pill-orange' };
  if (m.stock <= m.reorder) return { key: 'low', label: 'Low Stock', pill: 'pill-amber' };
  return { key: 'ok', label: 'Available', pill: 'pill-green' };
}

export function followupStatus(f) {
  if (f.status === 'completed') return { key: 'completed', label: 'Completed', pill: 'pill-green' };
  const today = todayKey();
  if (f.status === 'referred' && f.review_date >= today) return { key: 'referred', label: 'Referred', pill: 'pill-blue' };
  if (f.review_date < today) return { key: 'overdue', label: 'Overdue', pill: 'pill-red' };
  if (f.review_date === today) return { key: 'today', label: 'Due Today', pill: 'pill-orange' };
  if (f.review_date === addDays(today, 1)) return { key: 'tomorrow', label: 'Due Tomorrow', pill: 'pill-amber' };
  return { key: 'upcoming', label: 'Upcoming', pill: 'pill-slate' };
}

export const isFollowupDue = (f) => ['overdue', 'today', 'tomorrow'].includes(followupStatus(f).key);

/** Readings outside the normal adult range, for the nurse / doctor screens. */
export function vitalFlags(v) {
  if (!v) return [];
  const flags = [];
  const sys = Number(v.bp_sys);
  const dia = Number(v.bp_dia);
  if (sys && dia && (sys >= 140 || dia >= 90)) flags.push('High BP');
  if (sys && dia && (sys < 90 || dia < 60)) flags.push('Low BP');
  if (Number(v.temp) >= 100.4) flags.push('Fever');
  if (Number(v.pulse) > 100) flags.push('Tachycardia');
  if (v.pulse && Number(v.pulse) < 55) flags.push('Bradycardia');
  if (v.spo2 && Number(v.spo2) < 95) flags.push('Low SpO₂');
  return flags;
}

export const bmi = (v) => {
  const w = Number(v?.weight);
  const h = Number(v?.height) / 100;
  return w && h ? (w / (h * h)).toFixed(1) : null;
};

/* ---------- actions ---------- */

const nowIso = () => new Date().toISOString();
const nextNo = (prefix, n, width = 4) => `${prefix}${String(n).padStart(width, '0')}`;

export function addEmployee(emp) {
  const id = emp.id.trim().toUpperCase();
  if (!id || !emp.name.trim()) throw new Error('Employee ID and name are required.');
  if (findEmployee(id)) throw new Error(`Employee ${id} already exists.`);
  const record = { ...emp, id, name: emp.name.trim(), created_at: nowIso() };
  commit({ employees: [record, ...data.employees] });
  return record;
}

export function updateEmployee(id, patch) {
  commit({ employees: data.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
}

export function registerVisit(input) {
  const emp = findEmployee(input.employee_id);
  if (!emp) throw new Error('Select a registered employee.');
  if (!input.complaint) throw new Error('Choose the primary complaint.');
  const created = input.created_at ? new Date(input.created_at).toISOString() : nowIso();
  const day = dayKey(created);
  const token = data.visits.filter((v) => dayKey(v.created_at) === day).length + 1;
  const seq = data.seq.op + 1;
  const visit = {
    id: `V${Date.now()}`,
    op_number: `OHC-${created.slice(0, 4)}-${String(seq).padStart(4, '0')}`,
    token: String(token).padStart(3, '0'),
    employee_id: emp.id,
    department: emp.department,
    created_at: created,
    visit_type: input.visit_type,
    complaint: input.complaint,
    complaint_text: input.complaint_text?.trim() || '',
    priority: input.priority || 'Normal',
    stage: 'nurse',
    nurse: null,
    doctor: null,
    rx_id: null,
  };
  commit({ visits: [visit, ...data.visits], seq: { ...data.seq, op: seq } });
  return visit;
}

const patchVisit = (id, patch) => data.visits.map((v) => (v.id === id ? { ...v, ...patch } : v));

/** sendToDoctor = false closes the visit at nurse level (minor complaint). */
export function saveNurseAssessment(visitId, vitals, sendToDoctor) {
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit) throw new Error('Visit not found.');
  const nurse = { ...vitals, at: nowIso() };
  commit({ visits: patchVisit(visitId, { nurse, stage: sendToDoctor ? 'doctor' : 'completed', closed_at: sendToDoctor ? null : nowIso() }) });
}

export function completeConsultation(visitId, consult, items) {
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit) throw new Error('Visit not found.');
  if (!consult.diagnosis?.trim()) throw new Error('Enter the provisional diagnosis.');
  const at = nowIso();
  const lines = items.filter((i) => i.medicine_id && Number(i.qty) > 0);
  const next = { seq: { ...data.seq } };
  let rx = null;
  if (lines.length) {
    next.seq.rx += 1;
    rx = {
      id: `RX${Date.now()}`,
      rx_no: nextNo('RX-', next.seq.rx),
      visit_id: visitId,
      employee_id: visit.employee_id,
      doctor: consult.doctor,
      diagnosis: consult.diagnosis.trim(),
      advice: consult.advice,
      items: lines.map((l) => {
        const m = data.medicines.find((x) => x.id === l.medicine_id);
        return { medicine_id: l.medicine_id, name: m?.name || '?', dose: l.dose, duration: l.duration, qty: Number(l.qty) };
      }),
      status: 'pending',
      created_at: at,
    };
    next.prescriptions = [rx, ...data.prescriptions];
  }
  const referral = consult.referral && consult.referral !== 'No referral';
  if (referral || consult.follow_up_date) {
    next.seq.fu += 1;
    next.followups = [{
      id: nextNo('FU-', next.seq.fu),
      employee_id: visit.employee_id,
      visit_id: visitId,
      reason: consult.diagnosis.trim(),
      action: referral ? `Referral — ${consult.referral}` : 'Doctor review',
      review_date: consult.follow_up_date || addDays(todayKey(), 3),
      status: referral ? 'referred' : 'open',
      notes: '',
      created_at: at,
    }, ...data.followups];
  }
  next.visits = patchVisit(visitId, {
    doctor: { ...consult, at },
    rx_id: rx?.id || null,
    stage: rx ? 'pharmacy' : 'completed',
    closed_at: rx ? null : at,
  });
  commit(next);
  return rx;
}

function deduct(medicines, medicine_id, qty) {
  const m = medicines.find((x) => x.id === medicine_id);
  if (!m) throw new Error('Medicine not found.');
  if (m.expiry < todayKey()) throw new Error(`${m.name} (batch ${m.batch}) has expired and cannot be issued.`);
  if (m.stock < qty) throw new Error(`Only ${m.stock} ${m.unit} of ${m.name} in stock (need ${qty}).`);
  return medicines.map((x) => (x.id === medicine_id ? { ...x, stock: x.stock - qty } : x));
}

export function issuePrescription(rxId, issuedBy) {
  const rx = data.prescriptions.find((r) => r.id === rxId);
  if (!rx || rx.status !== 'pending') throw new Error('This prescription is not pending issue.');
  let medicines = data.medicines;
  rx.items.forEach((it) => { medicines = deduct(medicines, it.medicine_id, it.qty); });
  const at = nowIso();
  let n = data.seq.issue;
  const issues = rx.items.map((it) => ({ id: `IS${(n += 1)}`, medicine_id: it.medicine_id, qty: it.qty, employee_id: rx.employee_id, rx_id: rx.id, at, by: issuedBy }));
  commit({
    medicines,
    issues: [...issues, ...data.issues],
    seq: { ...data.seq, issue: n },
    prescriptions: data.prescriptions.map((r) => (r.id === rxId ? { ...r, status: 'issued', issued_at: at, issued_by: issuedBy } : r)),
    visits: patchVisit(rx.visit_id, { stage: 'completed', closed_at: at }),
  });
}

export function issueMedicineDirect({ medicine_id, qty, employee_id, note, by }) {
  const q = Number(qty);
  if (!q || q < 1) throw new Error('Enter a quantity of at least 1.');
  if (employee_id && !findEmployee(employee_id)) throw new Error('Unknown employee ID.');
  const medicines = deduct(data.medicines, medicine_id, q);
  const n = data.seq.issue + 1;
  commit({
    medicines,
    issues: [{ id: `IS${n}`, medicine_id, qty: q, employee_id: employee_id ? findEmployee(employee_id).id : null, rx_id: null, note, at: nowIso(), by }, ...data.issues],
    seq: { ...data.seq, issue: n },
  });
}

export function addStock({ medicine_id, name, category, unit, reorder, batch, expiry, qty }) {
  const q = Number(qty);
  if (!q || q < 1) throw new Error('Enter the quantity received.');
  if (!expiry) throw new Error('Enter the expiry date.');
  if (medicine_id) {
    commit({
      medicines: data.medicines.map((m) => (m.id === medicine_id
        ? { ...m, stock: m.stock + q, batch: batch?.trim() || m.batch, expiry, received_at: nowIso() }
        : m)),
    });
    return;
  }
  if (!name?.trim()) throw new Error('Enter the medicine name.');
  const n = data.seq.med + 1;
  commit({
    medicines: [...data.medicines, {
      id: `M${n}`, name: name.trim(), category, unit: unit || 'tabs', batch: batch?.trim() || '—', expiry, stock: q, reorder: Number(reorder) || 0, received_at: nowIso(),
    }],
    seq: { ...data.seq, med: n },
  });
}

export function updateFollowup(id, patch) {
  commit({ followups: data.followups.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
}

export function completeFollowup(id, notes) {
  updateFollowup(id, { status: 'completed', notes, closed_at: nowIso() });
}

export function addFollowup({ employee_id, reason, action, review_date }) {
  if (!findEmployee(employee_id)) throw new Error('Select a registered employee.');
  if (!reason?.trim() || !review_date) throw new Error('Reason and review date are required.');
  const n = data.seq.fu + 1;
  commit({
    followups: [{
      id: nextNo('FU-', n), employee_id: findEmployee(employee_id).id, visit_id: null, reason: reason.trim(), action, review_date,
      status: action.startsWith('Referral') ? 'referred' : 'open', notes: '', created_at: nowIso(),
    }, ...data.followups],
    seq: { ...data.seq, fu: n },
  });
}

export function updateSettings(patch) {
  commit({ settings: { ...data.settings, ...patch } });
}

export function resetDemoData() {
  data = buildSeed();
  commit({});
}
