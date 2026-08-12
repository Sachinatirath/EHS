import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_USERS, USER_STORAGE_KEY } from './demoUsers';
import type {
  AgentSummary,
  HodSummary,
  Notification,
  User,
  Violation,
  ViolationCreate,
  ViolationOptions,
  ViolationRecord,
  ViolationStatus,
  ViolationSummary,
} from '@/types';

/**
 * Everything below runs entirely on-device (AsyncStorage-backed) — this
 * build has no reachable backend, so every screen reads/writes this local
 * store instead of calling a real API.
 */

const DB_KEY = 'safety_violation.mock_db';

const USERS: User[] = DEMO_USERS.map(({ password: _password, ...u }) => u);

const EHS_DEPARTMENTS = ['Manufacturing', 'Production', 'Maintenance', 'Warehouse', 'Quality', 'Logistics', 'Utilities', 'Administration'];
const VIOLATION_TYPES = [
  'PPE Violation',
  'Unsafe Act',
  'Unsafe Condition',
  'Procedure Violation',
  'Housekeeping Violation',
  'Speeding / Traffic Violation',
];
const OFFENCE_LEVELS = ['1st Offence', '2nd Offence', '3rd Offence', 'Final Warning'];
const CORRECTIVE_ACTIONS = ['Counselling', 'Written Reprimand', 'Suspension', 'Termination'];

export const VIOLATION_OPTIONS: ViolationOptions = {
  departments: EHS_DEPARTMENTS,
  violation_types: VIOLATION_TYPES,
  offence_levels: OFFENCE_LEVELS,
  corrective_actions: CORRECTIVE_ACTIONS,
};

interface StoredNotification {
  id: number;
  message: string;
  violation_id: number | null;
  is_read: boolean;
  created_at: string;
  target_role: 'hod' | null;
  target_user_id: number | null;
}

interface DbShape {
  violations: Violation[];
  notifications: StoredNotification[];
  nextViolationId: number;
  nextNotificationId: number;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildSeed(): DbShape {
  const agt001 = USERS.find((u) => u.employee_id === 'AGT001')!;
  const agt002 = USERS.find((u) => u.employee_id === 'AGT002')!;

  const violations: Violation[] = [];
  const notifications: StoredNotification[] = [];
  let violationId = 1;
  let notificationId = 1;

  function make(
    agent: User,
    department: string,
    violationType: string,
    offence: string,
    employeeName: string,
    employeeCode: string,
    description: string,
    status: ViolationStatus,
    daysBack: number,
    corrective: string[] = [],
    resolutionNote?: string,
  ) {
    const created = daysAgo(daysBack);
    const updated = status === 'open' ? created : daysAgo(Math.max(0, daysBack - 1));
    const violation: Violation = {
      id: violationId++,
      violation_no: `SVN-${new Date().getFullYear()}-${String(violationId).padStart(5, '0')}-DEMO`,
      agent,
      violation_date: created.slice(0, 10),
      company: 'Acme Manufacturing Pvt Ltd',
      department,
      supervisor: 'Shift Supervisor',
      employee_name: employeeName,
      employee_code: employeeCode,
      job_title: 'Line Operator',
      violation_type: violationType,
      offence,
      corrective_actions: corrective,
      description,
      explanation: null,
      photo_url: null,
      signature_data: null,
      status,
      resolution_note: resolutionNote ?? null,
      created_at: created,
      updated_at: updated,
    };
    violations.push(violation);
    notifications.push({
      id: notificationId++,
      message: `New safety violation ${violation.violation_no} filed by ${agent.name}`,
      violation_id: violation.id,
      is_read: false,
      created_at: created,
      target_role: 'hod',
      target_user_id: null,
    });
    if (status !== 'open') {
      notifications.push({
        id: notificationId++,
        message: `${violation.violation_no} was marked ${status.replace('_', ' ')} by HOD`,
        violation_id: violation.id,
        is_read: false,
        created_at: updated,
        target_role: null,
        target_user_id: agent.id,
      });
    }
  }

  make(agt001, 'Manufacturing', 'PPE Violation', '1st Offence', 'Ramesh Yadav', 'EMP-2201', 'Employee found operating lathe without safety goggles.', 'open', 4);
  make(agt001, 'Manufacturing', 'Unsafe Act', '2nd Offence', 'Ajay Patil', 'EMP-2214', 'Bypassed machine guard interlock to clear a jam.', 'under_review', 3, ['Counselling']);
  make(
    agt002,
    'Warehouse',
    'Housekeeping Violation',
    '1st Offence',
    'Deepak More',
    'EMP-3105',
    'Aisle blocked with pallets, obstructing fire exit route.',
    'closed',
    6,
    ['Written Reprimand'],
    'Aisle cleared same day; reprimand issued.',
  );
  make(
    agt002,
    'Warehouse',
    'Speeding / Traffic Violation',
    '3rd Offence',
    'Suresh Naik',
    'EMP-3120',
    'Forklift operated above yard speed limit near pedestrian crossing.',
    'rejected',
    5,
    [],
    'Insufficient evidence to substantiate speed claim.',
  );
  make(agt001, 'Quality', 'Unsafe Condition', '1st Offence', 'Meena Joshi', 'EMP-2250', 'Loose flooring tile near QC lab entrance identified as trip hazard.', 'open', 1);

  return { violations, notifications, nextViolationId: violationId, nextNotificationId: notificationId };
}

let dbPromise: Promise<DbShape> | null = null;

async function loadDb(): Promise<DbShape> {
  const raw = await AsyncStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DbShape;
    } catch {
      /* fall through to reseed */
    }
  }
  const seeded = buildSeed();
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(seeded));
  return seeded;
}

function getDb(): Promise<DbShape> {
  if (!dbPromise) dbPromise = loadDb();
  return dbPromise;
}

async function persist(db: DbShape) {
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
}

async function getCurrentUser(): Promise<User> {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) throw new Error('Not logged in');
  return JSON.parse(raw) as User;
}

function toSummary(v: Violation): ViolationSummary {
  return {
    id: v.id,
    violation_no: v.violation_no,
    department: v.department,
    violation_type: v.violation_type,
    offence: v.offence,
    status: v.status,
    employee_name: v.employee_name,
    created_at: v.created_at,
  };
}

function toRecord(v: Violation): ViolationRecord {
  return { ...toSummary(v), agent: v.agent };
}

function monthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// ---------- Violations ----------
export async function violationOptions(): Promise<ViolationOptions> {
  return VIOLATION_OPTIONS;
}

export async function createViolation(payload: ViolationCreate): Promise<Violation> {
  const db = await getDb();
  const user = await getCurrentUser();
  const now = new Date().toISOString();
  const violation: Violation = {
    id: db.nextViolationId,
    violation_no: `SVN-${new Date().getFullYear()}-${String(db.nextViolationId).padStart(5, '0')}-DEMO`,
    agent: user,
    violation_date: payload.violation_date ?? now.slice(0, 10),
    company: payload.company ?? null,
    department: payload.department,
    supervisor: payload.supervisor ?? null,
    employee_name: payload.employee_name ?? null,
    employee_code: payload.employee_code ?? null,
    job_title: payload.job_title ?? null,
    violation_type: payload.violation_type,
    offence: payload.offence,
    corrective_actions: payload.corrective_actions ?? [],
    description: payload.description ?? null,
    explanation: payload.explanation ?? null,
    photo_url: payload.photo_url ?? null,
    signature_data: payload.signature_data ?? null,
    status: 'open',
    resolution_note: null,
    created_at: now,
    updated_at: now,
  };
  db.nextViolationId += 1;
  db.violations.push(violation);
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `New safety violation ${violation.violation_no} filed by ${user.name}`,
    violation_id: violation.id,
    is_read: false,
    created_at: now,
    target_role: 'hod',
    target_user_id: null,
  });
  await persist(db);
  return violation;
}

export async function myViolations(): Promise<ViolationSummary[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.violations
    .filter((v) => v.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allViolations(status?: string): Promise<ViolationRecord[]> {
  const db = await getDb();
  let violations = [...db.violations];
  if (status) violations = violations.filter((v) => v.status === status);
  return violations.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getViolation(violationId: number): Promise<Violation> {
  const db = await getDb();
  const v = db.violations.find((x) => x.id === violationId);
  if (!v) throw new Error('Violation not found');
  return v;
}

export async function updateStatus(
  violationId: number,
  status: 'under_review' | 'closed' | 'rejected',
  resolutionNote?: string,
): Promise<Violation> {
  const db = await getDb();
  const v = db.violations.find((x) => x.id === violationId);
  if (!v) throw new Error('Violation not found');
  const now = new Date().toISOString();
  v.status = status;
  v.resolution_note = resolutionNote ?? null;
  v.updated_at = now;
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `${v.violation_no} was marked ${status.replace('_', ' ')} by HOD`,
    violation_id: v.id,
    is_read: false,
    created_at: now,
    target_role: null,
    target_user_id: v.agent.id,
  });
  await persist(db);
  return v;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((n) => ({ id: n.id, message: n.message, violation_id: n.violation_id, is_read: n.is_read, created_at: n.created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const db = await getDb();
  const n = db.notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  await persist(db);
  return { id: n.id, message: n.message, violation_id: n.violation_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const db = await getDb();
  const user = await getCurrentUser();
  const ms = monthStart();
  const mine = db.violations.filter((v) => v.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((v) => v.status === 'open').length,
    under_review_count: mine.filter((v) => v.status === 'under_review').length,
    closed_this_month: mine.filter((v) => v.status === 'closed' && v.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const db = await getDb();
  const ms = monthStart();
  const all = db.violations;
  return {
    total_violations: all.length,
    open_count: all.filter((v) => v.status === 'open').length,
    under_review_count: all.filter((v) => v.status === 'under_review').length,
    reported_this_month: all.filter((v) => v.created_at >= ms).length,
    rejected_count: all.filter((v) => v.status === 'rejected').length,
  };
}
