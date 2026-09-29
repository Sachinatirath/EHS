import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Gemba Walk observations (Safety Observation → Agent UI → Gemba Walk).
 * Kept in localStorage like the rest of the portal's demo data. Anything not
 * Closed whose target date & time has passed is auto-escalated to the Plant Head.
 */

export const GEMBA_AREAS = [
  'Production Shop 1',
  'Maintenance & Utility',
  'Warehouse & Stores',
  'Quality & QC Lab',
  'Packing & Dispatch',
  'Safety & EHS Office',
];

export const GEMBA_CATEGORIES = ['Unsafe Condition', 'Unsafe Act', 'Near Miss', 'Safe Practice'];
export const GEMBA_STATUSES = ['Open', 'In Progress', 'Closed'];

export const CATEGORY_META = {
  'Unsafe Condition': { pill: 'pill-red', color: '#dc2626' },
  'Unsafe Act': { pill: 'pill-amber', color: '#d97706' },
  'Near Miss': { pill: 'pill-orange', color: '#ea580c' },
  'Safe Practice': { pill: 'pill-green', color: '#16a34a' },
};

const STORAGE_KEY = 'ehs-gemba-records';

const pad = (n) => String(n).padStart(2, '0');
/** 'YYYY-MM-DDTHH:mm' in local time, `hours` from now (value format for datetime-local inputs). */
export function localDateTime(hours = 0) {
  const d = new Date(Date.now() + hours * 3600000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sampleData() {
  return [
    {
      id: 'GEM-2026-001', observerName: 'K. Rajesh', employeeId: 'EMP-4092', obsDate: '2026-08-24', obsTime: '10:30',
      area: 'Production Shop 1', location: 'Machine Line 3 - Hydraulic Press', category: 'Unsafe Condition',
      description: 'Severe hydraulic oil leak near main aisle causing major slip and fall risk.',
      correctiveAction: 'Clean spill immediately with absorbents and replace damaged seal ring.',
      assignedTo: 'Suresh Kumar (Maint. Lead)', targetDateTime: localDateTime(-18), status: 'Open',
    },
    {
      id: 'GEM-2026-002', observerName: 'M. Srinivas', employeeId: 'EMP-1184', obsDate: '2026-08-23', obsTime: '14:15',
      area: 'Maintenance & Utility', location: 'Substation 2 Panel Board B', category: 'Unsafe Act',
      description: 'Technician operating on live 415V electrical panel without ARC flash safety visor and insulated gloves.',
      correctiveAction: 'Stop work immediately and enforce complete Arc Flash PPE compliance.',
      assignedTo: 'V. Ramesh (Electrical Lead)', targetDateTime: localDateTime(-36), status: 'In Progress',
    },
    {
      id: 'GEM-2026-003', observerName: 'P. Kiran', employeeId: 'EMP-3329', obsDate: '2026-08-25', obsTime: '09:00',
      area: 'Warehouse & Stores', location: 'Bay B4 Pallet Stacking Area', category: 'Near Miss',
      description: 'Forklift operated at high speed reversed without sounding backup alarm, nearly colliding with a pedestrian.',
      correctiveAction: 'Repair reverse horn alarm and schedule operator safety retraining.',
      assignedTo: 'N. Mahesh (Warehouse Supervisor)', targetDateTime: localDateTime(24), status: 'In Progress',
    },
    {
      id: 'GEM-2026-004', observerName: 'D. Prasad', employeeId: 'EMP-5501', obsDate: '2026-08-25', obsTime: '11:45',
      area: 'Packing & Dispatch', location: 'Conveyor Line 2 Dock Area', category: 'Safe Practice',
      description: '100% compliance observed: Excellent 5S organization and complete wearing of cut-resistant gloves by all workers.',
      correctiveAction: 'Recognized team during daily safety toolbox talk.',
      assignedTo: 'Self / Packing Staff', targetDateTime: localDateTime(48), status: 'Closed',
    },
    {
      id: 'GEM-2026-005', observerName: 'B. Anand', employeeId: 'EMP-2210', obsDate: '2026-08-22', obsTime: '16:20',
      area: 'Quality & QC Lab', location: 'Chemical Storage Room 1', category: 'Unsafe Condition',
      description: 'Emergency eye wash station blocked by stacked empty chemical drums; low water pressure detected.',
      correctiveAction: 'Clear pathway immediately and overhaul emergency shower plumbing valve.',
      assignedTo: 'T. Venkatesh (EHS Specialist)', targetDateTime: localDateTime(-40), status: 'Open',
    },
  ];
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // fall through to sample data
  }
  return sampleData();
}

let records = load();
const listeners = new Set();

function commit(next) {
  records = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // storage unavailable — keep working in memory
  }
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Not closed and past its target date & time → escalated to the Plant Head. */
export function isEscalated(obs, now = Date.now()) {
  return obs.status !== 'Closed' && new Date(obs.targetDateTime).getTime() < now;
}

/** Live list of Gemba records plus a `now` that ticks, so escalations appear on their own. */
export function useGemba(tickMs = 1000) {
  const list = useSyncExternalStore(subscribe, () => records);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return { records: list, now };
}

function nextId() {
  const year = new Date().getFullYear();
  const max = Math.max(0, ...records.map((r) => Number(String(r.id).split('-').pop()) || 0));
  return `GEM-${year}-${String(max + 1).padStart(3, '0')}`;
}

export function addGemba(fields) {
  const required = ['observerName', 'employeeId', 'obsDate', 'obsTime', 'area', 'location', 'category', 'assignedTo', 'targetDateTime', 'status', 'description'];
  const missing = required.filter((k) => !String(fields[k] ?? '').trim());
  if (missing.length) throw new Error('Fill all mandatory fields marked *.');
  const obs = { ...fields, id: nextId(), created_at: new Date().toISOString() };
  commit([obs, ...records]);
  return obs;
}

export function updateGembaStatus(id, status, note) {
  commit(records.map((r) => (r.id === id
    ? { ...r, status, statusNote: note?.trim() || r.statusNote || null, updated_at: new Date().toISOString(), ...(status === 'Closed' ? { closed_at: new Date().toISOString() } : {}) }
    : r)));
}

export function resetGembaSample() {
  commit(sampleData());
}

export function formatTarget(dt) {
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

/** "2d 03:12:44" style duration for SLA countdowns. */
export function formatDuration(ms) {
  const total = Math.floor(Math.abs(ms) / 1000);
  const d = Math.floor(total / 86400);
  const hh = pad(Math.floor((total % 86400) / 3600));
  const mm = pad(Math.floor((total % 3600) / 60));
  const ss = pad(total % 60);
  return `${d ? `${d}d ` : ''}${hh}:${mm}:${ss}`;
}
