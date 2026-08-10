export const EHS_DEPARTMENTS = ['Manufacturing', 'Production', 'Maintenance', 'Warehouse', 'Quality', 'Logistics', 'Utilities', 'Administration'];

export const VIOLATION_TYPES = ['PPE Violation', 'Unsafe Act', 'Unsafe Condition', 'Procedure Violation', 'Housekeeping Violation', 'Speeding / Traffic Violation'];
export const OFFENCE_LEVELS = ['1st Offence', '2nd Offence', '3rd Offence', 'Final Warning'];
export const CORRECTIVE_ACTIONS = ['Counselling', 'Written Reprimand', 'Suspension', 'Termination'];

export const OBSERVATION_CATEGORIES = ['Unsafe Act', 'Unsafe Condition', 'Near Miss', 'Good Practice', 'Housekeeping', 'PPE Non-Compliance', 'Other'];
export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
export const OBSERVATION_STATUSES = ['Open', 'Under Review', 'Closed'];

export const INCIDENT_TYPES = ['Near Miss', 'First Aid', 'Medical Treatment', 'Lost Time Injury', 'Fatality', 'Property Damage', 'Environmental'];
export const INCIDENT_STATUSES = ['Open', 'Under Investigation', 'Closed'];

export const PPE_ITEMS = ['Helmet', 'Safety Glasses', 'Gloves', 'Safety Shoes', 'Harness', 'Ear Plug', 'Face Shield', 'Respirator'];

export const AUDIT_SCHEDULE_STATUSES = ['Planned', 'Completed', 'Overdue'];

export const PERMIT_TYPES = {
  'permits-general': 'General Permit',
  'permits-height': 'Work at Height',
  'permits-hotwork': 'Hot Work',
  'permits-confined': 'Confined Space',
  'permits-loto': 'LOTO',
  'permits-excavation': 'Excavation',
};

let violationSeq = 125;
export function nextViolationId() { return `SVN-2026-${String(violationSeq++).padStart(5, '0')}`; }

let incidentSeq = 1;
export function nextIncidentId() { return `INC-2026-${String(incidentSeq++).padStart(3, '0')}`; }

let planSeq = 1;
export function nextPlanId() { return `ATP-2026-${String(planSeq++).padStart(3, '0')}`; }

let permitSeq = 1;
export function nextPermitId() { return `PTW-2026-${String(permitSeq++).padStart(3, '0')}`; }
