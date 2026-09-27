import seed from '@/data/db.json';
import type {
  AgentSummary,
  HodSummary,
  Notification,
  Role,
  User,
  Violation,
  ViolationCreate,
  ViolationOptions,
  ViolationRecord,
  ViolationStatus,
  ViolationSummary,
} from '@/types';

/**
 * Everything here runs entirely on dummy JSON data (src/data/db.json) — this
 * build never calls the FastAPI backend. Picking a page from either sidebar
 * dropdown just switches which fixed demo person's data is shown; there is
 * no login step and nothing here can fail with a network error.
 */

const USERS: Record<'agent' | 'other', User> = {
  agent: seed.agentUser as User,
  other: seed.otherAgent as User,
};
const HOD_USER = seed.hodUser as User;

interface SeedViolation extends Omit<Violation, 'agent'> {
  agentRef: 'agent' | 'other';
}

let violations: Violation[] = (seed.violations as SeedViolation[]).map(({ agentRef, ...v }) => ({
  ...v,
  agent: USERS[agentRef],
}));
let notifications = [...seed.notifications] as (Notification & {
  target_role: 'hod' | null;
  target_user_id: number | null;
})[];
let nextViolationId = violations.length + 1;
let nextNotificationId = notifications.length + 1;

let currentRole: Role | null = null;
let agentUser: User = { ...USERS.agent };
let hodUser: User = { ...HOD_USER };

export function setCurrentRole(role: Role | null) {
  currentRole = role;
}

export function getCurrentUser(): User {
  if (!currentRole) throw new Error('No role selected');
  return currentRole === 'hod' ? hodUser : agentUser;
}

export function updateCurrentUser(patch: Partial<User>): User {
  if (currentRole === 'hod') {
    hodUser = { ...hodUser, ...patch };
    return hodUser;
  }
  agentUser = { ...agentUser, ...patch };
  return agentUser;
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
  return seed.violationOptions as ViolationOptions;
}

export async function createViolation(payload: ViolationCreate): Promise<Violation> {
  const user = getCurrentUser();
  const now = new Date().toISOString();
  const violation: Violation = {
    id: nextViolationId,
    violation_no: `SVN-${new Date().getFullYear()}-${String(nextViolationId).padStart(5, '0')}-DEMO`,
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
  nextViolationId += 1;
  violations = [violation, ...violations];
  notifications = [
    {
      id: nextNotificationId++,
      message: `New safety violation ${violation.violation_no} filed by ${user.name}`,
      violation_id: violation.id,
      is_read: false,
      created_at: now,
      target_role: 'hod',
      target_user_id: null,
    },
    ...notifications,
  ];
  return violation;
}

export async function myViolations(): Promise<ViolationSummary[]> {
  const user = getCurrentUser();
  return violations
    .filter((v) => v.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allViolations(status?: string): Promise<ViolationRecord[]> {
  let list = violations;
  if (status) list = list.filter((v) => v.status === status);
  return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getViolation(violationId: number): Promise<Violation> {
  const v = violations.find((x) => x.id === violationId);
  if (!v) throw new Error('Violation not found');
  return v;
}

export async function updateStatus(
  violationId: number,
  status: 'under_review' | 'closed' | 'rejected',
  resolutionNote?: string,
): Promise<Violation> {
  const v = violations.find((x) => x.id === violationId);
  if (!v) throw new Error('Violation not found');
  const now = new Date().toISOString();
  v.status = status;
  v.resolution_note = resolutionNote ?? null;
  v.updated_at = now;
  notifications = [
    {
      id: nextNotificationId++,
      message: `${v.violation_no} was marked ${status.replace('_', ' ')} by HOD`,
      violation_id: v.id,
      is_read: false,
      created_at: now,
      target_role: null,
      target_user_id: v.agent.id,
    },
    ...notifications,
  ];
  return v;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const user = getCurrentUser();
  return notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(({ id, message, violation_id, is_read, created_at }) => ({ id, message, violation_id, is_read, created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const n = notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  return { id: n.id, message: n.message, violation_id: n.violation_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const user = getCurrentUser();
  const ms = monthStart();
  const mine = violations.filter((v) => v.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((v) => v.status === 'open').length,
    under_review_count: mine.filter((v) => v.status === 'under_review').length,
    closed_this_month: mine.filter((v) => v.status === 'closed' && v.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const ms = monthStart();
  return {
    total_violations: violations.length,
    open_count: violations.filter((v) => v.status === 'open').length,
    under_review_count: violations.filter((v) => v.status === 'under_review').length,
    reported_this_month: violations.filter((v) => v.created_at >= ms).length,
    rejected_count: violations.filter((v) => v.status === 'rejected').length,
  };
}
