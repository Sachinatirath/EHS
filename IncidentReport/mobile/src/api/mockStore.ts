import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_USERS, USER_STORAGE_KEY } from './demoUsers';
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
  User,
} from '@/types';

/**
 * Everything below runs entirely on-device (AsyncStorage-backed) — this
 * build has no reachable backend, so every screen reads/writes this local
 * store instead of calling a real API.
 */

const DB_KEY = 'incident_report.mock_db';

const USERS: User[] = DEMO_USERS.map(({ password: _password, ...u }) => u);

const EHS_DEPARTMENTS = ['Manufacturing', 'Production', 'Maintenance', 'Warehouse', 'Quality', 'Logistics', 'Utilities', 'Administration'];
const INCIDENT_TYPES = ['Near Miss', 'First Aid', 'Medical Treatment', 'Lost Time Injury', 'Fatality', 'Property Damage', 'Environmental'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const INCIDENT_OPTIONS: IncidentOptions = {
  departments: EHS_DEPARTMENTS,
  incident_types: INCIDENT_TYPES,
  severity_levels: SEVERITY_LEVELS,
};

interface StoredNotification {
  id: number;
  message: string;
  incident_id: number | null;
  is_read: boolean;
  created_at: string;
  target_role: 'hod' | null;
  target_user_id: number | null;
}

interface DbShape {
  incidents: Incident[];
  notifications: StoredNotification[];
  nextIncidentId: number;
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

  const incidents: Incident[] = [];
  const notifications: StoredNotification[] = [];
  let incidentId = 1;
  let notificationId = 1;

  function make(
    agent: User,
    department: string,
    incidentType: string,
    severity: string,
    location: string,
    description: string,
    status: IncidentStatus,
    daysBack: number,
    correctiveAction?: string,
    rootCause?: string,
    preventiveAction?: string,
    resolutionNote?: string,
  ) {
    const created = daysAgo(daysBack);
    const updated = status === 'open' ? created : daysAgo(Math.max(0, daysBack - 1));
    const incident: Incident = {
      id: incidentId++,
      incident_no: `INC-${new Date().getFullYear()}-${String(incidentId).padStart(5, '0')}-DEMO`,
      agent,
      incident_date: created.slice(0, 10),
      incident_time: '10:30',
      reported_by: agent.name,
      department,
      location,
      description,
      incident_type: incidentType,
      severity,
      corrective_action: correctiveAction ?? null,
      root_cause: rootCause ?? null,
      preventive_action: preventiveAction ?? null,
      photo_url: null,
      status,
      resolution_note: resolutionNote ?? null,
      created_at: created,
      updated_at: updated,
    };
    incidents.push(incident);
    notifications.push({
      id: notificationId++,
      message: `New incident ${incident.incident_no} reported by ${agent.name}`,
      incident_id: incident.id,
      is_read: false,
      created_at: created,
      target_role: 'hod',
      target_user_id: null,
    });
    if (status !== 'open') {
      notifications.push({
        id: notificationId++,
        message: `${incident.incident_no} was marked ${status.replace('_', ' ')} by HOD`,
        incident_id: incident.id,
        is_read: false,
        created_at: updated,
        target_role: null,
        target_user_id: agent.id,
      });
    }
  }

  make(agt001, 'Manufacturing', 'First Aid', 'Low', 'Press Line 2', 'Operator sustained minor cut while clearing a jam.', 'open', 4);
  make(
    agt001,
    'Manufacturing',
    'Near Miss',
    'Medium',
    'Zone B walkway',
    'Suspended load swung close to a walkway during a lift.',
    'under_investigation',
    3,
    'Area cordoned off, crane operator briefed.',
  );
  make(
    agt002,
    'Warehouse',
    'Lost Time Injury',
    'High',
    'Loading Dock 3',
    'Forklift operator strained back lifting a pallet manually.',
    'closed',
    7,
    undefined,
    'Pallet jack unavailable at time of lift.',
    'Additional pallet jacks procured; manual lifting SOP reissued.',
    'Verified corrective actions implemented; case closed.',
  );
  make(
    agt002,
    'Warehouse',
    'Property Damage',
    'Medium',
    'Racking Aisle 4',
    'Forklift clipped a rack upright, causing minor structural damage.',
    'under_investigation',
    2,
    'Aisle taped off pending structural inspection.',
  );
  make(agt001, 'Utilities', 'Environmental', 'Critical', 'Chemical Storage Yard', 'Minor solvent leak detected from a storage drum.', 'open', 1);

  return { incidents, notifications, nextIncidentId: incidentId, nextNotificationId: notificationId };
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

function toSummary(i: Incident): IncidentSummary {
  return { id: i.id, incident_no: i.incident_no, department: i.department, incident_type: i.incident_type, severity: i.severity, status: i.status, created_at: i.created_at };
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
  return INCIDENT_OPTIONS;
}

export async function createIncident(payload: IncidentCreate): Promise<Incident> {
  const db = await getDb();
  const user = await getCurrentUser();
  const now = new Date().toISOString();
  const incident: Incident = {
    id: db.nextIncidentId,
    incident_no: `INC-${new Date().getFullYear()}-${String(db.nextIncidentId).padStart(5, '0')}-DEMO`,
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
  db.nextIncidentId += 1;
  db.incidents.push(incident);
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `New incident ${incident.incident_no} reported by ${user.name}`,
    incident_id: incident.id,
    is_read: false,
    created_at: now,
    target_role: 'hod',
    target_user_id: null,
  });
  await persist(db);
  return incident;
}

export async function myIncidents(): Promise<IncidentSummary[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.incidents
    .filter((i) => i.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allIncidents(status?: string): Promise<IncidentRecord[]> {
  const db = await getDb();
  let incidents = [...db.incidents];
  if (status) incidents = incidents.filter((i) => i.status === status);
  return incidents.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getIncident(incidentId: number): Promise<Incident> {
  const db = await getDb();
  const i = db.incidents.find((x) => x.id === incidentId);
  if (!i) throw new Error('Incident not found');
  return i;
}

export async function updateStatus(incidentId: number, status: 'under_investigation' | 'closed', resolutionNote?: string): Promise<Incident> {
  const db = await getDb();
  const i = db.incidents.find((x) => x.id === incidentId);
  if (!i) throw new Error('Incident not found');
  const now = new Date().toISOString();
  i.status = status;
  i.resolution_note = resolutionNote ?? null;
  i.updated_at = now;
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `${i.incident_no} was marked ${status.replace('_', ' ')} by HOD`,
    incident_id: i.id,
    is_read: false,
    created_at: now,
    target_role: null,
    target_user_id: i.agent.id,
  });
  await persist(db);
  return i;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((n) => ({ id: n.id, message: n.message, incident_id: n.incident_id, is_read: n.is_read, created_at: n.created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const db = await getDb();
  const n = db.notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  await persist(db);
  return { id: n.id, message: n.message, incident_id: n.incident_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const db = await getDb();
  const user = await getCurrentUser();
  const ms = monthStart();
  const mine = db.incidents.filter((i) => i.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((i) => i.status === 'open').length,
    under_investigation_count: mine.filter((i) => i.status === 'under_investigation').length,
    closed_this_month: mine.filter((i) => i.status === 'closed' && i.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const db = await getDb();
  const ms = monthStart();
  const all = db.incidents;
  return {
    total_incidents: all.length,
    open_count: all.filter((i) => i.status === 'open').length,
    under_investigation_count: all.filter((i) => i.status === 'under_investigation').length,
    reported_this_month: all.filter((i) => i.created_at >= ms).length,
    closed_count: all.filter((i) => i.status === 'closed').length,
  };
}
