// Collects every pending task across the portal's modules, per person, for
// the My Tasks page. Each task knows how to open itself: it switches the
// module to the assignee's profile and focuses the record in its list.

import { setFocusTarget } from './focusTarget';
import * as so from '../pages/safetyobservation/store';
import * as sv from '../pages/safetyviolation/store';
import * as ir from '../pages/incidentreport/store';
import * as ma from '../pages/machineaudit/store';
import * as fa from '../pages/fastaid/store';
import * as ss from '../pages/shiftschedule/store';
import {
  SHIFTS, dateKey, planDate, tasksForShift, loadDone,
} from '../data/auditPlan';

export const MODULES = {
  observation: 'Safety Observation',
  violation: 'Safety Violation',
  incident: 'Incident Report',
  machine: 'Machine Audit',
  fastaid: 'FastAid',
  shift: 'Shift Schedule',
  plan: "Today's Audit & Training Plan",
};

const pill = (label, cls) => ({ label, pill: cls });

function observationTasks() {
  const out = [];
  so.tasksSnapshot().forEach((o) => {
    const base = { module: 'observation', ref: o.observation_no, title: `${o.category} — ${o.description || o.location || ''}`, created_at: o.created_at, department: o.department };
    const toHods = (status, due, action) => so.hodsForDepartment(o.department).forEach((h) => out.push({
      ...base, key: `so-${o.id}-${h.shift}`, assignee: h.name, role: `Shift ${h.shift} HOD · ${o.department}`, status, due_at: due, action,
      go: () => { so.selectRole('hod'); so.selectHodDepartment(o.department, h.shift); setFocusTarget('so-hod-observations', o.id); return { app: 'safetyobservation', view: 'so-hod-observations' }; },
    }));
    const toManager = (status, action) => {
      const m = so.hodForDepartment(so.MANAGER);
      out.push({
        ...base, key: `so-${o.id}-mgr`, assignee: m.name, role: 'Manager', status, action,
        go: () => { so.selectRole('hod'); so.selectHodDepartment(so.MANAGER); setFocusTarget('so-hod-observations', o.id); return { app: 'safetyobservation', view: 'so-hod-observations' }; },
      });
    };
    if (o.status === 'open') toHods(pill('Review pending', 'pill-amber'), o.hod_due_at, 'Review & reassign / reject');
    else if (o.status === 'escalated_manager') toManager(pill('Escalated to Manager', 'pill-red'), 'Review — HOD missed closing time');
    else if (o.status === 'under_review') {
      out.push({
        ...base, key: `so-${o.id}-agent`, assignee: o.agent.name, role: 'Safety Agent', status: pill('Reassigned to you', 'pill-blue'), due_at: o.due_at, action: 'Close the observation',
        go: () => { so.selectAgent(o.agent.id); setFocusTarget('so-agent-home', o.id); return { app: 'safetyobservation', view: 'so-agent-home' }; },
      });
    } else if (o.status === 'escalated') {
      if (o.handler === 'manager') toManager(pill('Agent missed SLA', 'pill-orange'), 'Close with rectification image');
      else toHods(pill('Agent missed SLA', 'pill-orange'), null, 'Close with rectification image');
    }
  });
  return out;
}

function violationTasks() {
  const out = [];
  sv.tasksSnapshot().forEach((v) => {
    const base = { module: 'violation', ref: v.violation_no, title: `${v.violation_type}${v.offence ? ` · ${v.offence}` : ''} — ${v.employee_name || v.employee_code || ''}`, created_at: v.created_at, department: v.department };
    if (v.status === 'open') {
      const h = sv.hodForDepartment(v.department);
      out.push({
        ...base, key: `sv-${v.id}-hod`, assignee: h?.name || `${v.department} HOD`, role: `HOD · ${v.department}`, status: pill('Review pending', 'pill-amber'), action: 'Review & reassign / reject',
        go: () => { sv.selectRole('hod'); sv.selectHodDepartment(v.department); setFocusTarget('sv-hod-violations', v.id); return { app: 'safetyviolation', view: 'sv-hod-violations' }; },
      });
    } else if (v.status === 'under_review') {
      out.push({
        ...base, key: `sv-${v.id}-agent`, assignee: v.agent.name, role: 'Safety Agent', status: pill('Reassigned to you', 'pill-blue'), action: 'Close the violation',
        go: () => { sv.selectAgent(v.agent.id); setFocusTarget('sv-agent-home', v.id); return { app: 'safetyviolation', view: 'sv-agent-home' }; },
      });
    }
  });
  return out;
}

function incidentTasks() {
  const hod = ir.assignedHod();
  return ir.tasksSnapshot()
    .filter((i) => i.status === 'open' || i.status === 'under_investigation')
    .map((i) => ({
      module: 'incident', key: `ir-${i.id}`, ref: i.incident_no, title: `${i.incident_type || i.type || 'Incident'} — ${i.department || ''}`, created_at: i.created_at, department: i.department,
      assignee: hod?.name || 'HOD', role: 'HOD',
      status: i.status === 'open' ? pill('Review pending', 'pill-amber') : pill('Under investigation', 'pill-blue'),
      action: i.status === 'open' ? 'Review the incident' : 'Complete investigation & close',
      go: () => { ir.selectRole('hod'); setFocusTarget('ir-hod-incidents', i.id); return { app: 'incidentreport', view: 'ir-hod-incidents' }; },
    }));
}

function machineTasks() {
  const { audits, officer } = ma.tasksSnapshot();
  const out = [];
  audits.forEach((a) => {
    const base = { module: 'machine', ref: a.audit_no, title: `${a.machine_name}${a.machine_id ? ` · ${a.machine_id}` : ''}`, created_at: a.created_at, department: a.department };
    if (a.status === 'pending_incharge') {
      ma.INCHARGE_ROLES.forEach(({ key, label }) => {
        if (a.signoffs[key].status === 'completed') return;
        const h = ma.inchargeFor(key);
        out.push({
          ...base, key: `ma-${a.id}-${key}`, assignee: h.name, role: label, status: pill('Sign-off pending', 'pill-amber'), action: 'Complete & sign your part',
          go: () => { ma.selectRole('incharge'); ma.selectIncharge(key); setFocusTarget('ma-incharge-home', a.id); return { app: 'machineaudit', view: 'ma-incharge-home' }; },
        });
      });
    } else if (a.status === 'ready_to_close') {
      out.push({
        ...base, key: `ma-${a.id}-officer`, assignee: officer.name, role: 'Safety Officer', status: pill('Ready to close', 'pill-blue'), action: 'Close the audit',
        go: () => { ma.selectRole('officer'); setFocusTarget('ma-officer-home', a.id); return { app: 'machineaudit', view: 'ma-officer-home' }; },
      });
    }
  });
  return out;
}

function fastaidTasks() {
  const { refills, boxFor, ohc } = fa.tasksSnapshot();
  const out = [];
  refills.forEach((r) => {
    const { inspector, box } = boxFor(r.inspection_id);
    const base = { module: 'fastaid', ref: r.request_code, title: `Refill for box ${box?.box_number || ''}`, created_at: r.created_at, department: box?.department };
    if (r.status === 'pending') {
      out.push({
        ...base, key: `fa-${r.id}-ohc`, assignee: ohc.name, role: 'OHC', status: pill('Refill pending', 'pill-amber'), action: 'Refill the box',
        go: () => { fa.selectRole('ohc'); fa.setPendingTarget('fa-ohc-refills', { refillId: r.id }); return { app: 'fastaid', view: 'fa-ohc-refills' }; },
      });
    } else if (r.status === 'awaiting_verification' && inspector) {
      out.push({
        ...base, key: `fa-${r.id}-ai`, assignee: inspector.name, role: 'First Aid Attendant', status: pill('Verify refill', 'pill-blue'), action: 'Verify the refilled items',
        go: () => { fa.selectRole('area_incharge'); fa.setPendingTarget('fa-ai-inspections', { refillId: r.id }); return { app: 'fastaid', view: 'fa-ai-inspections' }; },
      });
    }
  });
  return out;
}

function shiftTasks() {
  return ss.tasksSnapshot().filter((r) => r.status === 'pending').map((r) => ({
    module: 'shift', key: `ss-${r.id}`, ref: r.request_no, title: `${ss.REQUEST_TYPES[r.type]}: ${r.employee_name} Shift ${r.from_shift} → ${r.to_shift}${r.swap_with_name ? ` (with ${r.swap_with_name})` : ''}`,
    created_at: r.created_at, department: r.department, assignee: ss.hodName(r.department), role: `HOD · ${r.department}`,
    status: pill('Approval pending', 'pill-amber'), action: 'Approve or reject',
    go: () => { ss.selectRole('hod'); ss.selectHodDepartment(r.department); setFocusTarget('ss-hod-requests', r.id); return { app: 'shiftschedule', view: 'ss-hod-requests' }; },
  }));
}

function planTasks() {
  const date = planDate();
  const done = loadDone(dateKey(date));
  return SHIFTS.flatMap((s) => tasksForShift(date.getDate(), s.id)
    .filter((t) => !done.includes(t.id))
    .map((t) => ({
      module: 'plan', key: `atp-${t.id}-${s.id}`, ref: t.kind === 'training' ? 'Training' : 'Audit', title: t.name, created_at: date.toISOString(),
      assignee: `${s.label} Crew`, role: `${s.label} · ${s.time}`, status: pill('Planned today', 'pill-violet'), action: 'Complete and tick it off',
      go: () => ({ portal: 'atp-today' }),
    })));
}

/** Every pending task right now. */
export function collectTasks() {
  so.checkSla?.();
  return [
    ...observationTasks(), ...violationTasks(), ...incidentTasks(), ...machineTasks(),
    ...fastaidTasks(), ...shiftTasks(), ...planTasks(),
  ];
}
