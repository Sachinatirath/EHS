import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_USERS, USER_STORAGE_KEY } from './demoUsers';
import type {
  AgentSummary,
  HodSummary,
  Notification,
  Observation,
  ObservationCreate,
  ObservationOptions,
  ObservationRecord,
  ObservationStatus,
  ObservationSummary,
  User,
} from '@/types';

/**
 * Everything below runs entirely on-device (AsyncStorage-backed) — this
 * build has no reachable backend, so every screen reads/writes this local
 * store instead of calling a real API.
 */

const DB_KEY = 'safety_observation.mock_db';

const USERS: User[] = DEMO_USERS.map(({ password: _password, ...u }) => u);

const OBSERVATION_CATEGORIES = ['Unsafe Act', 'Unsafe Condition', 'Near Miss', 'Good Practice', 'Housekeeping', 'PPE Non-Compliance', 'Other'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const OBSERVATION_OPTIONS: ObservationOptions = {
  categories: OBSERVATION_CATEGORIES,
  severity_levels: SEVERITY_LEVELS,
};

interface StoredNotification {
  id: number;
  message: string;
  observation_id: number | null;
  is_read: boolean;
  created_at: string;
  target_role: 'hod' | null;
  target_user_id: number | null;
}

interface DbShape {
  observations: Observation[];
  notifications: StoredNotification[];
  nextObservationId: number;
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

  const observations: Observation[] = [];
  const notifications: StoredNotification[] = [];
  let observationId = 1;
  let notificationId = 1;

  function make(
    agent: User,
    department: string,
    category: string,
    severity: string,
    description: string,
    status: ObservationStatus,
    daysBack: number,
    correctiveAction?: string,
    resolutionNote?: string,
  ) {
    const created = daysAgo(daysBack);
    const updated = status === 'open' ? created : daysAgo(Math.max(0, daysBack - 1));
    const observation: Observation = {
      id: observationId++,
      observation_no: `SOB-${new Date().getFullYear()}-${String(observationId).padStart(5, '0')}-DEMO`,
      agent,
      observer_name: agent.name,
      observer_employee_code: agent.employee_id,
      department,
      observation_date: created.slice(0, 10),
      plant: 'Main Plant',
      area: department,
      location: 'Shop Floor',
      observation_time: '10:30',
      category,
      description,
      severity,
      corrective_action: correctiveAction ?? null,
      photo_url: null,
      status,
      resolution_note: resolutionNote ?? null,
      created_at: created,
      updated_at: updated,
    };
    observations.push(observation);
    notifications.push({
      id: notificationId++,
      message: `New safety observation ${observation.observation_no} filed by ${agent.name}`,
      observation_id: observation.id,
      is_read: false,
      created_at: created,
      target_role: 'hod',
      target_user_id: null,
    });
    if (status !== 'open') {
      notifications.push({
        id: notificationId++,
        message: `${observation.observation_no} was marked ${status.replace('_', ' ')} by HOD`,
        observation_id: observation.id,
        is_read: false,
        created_at: updated,
        target_role: null,
        target_user_id: agent.id,
      });
    }
  }

  make(agt001, 'Manufacturing', 'PPE Non-Compliance', 'Medium', 'Operator seen without ear protection near press machine.', 'open', 4);
  make(
    agt001,
    'Manufacturing',
    'Unsafe Condition',
    'High',
    'Oil spill near walkway not cordoned off.',
    'under_review',
    3,
    'Area barricaded, cleanup crew notified.',
  );
  make(
    agt002,
    'Warehouse',
    'Housekeeping',
    'Low',
    'Empty pallets stacked too close to fire extinguisher access.',
    'closed',
    6,
    'Pallets relocated.',
    'Verified clear on follow-up walk.',
  );
  make(agt002, 'Warehouse', 'Near Miss', 'Critical', 'Forklift nearly collided with pedestrian at blind corner.', 'under_review', 2, 'Convex mirror requested for corner.');
  make(
    agt001,
    'Quality',
    'Good Practice',
    'Low',
    'QC technician proactively flagged mislabeled batch before dispatch.',
    'closed',
    1,
    undefined,
    'Acknowledged; shared as best practice in toolbox talk.',
  );

  return { observations, notifications, nextObservationId: observationId, nextNotificationId: notificationId };
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

function toSummary(o: Observation): ObservationSummary {
  return { id: o.id, observation_no: o.observation_no, department: o.department, category: o.category, severity: o.severity, status: o.status, created_at: o.created_at };
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
  return OBSERVATION_OPTIONS;
}

export async function createObservation(payload: ObservationCreate): Promise<Observation> {
  const db = await getDb();
  const user = await getCurrentUser();
  const now = new Date().toISOString();
  const observation: Observation = {
    id: db.nextObservationId,
    observation_no: `SOB-${new Date().getFullYear()}-${String(db.nextObservationId).padStart(5, '0')}-DEMO`,
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
  db.nextObservationId += 1;
  db.observations.push(observation);
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `New safety observation ${observation.observation_no} filed by ${user.name}`,
    observation_id: observation.id,
    is_read: false,
    created_at: now,
    target_role: 'hod',
    target_user_id: null,
  });
  await persist(db);
  return observation;
}

export async function myObservations(): Promise<ObservationSummary[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.observations
    .filter((o) => o.agent.id === user.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(toSummary);
}

export async function allObservations(status?: string): Promise<ObservationRecord[]> {
  const db = await getDb();
  let observations = [...db.observations];
  if (status) observations = observations.filter((o) => o.status === status);
  return observations.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
}

export async function getObservation(observationId: number): Promise<Observation> {
  const db = await getDb();
  const o = db.observations.find((x) => x.id === observationId);
  if (!o) throw new Error('Observation not found');
  return o;
}

export async function updateStatus(observationId: number, status: 'under_review' | 'closed', resolutionNote?: string): Promise<Observation> {
  const db = await getDb();
  const o = db.observations.find((x) => x.id === observationId);
  if (!o) throw new Error('Observation not found');
  const now = new Date().toISOString();
  o.status = status;
  o.resolution_note = resolutionNote ?? null;
  o.updated_at = now;
  db.notifications.push({
    id: db.nextNotificationId++,
    message: `${o.observation_no} was marked ${status.replace('_', ' ')} by HOD`,
    observation_id: o.id,
    is_read: false,
    created_at: now,
    target_role: null,
    target_user_id: o.agent.id,
  });
  await persist(db);
  return o;
}

// ---------- Notifications ----------
export async function listNotifications(): Promise<Notification[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  return db.notifications
    .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((n) => ({ id: n.id, message: n.message, observation_id: n.observation_id, is_read: n.is_read, created_at: n.created_at }));
}

export async function markNotificationRead(notificationId: number): Promise<Notification> {
  const db = await getDb();
  const n = db.notifications.find((x) => x.id === notificationId);
  if (!n) throw new Error('Notification not found');
  n.is_read = true;
  await persist(db);
  return { id: n.id, message: n.message, observation_id: n.observation_id, is_read: n.is_read, created_at: n.created_at };
}

// ---------- Dashboard ----------
export async function myDashboardSummary(): Promise<AgentSummary> {
  const db = await getDb();
  const user = await getCurrentUser();
  const ms = monthStart();
  const mine = db.observations.filter((o) => o.agent.id === user.id);
  return {
    total_created: mine.length,
    open_count: mine.filter((o) => o.status === 'open').length,
    under_review_count: mine.filter((o) => o.status === 'under_review').length,
    closed_this_month: mine.filter((o) => o.status === 'closed' && o.updated_at >= ms).length,
  };
}

export async function hodDashboardSummary(): Promise<HodSummary> {
  const db = await getDb();
  const ms = monthStart();
  const all = db.observations;
  return {
    total_observations: all.length,
    open_count: all.filter((o) => o.status === 'open').length,
    under_review_count: all.filter((o) => o.status === 'under_review').length,
    reported_this_month: all.filter((o) => o.created_at >= ms).length,
    closed_count: all.filter((o) => o.status === 'closed').length,
  };
}
