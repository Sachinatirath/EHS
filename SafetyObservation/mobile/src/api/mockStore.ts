import seed from '@/data/db.json';
import type {
  AgentSummary,
  HodSummary,
  Notification,
  Observation,
  ObservationCreate,
  ObservationOptions,
  ObservationRecord,
  ObservationSummary,
  Role,
  User,
} from '@/types';

/**
 * Everything here runs entirely on dummy JSON data (src/data/db.json) — this
 * build never calls a backend. Picking a page from either top-panel dropdown
 * just switches which fixed demo person's data is shown; there is no login
 * step and nothing here can fail with a network error.
 */

const USERS: Record<'agent' | 'other', User> = {
  agent: seed.agentUser as User,
  other: seed.otherAgent as User,
};
const HOD_USER = seed.hodUser as User;

interface SeedObservation extends Omit<Observation, 'agent'> {
  agentRef: 'agent' | 'other';
}

let observations: Observation[] = (seed.observations as SeedObservation[]).map(({ agentRef, ...o }) => ({
  ...o,
  agent: USERS[agentRef],
}));
let notifications = [...seed.notifications] as (Notification & {
  target_role: 'hod' | null;
  target_user_id: number | null;
})[];
let nextObservationId = observations.length + 1;
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

function toSummary(o: Observation): ObservationSummary {
  return {
    id: o.id,
    observation_no: o.observation_no,
    department: o.department,
    category: o.category,
    severity: o.severity,
    status: o.status,
    created_at: o.created_at,
  };
}

function toRecord(o: Observation): ObservationRecord {
  return { ...toSummary(o), agent: o.agent };
}

function monthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// ---------- Observations ----------
export async function observationOptions(): Promise<ObservationOptions> {
  return seed.observationOptions as ObservationOptions;
}

export async function createObservation(payload: ObservationCreate): Promise<Observation> {
  const user = getCurrentUser();
  const now = new Date().toISOString();
  const observation: Observation = {
    id: nextObservationId,
    observation_no: `SOB-${new Date().getFullYear()}-${String(nextObservationId).padStart(5, '0')}-DEMO`,
    agent: user,
    observer_name: payload.observer_name ?? user.name,
    observer_employee_code: payload.observer_employee_code ?? user.employee_id,
    department: payload.department ?? null,
    observation_date: payload.observation_date ?? now.slice(0, 10),
    plant: payload.plant ?? null,
    area: payload.area ?? null,
    location: payload.location ?? null,
    observation_time: payload.observation_time ?? null,
    category: payload.category,
    description: payload.description ?? null,
    severity: payload.severity,
    corrective_action: payload.corrective_action ?? null,
    photo_url: payload.photo_url ?? null,
    status: 'open',
    resolution_note: null,
    created_at: now,
    updated_at: now,
  };
  nextObservationId += 1;
  observations = [observation, ...observations];
  notifications = [
    {
      id: nextNotificationId++,
      message: `New safety observation ${observation.observation_no} filed by ${user.name}`,
      observation_id: observation.id,
      is_read: false,
      created_at: now,
      target_role: 'hod',
      target_user_id: null,
    },
    ...notifications,
  ];
  return observation;
}

export async function myObservations(): Promise<ObservationSummary[]> {
  const user = getCurrentUser();
  return observations
    .filter((o) => o.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allObservations(status?: string): Promise<ObservationRecord[]> {
  let list = observations;
  if (status) list = list.filter((o) => o.status === status);
  return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getObservation(observationId: number): Promise<Observation> {
  const o = observations.find((x) => x.id === observationId);
  if (!o) throw new Error('Observation not found');
  return o;
}

export async function updateStatus(
  observationId: number,
  status: 'under_review' | 'closed',
  resolutionNote?: string,
): Promise<Observation> {
  const o = observations.find((x) => x.id === observationId);
  if (!o) throw new Error('Observation not found');
  const now = new Date().toISOString();
  o.status = status;
  o.resolution_note = resolutionNote ?? null;
  o.updated_at = now;
  notifications = [
    {
      id: nextNotificationId++,
      message: `${o.observation_no} was marked ${status.replace('_', ' ')} by HOD`,
      observation_id: o.id,
      is_read: false,
      created_at: now,
      target_role: null,
      target_user_id: o.agent.id,
    },
    ...notifications,
  ];
  return o;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const user = getCurrentUser();
  return notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(({ id, message, observation_id, is_read, created_at }) => ({ id, message, observation_id, is_read, created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const n = notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  return { id: n.id, message: n.message, observation_id: n.observation_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const user = getCurrentUser();
  const ms = monthStart();
  const mine = observations.filter((o) => o.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((o) => o.status === 'open').length,
    under_review_count: mine.filter((o) => o.status === 'under_review').length,
    closed_this_month: mine.filter((o) => o.status === 'closed' && o.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const ms = monthStart();
  return {
    total_observations: observations.length,
    open_count: observations.filter((o) => o.status === 'open').length,
    under_review_count: observations.filter((o) => o.status === 'under_review').length,
    reported_this_month: observations.filter((o) => o.created_at >= ms).length,
    closed_count: observations.filter((o) => o.status === 'closed').length,
  };
}
