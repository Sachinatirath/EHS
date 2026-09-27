// Monthly Audit & Training Plan. `days` are the day-of-month
// columns marked "P" in the plan sheet; `shift` is the shift that owns the
// activity when it falls due.

export const SHIFTS = [
  { id: 'A', label: 'Shift A', time: '06:00 – 14:00', start: 6, end: 14, variant: 'amber' },
  { id: 'B', label: 'Shift B', time: '14:00 – 22:00', start: 14, end: 22, variant: 'blue' },
  { id: 'C', label: 'Shift C', time: '22:00 – 06:00', start: 22, end: 6, variant: 'violet' },
];

export const AUDIT_PLAN = [
  { id: 1, name: 'PPE Audits', shift: 'A', days: [1, 8, 15, 22, 29] },
  { id: 2, name: 'BBS Audit', shift: 'A', days: [1, 8, 15, 22] },
  { id: 3, name: 'OHC Audit', shift: 'A', days: [2, 9, 16, 23, 30] },
  { id: 4, name: 'Electrical Safety Audit', shift: 'B', days: [2, 9, 16, 23, 30] },
  { id: 5, name: 'Fire Safety Audit', shift: 'A', days: [3, 10, 17, 24, 31] },
  { id: 6, name: 'Height Work Safety Audit', shift: 'B', days: [3, 10, 17, 24, 31] },
  { id: 7, name: "MHE's (Boom Lift / Mobile Scaffolds etc.)", shift: 'B', days: [4, 11, 18, 25] },
  { id: 8, name: 'Machine Inspections / Power Tools', shift: 'B', days: [4, 11, 18, 25] },
  { id: 9, name: 'Ambulance Inspection', shift: 'A', days: [5, 12, 19, 26] },
  { id: 10, name: 'All Vehicle Inspection', shift: 'B', days: [5, 12, 19, 26, 29] },
  { id: 11, name: 'Tools and Tackles Inspection', shift: 'B', days: [3, 6, 10, 13, 17, 20, 24, 27, 29] },
  { id: 12, name: 'Crane Inspection', shift: 'A', days: [6, 13, 20, 27] },
  { id: 13, name: 'Illumination Audit', shift: 'C', days: [7, 14, 21, 28, 30] },
  { id: 14, name: 'Hard Barrication', shift: 'C', days: [7, 14, 21, 28] },
  { id: 15, name: 'Power Tools Inspection', shift: 'B', days: [7, 14, 21, 28, 31] },
  { id: 16, name: 'Safety Harness Inspection', shift: 'B', days: [7, 14, 21, 28] },
  { id: 17, name: 'Housekeeping Audit', shift: 'A', days: [2, 9, 16, 23] },
  { id: 18, name: 'Fabrication Audit', shift: 'B', days: [5, 12, 19, 26] },
  { id: 19, name: 'Chemical Storage Inspection', shift: 'A', days: [4, 11, 18, 25] },
  { id: 20, name: 'First Aid Box Inspection', shift: 'A', days: [7, 14, 21, 28] },
  { id: 21, name: 'Welding & Gas Cutting Safety Audit', shift: 'B', days: [1, 8, 15, 22] },
  { id: 22, name: 'Night Shift Safety Round', shift: 'C', days: [1, 4, 8, 11, 15, 18, 22, 25, 29] },
  { id: 23, name: 'Emergency Lighting & Exit Signage Check', shift: 'C', days: [2, 5, 9, 12, 16, 19, 23, 26, 31] },
  { id: 24, name: 'Fire Hydrant & Sprinkler Line Check', shift: 'C', days: [3, 6, 10, 13, 17, 20, 24, 27] },
];

// Daily Training Plan — a different training in each shift (A, B, C) every
// day. Shift A follows the plant's daily list; B and C cover other topics.
export const TRAINING_PLAN = [
  { day: 1, A: 'Fire Safety training', B: 'Electrical Safety Training', C: "MHE's (Material Handling Equipments) Safety Training" },
  { day: 2, A: 'Electrical Safety Training', B: 'Hot work Training', C: 'Erection Safety' },
  { day: 3, A: 'Hot work Training', B: 'Lifting Tools tackles', C: 'PPE awareness' },
  { day: 4, A: 'Lifting Tools tackles', B: 'Electrical Training', C: 'Emergency Response Training' },
  { day: 5, A: 'Electrical Training', B: "MHE's (Material Handling Equipments) Safety Training", C: 'Manual lifting techniques' },
  { day: 6, A: 'Fire Safety training', B: 'Erection Safety', C: 'Work permit system' },
  { day: 7, A: 'Hot work Training', B: 'PPE awareness', C: 'BBS Training' },
  { day: 8, A: "MHE's (Material Handling Equipments) Safety Training", B: 'Emergency Response Training', C: 'Importance of Housekeeping' },
  { day: 9, A: 'Erection Safety', B: 'Manual lifting techniques', C: 'LOTO Training' },
  { day: 10, A: 'PPE awareness', B: 'Work permit system', C: 'Vehicle safety training' },
  { day: 11, A: 'Emergency Response Training', B: 'BBS Training', C: 'Fire Safety training' },
  { day: 12, A: 'Lifting Tools tackles', B: 'Importance of Housekeeping', C: 'Electrical Safety Training' },
  { day: 13, A: 'Fire Safety training', B: 'LOTO Training', C: 'Hot work Training' },
  { day: 14, A: 'PPE awareness', B: 'Vehicle safety training', C: 'Lifting Tools tackles' },
  { day: 15, A: 'Manual lifting techniques', B: 'Fire Safety training', C: 'Electrical Training' },
  { day: 16, A: 'Erection Safety', B: 'Electrical Safety Training', C: "MHE's (Material Handling Equipments) Safety Training" },
  { day: 17, A: 'Hot work Training', B: 'Lifting Tools tackles', C: 'Erection Safety' },
  { day: 18, A: 'Work permit system', B: 'Electrical Training', C: 'PPE awareness' },
  { day: 19, A: 'Fire Safety training', B: "MHE's (Material Handling Equipments) Safety Training", C: 'Emergency Response Training' },
  { day: 20, A: 'BBS Training', B: 'Erection Safety', C: 'Manual lifting techniques' },
  { day: 21, A: 'Fire Safety training', B: 'PPE awareness', C: 'Work permit system' },
  { day: 22, A: 'PPE awareness', B: 'Emergency Response Training', C: 'BBS Training' },
  { day: 23, A: 'Importance of Housekeeping', B: 'Manual lifting techniques', C: 'LOTO Training' },
  { day: 24, A: 'Erection Safety', B: 'Work permit system', C: 'Vehicle safety training' },
  { day: 25, A: 'Fire Safety training', B: 'BBS Training', C: 'Electrical Safety Training' },
  { day: 26, A: 'BBS Training', B: 'Importance of Housekeeping', C: 'Hot work Training' },
  { day: 27, A: 'LOTO Training', B: 'Vehicle safety training', C: 'Lifting Tools tackles' },
  { day: 28, A: 'BBS Training', B: 'Fire Safety training', C: 'Electrical Training' },
  { day: 29, A: 'Vehicle safety training', B: 'Electrical Safety Training', C: "MHE's (Material Handling Equipments) Safety Training" },
  { day: 30, A: 'BBS Training', B: 'Hot work Training', C: 'Erection Safety' },
  { day: 31, A: 'Vehicle safety training', B: 'Lifting Tools tackles', C: 'PPE awareness' },
].map((t) => ({ ...t, id: `tr-${t.day}` }));

/* ----- per-month plans (editable; kept in localStorage — no backend yet) ----- */

const PLANS_KEY = 'ehs-atp-monthly-plans';

export function monthKeyOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function readPlans() {
  try {
    return JSON.parse(localStorage.getItem(PLANS_KEY) || '{}');
  } catch {
    return {};
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * The plan for a month ('YYYY-MM'): its audit matrix, daily trainings and the
 * edit history. Months never edited start from the default plan above.
 */
export function getMonthPlan(monthKey = monthKeyOf(planDate())) {
  const saved = readPlans()[monthKey] || {};
  return {
    audits: saved.audits || clone(AUDIT_PLAN),
    trainings: saved.trainings || clone(TRAINING_PLAN),
    history: saved.history || [],
  };
}

/** Save one section ('audits' | 'trainings') of a month's plan and log who edited it. */
export function saveMonthPlan(monthKey, section, data, editor) {
  const all = readPlans();
  const current = getMonthPlan(monthKey);
  const entry = { section, at: new Date().toISOString(), ...editor };
  all[monthKey] = { ...current, [section]: data, history: [entry, ...current.history] };
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  } catch {
    throw new Error('Could not save the plan in this browser.');
  }
  return all[monthKey];
}

export function trainingForDay(day, monthKey) {
  return getMonthPlan(monthKey).trainings.find((t) => t.day === day) || null;
}

export function currentShift(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 14) return 'A';
  if (h >= 14 && h < 22) return 'B';
  return 'C';
}

// Shift C runs past midnight, so between 00:00 and 06:00 the active plan
// day is still yesterday's.
export function planDate(date = new Date()) {
  const d = new Date(date);
  if (d.getHours() < 6) d.setDate(d.getDate() - 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

// The day's training for one shift; each shift tracks its own completion.
function trainingTask(day, shiftId, monthKey) {
  const training = trainingForDay(day, monthKey);
  return training ? { id: `${training.id}-${shiftId}`, name: training[shiftId], shift: shiftId, kind: 'training' } : null;
}

// `monthKey` ('YYYY-MM') picks that month's plan; defaults to the current plan month.
export function tasksForShift(day, shiftId, monthKey) {
  const training = trainingTask(day, shiftId, monthKey);
  const audits = getMonthPlan(monthKey).audits.filter((a) => a.days.includes(day) && a.shift === shiftId);
  return [...audits, ...(training && training.name ? [training] : [])];
}

// Everything planned that day across all three shifts.
export function tasksForDay(day, monthKey) {
  return SHIFTS.flatMap((s) => tasksForShift(day, s.id, monthKey));
}

export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Completion state is kept per date in localStorage (no backend yet).
const DONE_KEY = 'ehs-atp-done';

export function loadDone(key) {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || '{}')[key] || [];
  } catch {
    return [];
  }
}

export function saveDone(key, ids) {
  try {
    const all = JSON.parse(localStorage.getItem(DONE_KEY) || '{}');
    all[key] = ids;
    localStorage.setItem(DONE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable — completion just won't persist
  }
}
