import { useSyncExternalStore } from 'react';
import seed from './db.json';
import { SHIFT_KEYS, buildShiftHods, currentShift, shiftLabel } from '../../data/shiftHods';

/**
 * This sub-app runs entirely on dummy JSON data (./db.json) — there is no
 * backend call anywhere here. Picking a page from either sidebar dropdown
 * just switches which fixed demo person's data is shown; there is no login
 * step and nothing here can fail with a network error.
 */

const USERS = { agent: seed.agentUser, other: seed.otherAgent };
const HOD_USER = seed.hodUser;

// Departments an observation can be raised against. Each has three HODs, one
// per shift (A, B, C). An observation is assigned to all three shift HODs of its
// department and any one of them can act on it. If none acts before the
// closing time it moves to the Manager profile.
export const SO_DEPARTMENTS = ['Mechanical', 'Electrical', 'Utility', 'Civil', 'Production', 'Safety', 'CI'];
export const MANAGER = 'Manager';
const MANAGER_NAME = 'Rajesh Malhotra';
// Profiles selectable from the HOD Profile page: each department (then a shift), then the Manager.
export const HOD_DEPARTMENTS = [...SO_DEPARTMENTS, MANAGER];

const slugOf = (name) => name.toLowerCase().replace(/[^a-z]+/g, '.');
// { [department]: { A, B, C } } plus the Manager under MANAGER.
let hodUsers = Object.fromEntries([
  ...Object.entries(buildShiftHods(SO_DEPARTMENTS, { base: HOD_USER, idBase: 100, codePrefix: 'HOD' })),
  [MANAGER, {
    ...HOD_USER,
    id: 199,
    employee_id: 'MGR001',
    name: MANAGER_NAME,
    department: MANAGER,
    email: `${slugOf(MANAGER_NAME)}@example.com`,
    address: 'Plant Manager Office, Plant Campus, Pune',
  }],
]);

/** The `shift` HOD of `dept` (or the Manager). Without a shift, the HOD on duty right now. */
export function hodForDepartment(dept, shift = currentShift()) {
  if (dept === MANAGER) return hodUsers[MANAGER];
  return hodUsers[dept]?.[shift] || null;
}

/** All three shift HODs of a department, in shift order. */
export function hodsForDepartment(dept) {
  return hodUsers[dept] && dept !== MANAGER ? SHIFT_KEYS.map((k) => hodUsers[dept][k]) : [];
}

export { SHIFT_KEYS, shiftLabel };

/** Who currently owns an observation: its department HOD, or the Manager once escalated. */
export function assigneeFor(o) {
  if (o.handler === 'manager') return { role: 'Manager', name: hodUsers[MANAGER].name };
  return { role: 'Shift HODs', name: hodsForDepartment(o.department).map((h) => `${h.name} (${h.shift})`).join(', ') };
}

let observations = seed.observations.map(({ agentRef, ...o }) => ({ ...o, agent: USERS[agentRef] }));
const DAY_MS = 24 * 3600 * 1000;
observations.forEach((o) => {
  if (o.status === 'open' && !o.hod_due_at) o.hod_due_at = new Date(Date.now() + DAY_MS).toISOString();
  if (!o.closing_at) o.closing_at = o.hod_due_at || o.due_at || null;
  if (o.status === 'under_review' && !o.due_at) {
    o.assigned_at = o.updated_at;
    o.due_at = new Date(Date.now() + DAY_MS).toISOString();
  }
});
let notifications = [...seed.notifications];
let nextObservationId = observations.length + 1;
let nextNotificationId = notifications.length + 1;

let agentUser = { ...USERS.agent };

// HOD profile = department + shift (defaults to whichever shift is on now).
let state = { role: null, hodDept: SO_DEPARTMENTS[0], hodShift: currentShift() };
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
  if (state.role !== 'hod') return agentUser;
  return state.hodDept === MANAGER ? hodUsers[MANAGER] : hodUsers[state.hodDept][state.hodShift];
}

export function useSafetyObservationAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return { user: snap.role ? currentUser() : null };
}

export function selectRole(role) {
  setState({ role });
}

export function selectHodDepartment(dept, shift = state.hodShift) {
  setState({ hodDept: dept, hodShift: shift });
}

export function logout() {
  setState({ role: null });
}

/** SLA: once the HOD reassigns an observation the agent has until `due_at` to
 * close it; after that it is escalated back to the HOD, who closes it. Runs
 * before every API call and from the pages' polling. Returns true if any
 * observation changed. */
export function checkSla() {
  const now = Date.now();
  let changed = false;
  observations.forEach((o) => {
    if (o.status === 'open' && o.handler !== 'manager' && o.hod_due_at && Date.parse(o.hod_due_at) <= now) {
      const at = new Date().toISOString();
      o.status = 'escalated_manager';
      o.handler = 'manager';
      o.hod_escalated_at = at;
      o.updated_at = at;
      notifications = [
        {
          id: nextNotificationId++,
          message: `${o.observation_no} was not acted on by the ${o.department} HOD by the closing time and has moved to the Manager`,
          observation_id: o.id,
          is_read: false,
          created_at: at,
          target_role: 'hod',
          target_user_id: null,
        },
        {
          id: nextNotificationId++,
          message: `${o.observation_no} was not reviewed by the ${o.department} HOD by the closing time and has moved to the Manager`,
          observation_id: o.id,
          is_read: false,
          created_at: at,
          target_role: null,
          target_user_id: o.agent.id,
        },
        ...notifications,
      ];
      changed = true;
      return;
    }
    if (o.status !== 'under_review' || !o.due_at || Date.parse(o.due_at) > now) return;
    const at = new Date().toISOString();
    o.status = 'escalated';
    o.escalated_at = at;
    o.updated_at = at;
    notifications = [
      {
        id: nextNotificationId++,
        message: `SLA missed: ${o.observation_no} was not closed by ${o.agent.name} in time and is escalated to you (${o.handler === 'manager' ? 'Manager' : 'HOD'})`,
        observation_id: o.id,
        is_read: false,
        created_at: at,
        target_role: 'hod',
        target_user_id: null,
      },
      {
        id: nextNotificationId++,
        message: `SLA missed: ${o.observation_no} has been escalated to the ${o.handler === 'manager' ? 'Manager' : 'HOD'}`,
        observation_id: o.id,
        is_read: false,
        created_at: at,
        target_role: null,
        target_user_id: o.agent.id,
      },
      ...notifications,
    ];
    changed = true;
  });
  return changed;
}

const inHodScope = (o) => (state.hodDept === MANAGER
  ? o.handler === 'manager'
  : o.handler !== 'manager' && o.department === state.hodDept);

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Lists carry the full record so they can be searched and exported without extra lookups.
function toSummary(o) {
  return { ...o };
}

function toRecord(o) {
  return { ...toSummary(o), agent: o.agent };
}

const ROUTES = [
  {
    method: 'GET',
    pattern: /^\/observations\/options$/,
    handler: () => seed.observationOptions,
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/my-summary$/,
    handler: () => {
      const user = currentUser();
      const ms = monthStart();
      const mine = observations.filter((o) => o.agent.id === user.id);
      return {
        total_created: mine.length,
        open_count: mine.filter((o) => o.status === 'open').length,
        under_review_count: mine.filter((o) => o.status === 'under_review').length,
        closed_this_month: mine.filter((o) => o.status === 'closed' && o.updated_at >= ms).length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/summary$/,
    handler: () => {
      const ms = monthStart();
      const scoped = observations.filter(inHodScope);
      return {
        total_observations: scoped.length,
        open_count: scoped.filter((o) => o.status === 'open').length,
        under_review_count: scoped.filter((o) => o.status === 'under_review').length,
        escalated_count: scoped.filter((o) => o.status === 'escalated').length,
        escalated_manager_count: scoped.filter((o) => o.status === 'escalated_manager').length,
        reported_this_month: scoped.filter((o) => o.created_at >= ms).length,
        closed_count: scoped.filter((o) => o.status === 'closed').length,
        rejected_count: scoped.filter((o) => o.status === 'rejected').length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/observations\/mine$/,
    handler: () => {
      const user = currentUser();
      return observations
        .filter((o) => o.agent.id === user.id)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map(toSummary);
    },
  },
  {
    method: 'GET',
    pattern: /^\/observations(?:\?.*)?$/,
    handler: (_m, search) => {
      const status = new URLSearchParams(search).get('status');
      let list = observations.filter(inHodScope);
      if (status) list = list.filter((o) => o.status === status);
      return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
    },
  },
  {
    method: 'POST',
    pattern: /^\/observations$/,
    handler: (_m, _s, body) => {
      const user = currentUser();
      const now = new Date().toISOString();
      // Closing time chosen at creation drives the countdown; fall back to 24h.
      const closingMs = Date.parse(body.closing_at);
      const closingAt = new Date(Number.isFinite(closingMs) && closingMs > Date.now() ? closingMs : Date.now() + DAY_MS).toISOString();
      const observation = {
        id: nextObservationId,
        observation_no: `SOB-${new Date().getFullYear()}-${String(nextObservationId).padStart(5, '0')}-DEMO`,
        agent: user,
        observer_name: body.observer_name ?? user.name,
        observer_employee_code: body.observer_employee_code ?? user.employee_id,
        department: body.department ?? null,
        department_head: body.department_head ?? (hodsForDepartment(body.department).map((h) => h.name).join(', ') || null),
        observation_date: body.observation_date ?? now.slice(0, 10),
        plant: body.plant ?? null,
        area: body.area ?? null,
        location: body.location ?? null,
        observation_time: body.observation_time ?? null,
        category: body.category,
        description: body.description ?? null,
        severity: body.severity,
        corrective_action: body.corrective_action ?? null,
        photo_url: body.photo_url ?? null,
        status: 'open',
        handler: 'hod',
        closing_at: closingAt,
        hod_due_at: closingAt,
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
    },
  },
  {
    method: 'GET',
    pattern: /^\/observations\/(\d+)$/,
    handler: (m) => {
      const observation = observations.find((o) => o.id === Number(m[1]));
      if (!observation) throw new Error('Observation not found');
      return observation;
    },
  },
  {
    method: 'POST',
    pattern: /^\/observations\/(\d+)\/close$/,
    handler: (m, _s, body) => {
      const observation = observations.find((o) => o.id === Number(m[1]));
      if (!observation) throw new Error('Observation not found');
      if (observation.agent.id !== currentUser().id) throw new Error('Only the assigned agent can close this observation.');
      if (observation.status === 'escalated') throw new Error('The SLA expired, so this observation was escalated to the HOD/Manager.');
      if (observation.status !== 'under_review') throw new Error('This observation has not been reassigned to you yet.');
      const now = new Date().toISOString();
      observation.status = 'closed';
      observation.closure_note = body.closure_note ?? null;
      observation.closed_at = now;
      observation.updated_at = now;
      notifications = [
        {
          id: nextNotificationId++,
          message: `${observation.observation_no} was closed by ${observation.agent.name}`,
          observation_id: observation.id,
          is_read: false,
          created_at: now,
          target_role: 'hod',
          target_user_id: null,
        },
        ...notifications,
      ];
      return observation;
    },
  },
  {
    method: 'POST',
    pattern: /^\/observations\/(\d+)\/status$/,
    handler: (m, _s, body) => {
      const observation = observations.find((o) => o.id === Number(m[1]));
      if (!observation) throw new Error('Observation not found');
      if (!inHodScope(observation)) throw new Error(observation.handler === 'manager' ? 'This observation has moved to the Manager.' : `This observation belongs to the ${observation.department} HOD.`);
      const actor = state.hodDept === MANAGER ? 'Manager' : `${shiftLabel(state.hodShift)} (${currentUser().name})`;
      const actedBy = { name: currentUser().name, role: state.hodDept === MANAGER ? 'Manager' : shiftLabel(state.hodShift) };
      const now = new Date().toISOString();

      if (body.status === 'closed') {
        if (observation.status !== 'escalated') throw new Error('Only an observation escalated after a missed SLA can be closed by the HOD/Manager.');
        if (!body.closure_photo_url) throw new Error('Attach a rectification image before closing this observation.');
        observation.status = 'closed';
        observation.closure_note = body.resolution_note ?? null;
        observation.closure_photo_url = body.closure_photo_url;
        observation.closed_by = state.hodDept === MANAGER ? 'manager' : 'hod';
        observation.closed_by_user = actedBy;
        observation.closed_at = now;
        observation.updated_at = now;
        notifications = [
          {
            id: nextNotificationId++,
            message: `${observation.observation_no} was closed by the ${actor} after the SLA was missed`,
            observation_id: observation.id,
            is_read: false,
            created_at: now,
            target_role: null,
            target_user_id: observation.agent.id,
          },
          ...notifications,
        ];
        return observation;
      }

      if (observation.status !== 'open' && observation.status !== 'escalated_manager') throw new Error('This observation has already been reviewed.');
      if (body.status === 'under_review') {
        const due = Date.parse(body.due_at);
        if (!due || due <= Date.now()) throw new Error('Pick a due time in the future for the agent to close it by.');
        if (!body.review_photo_url) throw new Error('Attach a photo before reassigning this observation.');
        observation.due_at = new Date(due).toISOString();
        observation.assigned_at = now;
        observation.review_photo_url = body.review_photo_url;
      }
      observation.status = body.status;
      observation.resolution_note = body.resolution_note ?? null;
      observation.reviewed_at = now;
      observation.reviewed_by_role = state.hodDept === MANAGER ? 'manager' : 'hod';
      observation.reviewed_by_user = actedBy;
      observation.updated_at = now;
      notifications = [
        {
          id: nextNotificationId++,
          message: body.status === 'under_review'
            ? `${observation.observation_no} was reviewed by the ${actor} and reassigned to you — close it before ${new Date(observation.due_at).toLocaleString()}`
            : `${observation.observation_no} was marked ${body.status.replace('_', ' ')} by the ${actor}`,
          observation_id: observation.id,
          is_read: false,
          created_at: now,
          target_role: null,
          target_user_id: observation.agent.id,
        },
        ...notifications,
      ];
      return observation;
    },
  },
  {
    method: 'GET',
    pattern: /^\/notifications$/,
    handler: () => {
      const user = currentUser();
      return notifications
        .filter((n) => {
          if (n.target_user_id === user.id) return true;
          if (n.target_role !== user.role) return false;
          if (user.role !== 'hod') return true;
          const o = observations.find((x) => x.id === n.observation_id);
          return !o || inHodScope(o);
        })
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
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
        const { hodDept: dept, hodShift: shift } = state;
        if (dept === MANAGER) {
          hodUsers = { ...hodUsers, [MANAGER]: { ...hodUsers[MANAGER], ...body, department: MANAGER } };
        } else {
          hodUsers = { ...hodUsers, [dept]: { ...hodUsers[dept], [shift]: { ...hodUsers[dept][shift], ...body, department: dept } } };
        }
        setState({});
        return currentUser();
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
        checkSla();
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
  return observations;
}
