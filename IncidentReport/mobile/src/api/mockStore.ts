import seed from '@/data/db.json';
import type {
  AgentSummary,
  HodSummary,
  Incident,
  IncidentCreate,
  IncidentOptions,
  IncidentRecord,
  IncidentStatus,
  IncidentSummary,
  Notification,
  Role,
  User,
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

interface SeedIncident extends Omit<Incident, 'agent'> {
  agentRef: 'agent' | 'other';
}

let incidents: Incident[] = (seed.incidents as SeedIncident[]).map(({ agentRef, ...i }) => ({
  ...i,
  agent: USERS[agentRef],
}));
let notifications = [...seed.notifications] as (Notification & {
  target_role: 'hod' | null;
  target_user_id: number | null;
})[];
let nextIncidentId = incidents.length + 1;
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

function toSummary(i: Incident): IncidentSummary {
  return {
    id: i.id,
    incident_no: i.incident_no,
    department: i.department,
    incident_type: i.incident_type,
    severity: i.severity,
    status: i.status,
    created_at: i.created_at,
  };
}

function toRecord(i: Incident): IncidentRecord {
  return { ...toSummary(i), agent: i.agent };
}

function monthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// ---------- Incidents ----------
export async function incidentOptions(): Promise<IncidentOptions> {
  return seed.incidentOptions as IncidentOptions;
}

export async function createIncident(payload: IncidentCreate): Promise<Incident> {
  const user = getCurrentUser();
  const now = new Date().toISOString();
  const incident: Incident = {
    id: nextIncidentId,
    incident_no: `INC-${new Date().getFullYear()}-${String(nextIncidentId).padStart(5, '0')}-DEMO`,
    agent: user,
    incident_date: payload.incident_date ?? now.slice(0, 10),
    incident_time: payload.incident_time ?? null,
    reported_by: payload.reported_by ?? user.name,
    department: payload.department ?? null,
    location: payload.location ?? null,
    description: payload.description ?? null,
    incident_type: payload.incident_type,
    severity: payload.severity,
    corrective_action: payload.corrective_action ?? null,
    root_cause: payload.root_cause ?? null,
    preventive_action: payload.preventive_action ?? null,
    photo_url: payload.photo_url ?? null,
    status: 'open',
    resolution_note: null,
    created_at: now,
    updated_at: now,
  };
  nextIncidentId += 1;
  incidents = [incident, ...incidents];
  notifications = [
    {
      id: nextNotificationId++,
      message: `New incident ${incident.incident_no} reported by ${user.name}`,
      incident_id: incident.id,
      is_read: false,
      created_at: now,
      target_role: 'hod',
      target_user_id: null,
    },
    ...notifications,
  ];
  return incident;
}

export async function myIncidents(): Promise<IncidentSummary[]> {
  const user = getCurrentUser();
  return incidents
    .filter((i) => i.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allIncidents(status?: string): Promise<IncidentRecord[]> {
  let list = incidents;
  if (status) list = list.filter((i) => i.status === status);
  return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getIncident(incidentId: number): Promise<Incident> {
  const i = incidents.find((x) => x.id === incidentId);
  if (!i) throw new Error('Incident not found');
  return i;
}

export async function updateStatus(
  incidentId: number,
  status: 'under_investigation' | 'closed',
  resolutionNote?: string,
): Promise<Incident> {
  const i = incidents.find((x) => x.id === incidentId);
  if (!i) throw new Error('Incident not found');
  const now = new Date().toISOString();
  i.status = status as IncidentStatus;
  i.resolution_note = resolutionNote ?? null;
  i.updated_at = now;
  notifications = [
    {
      id: nextNotificationId++,
      message: `${i.incident_no} was marked ${status.replace('_', ' ')} by HOD`,
      incident_id: i.id,
      is_read: false,
      created_at: now,
      target_role: null,
      target_user_id: i.agent.id,
    },
    ...notifications,
  ];
  return i;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const user = getCurrentUser();
  return notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(({ id, message, incident_id, is_read, created_at }) => ({ id, message, incident_id, is_read, created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const n = notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  return { id: n.id, message: n.message, incident_id: n.incident_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const user = getCurrentUser();
  const ms = monthStart();
  const mine = incidents.filter((i) => i.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((i) => i.status === 'open').length,
    under_investigation_count: mine.filter((i) => i.status === 'under_investigation').length,
    closed_this_month: mine.filter((i) => i.status === 'closed' && i.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const ms = monthStart();
  return {
    total_incidents: incidents.length,
    open_count: incidents.filter((i) => i.status === 'open').length,
    under_investigation_count: incidents.filter((i) => i.status === 'under_investigation').length,
    reported_this_month: incidents.filter((i) => i.created_at >= ms).length,
    closed_count: incidents.filter((i) => i.status === 'closed').length,
  };
}
