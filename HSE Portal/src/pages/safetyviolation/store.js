import { useSyncExternalStore } from 'react';
import seed from './db.json';
import { EHS_DEPARTMENTS } from '../../data/formOptions';

/**
 * This sub-app runs entirely on dummy JSON data (./db.json) — there is no
 * backend call anywhere here. Picking a page from either sidebar dropdown
 * just switches which fixed demo person's data is shown; there is no login
 * step and nothing here can fail with a network error.
 */

const USERS = { agent: seed.agentUser, other: seed.otherAgent };
const HOD_USER = seed.hodUser;

// One dummy HOD per department; a violation is only ever visible to (and
// actionable by) the HOD of the department it was filed against.
const HOD_NAMES = ['Manoj Kulkarni', 'Suresh Patil', 'Anil Deshmukh', 'Rekha Joshi', 'Neha Kapoor', 'Vivek Menon', 'Farhan Sheikh', 'Meera Iyer'];
export const HOD_DEPARTMENTS = EHS_DEPARTMENTS;
let hodUsers = Object.fromEntries(
  EHS_DEPARTMENTS.map((dept, i) => {
    const name = HOD_NAMES[i % HOD_NAMES.length];
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
    return [dept, {
      ...HOD_USER,
      id: 100 + i,
      employee_id: `HOD${String(i + 1).padStart(3, '0')}`,
      name,
      department: dept,
      email: `${slug}@example.com`,
      address: `${dept} HOD Office, Plant Campus, Pune`,
    }];
  }),
);

export function hodForDepartment(dept) {
  return hodUsers[dept] || null;
}

let violations = seed.violations.map(({ agentRef, ...v }) => ({ ...v, agent: USERS[agentRef] }));
let notifications = [...seed.notifications];
let nextViolationId = violations.length + 1;
let nextNotificationId = notifications.length + 1;

let agentUser = { ...USERS.agent };

let state = { role: null, hodDept: EHS_DEPARTMENTS[0] };
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
  return state.role === 'hod' ? hodUsers[state.hodDept] : agentUser;
}

export function useSafetyViolationAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return { user: snap.role ? currentUser() : null };
}

export function selectRole(role) {
  setState({ role });
}

export function selectHodDepartment(dept) {
  setState({ hodDept: dept });
}

export function logout() {
  setState({ role: null });
}

const inHodScope = (v) => v.department === state.hodDept;

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function toSummary(v) {
  return {
    id: v.id,
    violation_no: v.violation_no,
    department: v.department,
    violation_type: v.violation_type,
    offence: v.offence,
    status: v.status,
    employee_name: v.employee_name,
    employee_code: v.employee_code ?? null,
    photo_url: v.photo_url ?? null,
    created_at: v.created_at,
  };
}

function toRecord(v) {
  return { ...toSummary(v), agent: v.agent };
}

const ROUTES = [
  {
    method: 'GET',
    pattern: /^\/dashboard\/my-summary$/,
    handler: () => {
      const user = currentUser();
      const ms = monthStart();
      const mine = violations.filter((v) => v.agent.id === user.id);
      return {
        total_created: mine.length,
        open_count: mine.filter((v) => v.status === 'open').length,
        under_review_count: mine.filter((v) => v.status === 'under_review').length,
        closed_this_month: mine.filter((v) => v.status === 'closed' && v.updated_at >= ms).length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/summary$/,
    handler: () => {
      const ms = monthStart();
      const scoped = violations.filter(inHodScope);
      return {
        total_violations: scoped.length,
        open_count: scoped.filter((v) => v.status === 'open').length,
        under_review_count: scoped.filter((v) => v.status === 'under_review').length,
        reported_this_month: scoped.filter((v) => v.created_at >= ms).length,
        rejected_count: scoped.filter((v) => v.status === 'rejected').length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/violations\/mine$/,
    handler: () => {
      const user = currentUser();
      return violations
        .filter((v) => v.agent.id === user.id)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map(toSummary);
    },
  },
  {
    method: 'GET',
    pattern: /^\/violations(?:\?.*)?$/,
    handler: (_m, search) => {
      const status = new URLSearchParams(search).get('status');
      let list = violations.filter(inHodScope);
      if (status) list = list.filter((v) => v.status === status);
      return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRecord);
    },
  },
  {
    method: 'POST',
    pattern: /^\/violations$/,
    handler: (_m, _s, body) => {
      const user = currentUser();
      const now = new Date().toISOString();
      const violation = {
        id: nextViolationId,
        violation_no: `SVN-${new Date().getFullYear()}-${String(nextViolationId).padStart(5, '0')}-DEMO`,
        agent: user,
        violation_date: body.violation_date ?? now.slice(0, 10),
        company: body.company ?? null,
        department: body.department,
        supervisor: body.supervisor ?? null,
        employee_name: body.employee_name ?? null,
        employee_code: body.employee_code ?? null,
        job_title: body.job_title ?? null,
        violation_type: body.violation_type,
        offence: body.offence,
        corrective_actions: body.corrective_actions ?? [],
        description: body.description ?? null,
        explanation: body.explanation ?? null,
        photo_url: body.photo_url ?? null,
        signature_data: body.signature_data ?? null,
        employee_signature_data: body.employee_signature_data ?? null,
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
    },
  },
  {
    method: 'GET',
    pattern: /^\/violations\/(\d+)$/,
    handler: (m) => {
      const violation = violations.find((v) => v.id === Number(m[1]));
      if (!violation) throw new Error('Violation not found');
      return violation;
    },
  },
  {
    method: 'POST',
    pattern: /^\/violations\/(\d+)\/close$/,
    handler: (m, _s, body) => {
      const violation = violations.find((v) => v.id === Number(m[1]));
      if (!violation) throw new Error('Violation not found');
      if (violation.agent.id !== currentUser().id) throw new Error('Only the assigned agent can close this violation.');
      if (violation.status !== 'under_review') throw new Error('This violation has not been reassigned to you yet.');
      const now = new Date().toISOString();
      violation.status = 'closed';
      violation.closure_note = body.closure_note ?? null;
      violation.closed_at = now;
      violation.updated_at = now;
      notifications = [
        {
          id: nextNotificationId++,
          message: `${violation.violation_no} was closed by ${violation.agent.name}`,
          violation_id: violation.id,
          is_read: false,
          created_at: now,
          target_role: 'hod',
          target_user_id: null,
        },
        ...notifications,
      ];
      return violation;
    },
  },
  {
    method: 'POST',
    pattern: /^\/violations\/(\d+)\/status$/,
    handler: (m, _s, body) => {
      const violation = violations.find((v) => v.id === Number(m[1]));
      if (!violation) throw new Error('Violation not found');
      if (!inHodScope(violation)) throw new Error(`This violation belongs to the ${violation.department} HOD.`);
      const now = new Date().toISOString();
      violation.status = body.status;
      violation.resolution_note = body.resolution_note ?? null;
      violation.reviewed_at = now;
      violation.updated_at = now;
      notifications = [
        {
          id: nextNotificationId++,
          message: body.status === 'under_review'
            ? `${violation.violation_no} was reviewed by HOD and reassigned to you — please close it`
            : `${violation.violation_no} was marked ${body.status.replace('_', ' ')} by HOD`,
          violation_id: violation.id,
          is_read: false,
          created_at: now,
          target_role: null,
          target_user_id: violation.agent.id,
        },
        ...notifications,
      ];
      return violation;
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
          const v = violations.find((x) => x.id === n.violation_id);
          return !v || inHodScope(v);
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
        hodUsers = { ...hodUsers, [state.hodDept]: { ...hodUsers[state.hodDept], ...body, department: state.hodDept } };
        return hodUsers[state.hodDept];
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
  return violations;
}
