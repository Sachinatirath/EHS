import { useSyncExternalStore } from 'react';
import seed from './db.json';

/**
 * This sub-app runs entirely on dummy JSON data (./db.json) — there is no
 * backend call anywhere here. Picking a page from either sidebar dropdown
 * just switches which fixed demo person's data is shown; there is no login
 * step and nothing here can fail with a network error.
 */

const clone = (value) => JSON.parse(JSON.stringify(value));

const AREA_INCHARGE = seed.areaInchargeUser;
const OTHER_AREA_INCHARGE = seed.otherAreaIncharge;
const OHC_USER = seed.ohcUser;
const usersById = new Map([AREA_INCHARGE, OTHER_AREA_INCHARGE, OHC_USER].map((u) => [u.id, u]));

let boxes = clone(seed.boxes);
let inspections = clone(seed.inspections).map(({ inspectorRef, ...i }) => ({
  ...i,
  inspector_id: inspectorRef === 'areaIncharge' ? AREA_INCHARGE.id : OTHER_AREA_INCHARGE.id,
}));
let refills = clone(seed.refills);
let notifications = clone(seed.notifications);

let nextBoxId = boxes.length + 1;
let nextInspectionId = inspections.length + 1;
let nextItemId = Math.max(0, ...inspections.flatMap((i) => i.items.map((it) => it.id))) + 1;
let nextRefillId = refills.length + 1;
let nextRefillItemId = Math.max(0, ...refills.flatMap((r) => r.refill_items.map((ri) => ri.id))) + 1;
let nextNotificationId = notifications.length + 1;

let areaInchargeUser = { ...AREA_INCHARGE };
let ohcUser = { ...OHC_USER };

// Keep the dummy data for the length of the browser tab so a page refresh (or a
// hot reload during development) never leaves the UI pointing at a refill that
// silently vanished from the in-memory store.
const STORAGE_KEY = 'fastaid-demo-data-v1';
try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  if (saved) {
    ({ boxes, inspections, refills, notifications, nextBoxId, nextInspectionId, nextItemId, nextRefillId, nextRefillItemId, nextNotificationId, areaInchargeUser, ohcUser } = saved);
  }
} catch {
  /* storage unavailable or corrupt — fall back to the seed data */
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      boxes, inspections, refills, notifications, nextBoxId, nextInspectionId, nextItemId, nextRefillId, nextRefillItemId, nextNotificationId, areaInchargeUser, ohcUser,
    }));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

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
  return state.role === 'ohc' ? ohcUser : areaInchargeUser;
}

export function useFastAidAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return { user: snap.role ? currentUser() : null };
}

export function selectRole(role) {
  setState({ role });
}

export function logout() {
  setState({ role: null });
}

// A one-shot "open this record" hand-off between pages (e.g. clicking a
// notification or a dashboard row should land on that record's detail view).
const pendingTargets = new Map();
export function setPendingTarget(view, id) {
  pendingTargets.set(view, id);
}
export function peekPendingTarget(view) {
  return pendingTargets.get(view) ?? null;
}
export function clearPendingTarget(view) {
  pendingTargets.delete(view);
}

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function resolveUser(id) {
  return usersById.get(id) ?? { id, employee_id: '?', name: 'Unknown', role: 'area_incharge', department: null, phone: null, email: null, address: null };
}

const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

function refillBrief(inspectionId) {
  const r = refills.find((rf) => rf.inspection_id === inspectionId);
  return r ? { id: r.id, request_code: r.request_code, status: r.status } : null;
}

function toInspection(i) {
  return {
    id: i.id,
    box: boxes.find((b) => b.id === i.box_id),
    inspector: resolveUser(i.inspector_id),
    created_at: i.created_at,
    outcome: i.outcome,
    items: i.items.map((it) => ({ ...it })),
    refill_request: refillBrief(i.id),
    signature_data: i.signature_data,
  };
}

function toInspectionSummary(i) {
  return { id: i.id, box: boxes.find((b) => b.id === i.box_id), created_at: i.created_at, outcome: i.outcome, refill_request: refillBrief(i.id) };
}

function toInspectionRecord(i) {
  return { ...toInspectionSummary(i), inspector: resolveUser(i.inspector_id), refill_request: refillBrief(i.id) };
}

function toRefillRequest(r) {
  const inspection = inspections.find((i) => i.id === r.inspection_id);
  return {
    id: r.id,
    request_code: r.request_code,
    status: r.status,
    rejection_reason: r.rejection_reason,
    created_at: r.created_at,
    updated_at: r.updated_at,
    inspection: toInspection(inspection),
    refill_items: r.refill_items.map((ri) => ({
      id: ri.id,
      inspection_item: { ...inspection.items.find((it) => it.id === ri.inspection_item_id) },
      replacement_note: ri.replacement_note,
      photo_url: ri.photo_url,
    })),
  };
}

function toRefillSummary(r) {
  const inspection = inspections.find((i) => i.id === r.inspection_id);
  const flagged = inspection.items.filter((it) => it.status !== 'ok');
  return {
    id: r.id,
    request_code: r.request_code,
    status: r.status,
    created_at: r.created_at,
    box: boxes.find((b) => b.id === inspection.box_id),
    flagged_item_count: flagged.length,
    flagged_items: flagged.map((f) => f.item_name),
  };
}

function pushNotification(n) {
  notifications = [{ id: nextNotificationId++, is_read: false, ...n }, ...notifications];
}

const ROUTES = [
  // ---------- Dashboard ----------
  {
    method: 'GET',
    pattern: /^\/dashboard\/my-summary$/,
    handler: () => {
      const user = currentUser();
      const ms = monthStart();
      const mine = inspections.filter((i) => i.inspector_id === user.id);
      const pending = refills.filter((r) => {
        const insp = inspections.find((i) => i.id === r.inspection_id);
        return insp?.inspector_id === user.id && (r.status === 'pending' || r.status === 'awaiting_verification');
      });
      return {
        boxes_assigned: boxes.length,
        inspected_this_month: mine.filter((i) => i.created_at >= ms).length,
        pending_actions: pending.length,
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/ohc-summary$/,
    handler: () => {
      const ms = monthStart();
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      let overdue = 0;
      boxes.forEach((box) => {
        const last = inspections.filter((i) => i.box_id === box.id).sort(byNewest)[0];
        if (!last || last.created_at < cutoff) overdue += 1;
      });
      return {
        total_boxes: boxes.length,
        pending_refill_requests: refills.filter((r) => r.status === 'pending' || r.status === 'awaiting_verification').length,
        inspections_this_month: inspections.filter((i) => i.created_at >= ms).length,
        overdue_boxes: overdue,
      };
    },
  },

  // ---------- Boxes ----------
  {
    method: 'GET',
    pattern: /^\/boxes(?:\?.*)?$/,
    handler: (_m, search) => {
      const params = new URLSearchParams(search);
      let list = [...boxes];
      if (params.get('department')) list = list.filter((b) => b.department === params.get('department'));
      if (params.get('search')) {
        const q = params.get('search').toLowerCase();
        list = list.filter((b) => b.box_number.toLowerCase().includes(q));
      }
      return list.sort((a, b) => a.box_number.localeCompare(b.box_number));
    },
  },
  {
    method: 'GET',
    pattern: /^\/boxes\/(\d+)$/,
    handler: (m) => {
      const box = boxes.find((b) => b.id === Number(m[1]));
      if (!box) throw new Error('Box not found');
      const last = inspections.filter((i) => i.box_id === box.id).sort(byNewest)[0];
      return { ...box, last_inspection_at: last ? last.created_at : null, last_inspection_outcome: last ? last.outcome : null };
    },
  },
  {
    method: 'GET',
    pattern: /^\/boxes\/(\d+)\/inspections$/,
    handler: (m) => {
      const box = boxes.find((b) => b.id === Number(m[1]));
      if (!box) throw new Error('Box not found');
      return inspections.filter((i) => i.box_id === box.id).sort(byNewest).map(toInspectionRecord);
    },
  },
  {
    method: 'POST',
    pattern: /^\/boxes$/,
    handler: (_m, _s, body) => {
      const box_number = body.box_number.trim();
      if (boxes.some((b) => b.box_number === box_number)) throw new Error(`Box ${box_number} already exists`);
      const box = {
        id: nextBoxId++,
        box_number,
        department: body.department.trim(),
        area: body.area.trim(),
        location: body.location.trim(),
      };
      boxes = [...boxes, box];
      return box;
    },
  },

  // ---------- Inspections ----------
  {
    method: 'POST',
    pattern: /^\/inspections$/,
    handler: (_m, _s, body) => {
      const box = boxes.find((b) => b.id === body.box_id);
      if (!box) throw new Error('Box not found');
      const user = currentUser();
      const hasFlagged = body.items.some((i) => i.status !== 'ok');
      const created = new Date().toISOString();
      const inspection = {
        id: nextInspectionId++,
        box_id: box.id,
        inspector_id: user.id,
        created_at: created,
        outcome: hasFlagged ? 'refill_requested' : 'ok',
        signature_data: body.signature_data ?? null,
        items: body.items.map((i) => ({
          id: nextItemId++,
          item_name: i.item_name,
          status: i.status,
          note: i.note ?? null,
          photo_url: i.photo_url ?? null,
        })),
      };
      inspections = [inspection, ...inspections];
      if (hasFlagged) {
        const refill = {
          id: nextRefillId,
          inspection_id: inspection.id,
          request_code: `RFQ-${String(nextRefillId).padStart(4, '0')}-DEMO`,
          status: 'pending',
          rejection_reason: null,
          created_at: created,
          updated_at: created,
          refill_items: [],
        };
        nextRefillId += 1;
        refills = [refill, ...refills];
        pushNotification({
          message: `New refill request ${refill.request_code} for box ${box.box_number}`,
          refill_request_id: refill.id,
          created_at: created,
          target_role: 'ohc',
          target_user_id: null,
        });
      }
      return toInspection(inspection);
    },
  },
  {
    method: 'GET',
    pattern: /^\/inspections\/mine$/,
    handler: () => {
      const user = currentUser();
      return inspections.filter((i) => i.inspector_id === user.id).sort(byNewest).map(toInspectionSummary);
    },
  },
  {
    method: 'GET',
    pattern: /^\/inspections$/,
    handler: () => [...inspections].sort(byNewest).map(toInspectionRecord),
  },
  {
    method: 'GET',
    pattern: /^\/inspections\/(\d+)$/,
    handler: (m) => {
      const inspection = inspections.find((i) => i.id === Number(m[1]));
      if (!inspection) throw new Error('Inspection not found');
      return toInspection(inspection);
    },
  },

  // ---------- Refills ----------
  {
    method: 'GET',
    pattern: /^\/refills(?:\?.*)?$/,
    handler: (_m, search) => {
      const status = new URLSearchParams(search).get('status');
      let list = [...refills];
      if (status) list = list.filter((r) => r.status === status);
      return list.sort(byNewest).map(toRefillSummary);
    },
  },
  {
    method: 'GET',
    pattern: /^\/refills\/(\d+)$/,
    handler: (m) => {
      const refill = refills.find((r) => r.id === Number(m[1]));
      if (!refill) throw new Error('Refill request not found');
      return toRefillRequest(refill);
    },
  },
  {
    method: 'POST',
    pattern: /^\/refills\/(\d+)\/submit$/,
    handler: (m, _s, body) => {
      const refill = refills.find((r) => r.id === Number(m[1]));
      if (!refill) throw new Error('Refill request not found');
      if (refill.status !== 'pending' && refill.status !== 'rejected') {
        throw new Error(`Cannot submit refill in status '${refill.status}'`);
      }
      const inspection = inspections.find((i) => i.id === refill.inspection_id);
      const box = boxes.find((b) => b.id === inspection.box_id);
      refill.refill_items = body.items.map((it) => ({
        id: nextRefillItemId++,
        inspection_item_id: it.inspection_item_id,
        replacement_note: it.replacement_note ?? null,
        photo_url: it.photo_url ?? null,
      }));
      refill.status = 'awaiting_verification';
      refill.rejection_reason = null;
      refill.updated_at = new Date().toISOString();
      pushNotification({
        message: `OHC has completed refill for box ${box.box_number} (${refill.request_code}). Please re-verify.`,
        refill_request_id: refill.id,
        created_at: refill.updated_at,
        target_role: null,
        target_user_id: inspection.inspector_id,
      });
      return toRefillRequest(refill);
    },
  },
  {
    method: 'POST',
    pattern: /^\/refills\/(\d+)\/verify$/,
    handler: (m, _s, body) => {
      const refill = refills.find((r) => r.id === Number(m[1]));
      if (!refill) throw new Error('Refill request not found');
      if (refill.status !== 'awaiting_verification') {
        throw new Error(`Cannot verify refill in status '${refill.status}'`);
      }
      const inspection = inspections.find((i) => i.id === refill.inspection_id);
      const box = boxes.find((b) => b.id === inspection.box_id);
      const now = new Date().toISOString();
      if (body.decision === 'accept') {
        refill.status = 'closed';
        inspection.outcome = 'closed_ok';
        pushNotification({
          message: `${refill.request_code} for box ${box.box_number} was accepted and closed.`,
          refill_request_id: refill.id,
          created_at: now,
          target_role: 'ohc',
          target_user_id: null,
        });
      } else {
        refill.status = 'rejected';
        refill.rejection_reason = body.reason ?? null;
        pushNotification({
          message: `${refill.request_code} for box ${box.box_number} was rejected: ${body.reason || 'no reason given'}`,
          refill_request_id: refill.id,
          created_at: now,
          target_role: 'ohc',
          target_user_id: null,
        });
      }
      refill.updated_at = now;
      return toRefillRequest(refill);
    },
  },

  // ---------- Notifications ----------
  {
    method: 'GET',
    pattern: /^\/notifications$/,
    handler: () => {
      const user = currentUser();
      return notifications
        .filter((n) => n.target_user_id === user.id || n.target_role === user.role)
        .sort(byNewest)
        .map(({ id, message, refill_request_id, is_read, created_at }) => ({ id, message, refill_request_id, is_read, created_at }));
    },
  },
  {
    method: 'POST',
    pattern: /^\/notifications\/(\d+)\/read$/,
    handler: (m) => {
      const n = notifications.find((x) => x.id === Number(m[1]));
      if (!n) throw new Error('Notification not found');
      n.is_read = true;
      return { id: n.id, message: n.message, refill_request_id: n.refill_request_id, is_read: n.is_read, created_at: n.created_at };
    },
  },

  // ---------- Profile ----------
  {
    method: 'PATCH',
    pattern: /^\/auth\/me$/,
    handler: (_m, _s, body) => {
      if (state.role === 'ohc') {
        ohcUser = { ...ohcUser, ...body };
        setState({});
        return ohcUser;
      }
      areaInchargeUser = { ...areaInchargeUser, ...body };
      setState({});
      return areaInchargeUser;
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
        const result = route.handler(match, search, body);
        if (method !== 'GET') persist();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, 250);
  });
}

/* ----- read-only access for the portal's My Tasks page ----- */

export function tasksSnapshot() {
  return {
    refills,
    boxFor: (inspectionId) => {
      const insp = inspections.find((i) => i.id === inspectionId);
      return { inspector: insp ? usersById.get(insp.inspector_id) : null, box: insp ? boxes.find((b) => b.id === insp.box_id) : null };
    },
    ohc: ohcUser,
  };
}
