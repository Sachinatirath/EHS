import { useSyncExternalStore } from 'react';
import seed from './db.json';

/**
 * This sub-app runs entirely on dummy JSON data (./db.json) — there is no
 * backend call anywhere here. Picking a page from either sidebar dropdown
 * just switches which fixed demo person's data is shown; there is no login
 * step and nothing here can fail with a network error.
 */

const USERS = { agent: seed.agentUser, other: seed.otherAgent };
const HOD_USER = seed.hodUser;

let incidents = seed.incidents.map(({ agentRef, ...i }) => ({ ...i, agent: USERS[agentRef] }));
let notifications = [...seed.notifications];
let nextIncidentId = incidents.length + 1;
let nextNotificationId = notifications.length + 1;

let agentUser = { ...USERS.agent };
let hodUser = { ...HOD_USER };

let state = { role: null };
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function currentUser() {
  return state.role === 'hod' ? hodUser : agentUser;
}

export function useIncidentReportAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return { user: snap.role ? currentUser() : null };
}

// Every incident is routed to this single HOD, whoever files it.
export function assignedHod() {
  return hodUser;
}

export function selectRole(role) {
  setState({ role });
}

export function logout() {
  setState({ role: null });
}

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Lists carry the full record so they can be searched and exported without extra lookups.
function toSummary(i) {
  return { ...i };
}

function toRecord(i) {
  return { ...toSummary(i), agent: i.agent };
}

const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

const ROUTES = [
  {
    method: 'GET',
    pattern: /^\/incidents\/options$/,
    handler: () => seed.incidentOptions,
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/my-summary$/,
    handler: () => {
      const user = currentUser();
      const ms = monthStart();
      const mine = incidents.filter((i) => i.agent.id === user.id);
      return {
        total_created: mine.length,
        open_count: mine.filter((i) => i.status === 'open').length,
        under_investigation_count: mine.filter((i) => i.status === 'under_investigation').length,
        closed_this_month: mine.filter((i) => i.status === 'closed' && i.updated_at >= ms).length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/summary$/,
    handler: () => {
      const ms = monthStart();
      return {
        total_incidents: incidents.length,
        open_count: incidents.filter((i) => i.status === 'open').length,
        under_investigation_count: incidents.filter((i) => i.status === 'under_investigation').length,
        reported_this_month: incidents.filter((i) => i.created_at >= ms).length,
        closed_count: incidents.filter((i) => i.status === 'closed').length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/incidents\/mine$/,
    handler: () => {
      const user = currentUser();
      return incidents.filter((i) => i.agent.id === user.id).sort(byNewest).map(toSummary);
    },
  },
  {
    method: 'GET',
    pattern: /^\/incidents(?:\?.*)?$/,
    handler: (_m, search) => {
      const status = new URLSearchParams(search).get('status');
      let list = incidents;
      if (status) list = list.filter((i) => i.status === status);
      return [...list].sort(byNewest).map(toRecord);
    },
  },
  {
    method: 'GET',
    pattern: /^\/incidents\/(\d+)$/,
    handler: (m) => {
      const incident = incidents.find((i) => i.id === Number(m[1]));
      if (!incident) throw new Error('Incident not found');
      return incident;
    },
  },
  {
    method: 'POST',
    pattern: /^\/incidents$/,
    handler: (_m, _s, body) => {
      const user = currentUser();
      const now = new Date().toISOString();
      const incident = {
        id: nextIncidentId,
        incident_no: `INC-${new Date().getFullYear()}-${String(nextIncidentId).padStart(5, '0')}-DEMO`,
        agent: user,
        incident_date: body.incident_date ?? now.slice(0, 10),
        incident_time: body.incident_time ?? null,
        reported_by: body.reported_by ?? user.name,
        department: body.department ?? null,
        location: body.location ?? null,
        description: body.description ?? null,
        incident_type: body.incident_type,
        severity: body.severity,
        corrective_action: body.corrective_action ?? null,
        root_cause: body.root_cause ?? null,
        preventive_action: body.preventive_action ?? null,
        photo_url: body.photo_url ?? null,
        employee_signature_data: body.employee_signature_data ?? null,
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
    },
  },
  {
    method: 'POST',
    pattern: /^\/incidents\/(\d+)\/status$/,
    handler: (m, _s, body) => {
      const incident = incidents.find((i) => i.id === Number(m[1]));
      if (!incident) throw new Error('Incident not found');
      const now = new Date().toISOString();
      incident.status = body.status;
      incident.resolution_note = body.resolution_note ?? null;
      if (!incident.reviewed_at) incident.reviewed_at = now;
      if (body.status === 'closed') incident.closed_at = now;
      incident.updated_at = now;
      notifications = [
        {
          id: nextNotificationId++,
          message: `${incident.incident_no} was marked ${body.status.replace('_', ' ')} by HOD`,
          incident_id: incident.id,
          is_read: false,
          created_at: now,
          target_role: null,
          target_user_id: incident.agent.id,
        },
        ...notifications,
      ];
      return incident;
    },
  },
  {
    method: 'GET',
    pattern: /^\/notifications$/,
    handler: () => {
      const user = currentUser();
      return notifications
        .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
        .sort(byNewest);
    },
  },
  {
    method: 'POST',
    pattern: /^\/notifications\/(\d+)\/read$/,
    handler: (m) => {
      const n = notifications.find((x) => x.id === Number(m[1]));
      if (!n) throw new Error('Notification not found');
      n.is_read = true;
      return n;
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/auth\/me$/,
    handler: (_m, _s, body) => {
      if (state.role === 'hod') {
        hodUser = { ...hodUser, ...body };
        return hodUser;
      }
      agentUser = { ...agentUser, ...body };
      return agentUser;
    },
  },
];

export function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [pathname, search] = path.split('?');
  const fullPath = search ? `${pathname}?${search}` : pathname;
  const route = ROUTES.find((r) => r.method === method && r.pattern.test(fullPath));
  if (!route) return Promise.reject(new Error(`No mock handler for ${method} ${path}`));

  const match = fullPath.match(route.pattern);
  const body = options.body ? JSON.parse(options.body) : undefined;

  // A small artificial delay so skeleton loaders are visible instead of a flash.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(route.handler(match, search, body));
      } catch (err) {
        reject(err);
      }
    }, 250);
  });
}

/* ----- read-only access for the portal's My Tasks page ----- */

export const AGENTS = Object.values(USERS);

/** View this module as `agentId` (one of AGENTS). */
export function selectAgent(agentId) {
  const u = AGENTS.find((a) => a.id === agentId);
  if (u && u.id !== agentUser.id) agentUser = { ...u };
  setState({ role: 'agent' });
}

export function tasksSnapshot() {
  return incidents;
}
