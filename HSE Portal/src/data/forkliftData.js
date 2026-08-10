export const FORKLIFTS = [
  { id: 'FL-01', type: 'Electric Forklift', capacity: '2.5T', location: 'Warehouse-01', department: 'Warehouse', status: 'VALID', nextDue: '12-Aug-2026' },
  { id: 'FL-03', type: 'Diesel Forklift', capacity: '3T', location: 'Production Bay-02', department: 'Production', status: 'VALID', nextDue: '21-Aug-2026' },
  { id: 'FL-07', type: 'Electric Forklift', capacity: '2T', location: 'Warehouse-02', department: 'Warehouse', status: 'DUE SOON', nextDue: '29-Jul-2026' },
  { id: 'FL-09', type: 'Diesel Forklift', capacity: '3.5T', location: 'Fabrication', department: 'Production', status: 'VALID', nextDue: '17-Aug-2026' },
  { id: 'FL-14', type: 'Diesel Forklift', capacity: '5T', location: 'Raw Material Yard', department: 'Production', status: 'REJECTED', nextDue: 'DO NOT OPERATE' },
  { id: 'FL-18', type: 'Electric Forklift', capacity: '2.5T', location: 'Dispatch', department: 'Logistics', status: 'VALID', nextDue: '22-Aug-2026' },
  { id: 'FL-21', type: 'Diesel Forklift', capacity: '3T', location: 'Finished Goods', department: 'Logistics', status: 'DUE SOON', nextDue: '30-Jul-2026' },
  { id: 'FL-24', type: 'Electric Forklift', capacity: '2T', location: 'Maintenance Bay', department: 'Maintenance', status: 'VALID', nextDue: '25-Aug-2026' },
  { id: 'FL-28', type: 'Diesel Forklift', capacity: '4T', location: 'Warehouse-03', department: 'Warehouse', status: 'VALID', nextDue: '26-Aug-2026' },
  { id: 'FL-31', type: 'Electric Forklift', capacity: '2.5T', location: 'Assembly', department: 'Production', status: 'VALID', nextDue: '28-Aug-2026' },
];

export const FORKLIFT_TYPES = ['Electric Forklift', 'Diesel Forklift', 'LPG Forklift', 'Reach Truck'];
export const DEPARTMENTS = ['Production', 'Maintenance', 'Warehouse', 'Logistics'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const IMMEDIATE_ACTIONS = ['None', 'Forklift stopped', 'Tagged out', 'Removed from service'];

export const MASTER_STATUS_PILL = {
  VALID: 'pill-green',
  'DUE SOON': 'pill-blue',
  REJECTED: 'pill-red',
};

export const PRIORITY_PILL = {
  LOW: 'pill-slate',
  MEDIUM: 'pill-amber',
  HIGH: 'pill-amber',
  CRITICAL: 'pill-red',
};

export const OBS_STATUS_PILL = {
  OPEN: 'pill-blue',
  'IN PROGRESS': 'pill-blue',
  OVERDUE: 'pill-red',
  CLOSED: 'pill-green',
};

export const OBSERVATIONS = [
  { id: 'OBS-026', forklift: 'FL-07', finding: 'Reverse alarm not functioning', dept: 'Maintenance', hod: 'Maintenance HOD', due: '28-Jul-2026', priority: 'HIGH', status: 'OPEN' },
  { id: 'OBS-025', forklift: 'FL-14', finding: 'Fork crack observed — forklift stopped', dept: 'Maintenance', hod: 'Workshop HOD', due: '27-Jul-2026', priority: 'CRITICAL', status: 'IN PROGRESS' },
  { id: 'OBS-024', forklift: 'FL-21', finding: 'Seat belt damaged', dept: 'Logistics', hod: 'Logistics HOD', due: '30-Jul-2026', priority: 'MEDIUM', status: 'OPEN' },
  { id: 'OBS-023', forklift: 'FL-03', finding: 'Beacon light not working', dept: 'Production', hod: 'Production HOD', due: '21-Jul-2026', priority: 'LOW', status: 'CLOSED' },
  { id: 'OBS-022', forklift: 'FL-09', finding: 'Hydraulic hose sweating / leakage', dept: 'Maintenance', hod: 'Maintenance HOD', due: '29-Jul-2026', priority: 'HIGH', status: 'IN PROGRESS' },
  { id: 'OBS-021', forklift: 'FL-18', finding: 'Operator pre-use checklist not available', dept: 'Logistics', hod: 'Logistics HOD', due: '26-Jul-2026', priority: 'MEDIUM', status: 'OVERDUE' },
  { id: 'OBS-020', forklift: 'FL-24', finding: 'Battery charging area housekeeping', dept: 'Maintenance', hod: 'Maintenance HOD', due: '31-Jul-2026', priority: 'LOW', status: 'OPEN' },
  { id: 'OBS-019', forklift: 'FL-28', finding: 'Speed limit signage missing', dept: 'Warehouse', hod: 'Warehouse HOD', due: '02-Aug-2026', priority: 'LOW', status: 'CLOSED' },
];

export const CORRECTIVE_ACTIONS = [
  { id: 'CA-026', forklift: 'FL-07', finding: 'Reverse alarm not functioning', dept: 'Maintenance', owner: 'Maintenance HOD', due: '28-Jul-2026', status: 'OPEN', action: 'Escalate' },
  { id: 'CA-025', forklift: 'FL-14', finding: 'Fork crack — remove from service', dept: 'Maintenance', owner: 'Workshop HOD', due: '27-Jul-2026', status: 'IN PROGRESS', action: 'Evidence' },
  { id: 'CA-024', forklift: 'FL-21', finding: 'Seat belt damaged', dept: 'Logistics', owner: 'Logistics HOD', due: '30-Jul-2026', status: 'OPEN', action: 'Remind' },
  { id: 'CA-023', forklift: 'FL-03', finding: 'Beacon light replaced', dept: 'Production', owner: 'Production HOD', due: '21-Jul-2026', status: 'CLOSED', action: 'Evidence' },
];

export const CA_STATUS_PILL = {
  OPEN: 'pill-red',
  'IN PROGRESS': 'pill-amber',
  CLOSED: 'pill-green',
};

export const AUDIT_HISTORY = [
  { date: '26-Jul-2026', forklift: 'FL-14', type: 'Monthly Safety Inspection', inspector: 'Ravi Kumar', score: '0%', status: 'REJECTED', areaHod: 'PENDING', safetyHod: 'PENDING' },
  { date: '25-Jul-2026', forklift: 'FL-07', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '82%', status: 'CONDITIONAL', areaHod: 'PENDING', safetyHod: 'PENDING' },
  { date: '24-Jul-2026', forklift: 'FL-21', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '86%', status: 'CONDITIONAL', areaHod: 'APPROVED', safetyHod: 'PENDING' },
  { date: '21-Jul-2026', forklift: 'FL-03', type: 'Post-Repair Inspection', inspector: 'Safety Officer', score: '96%', status: 'PASS', areaHod: 'APPROVED', safetyHod: 'APPROVED' },
  { date: '18-Jul-2026', forklift: 'FL-09', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '94%', status: 'PASS', areaHod: 'APPROVED', safetyHod: 'APPROVED' },
];

export const AUDIT_STATUS_PILL = {
  REJECTED: 'pill-red',
  CONDITIONAL: 'pill-blue',
  PASS: 'pill-green',
};

export const APPROVAL_PILL = {
  PENDING: 'pill-blue',
  APPROVED: 'pill-green',
};

export const AUDIT_TYPES = ['Monthly Safety Inspection', 'Pre-Use Inspection', 'Post-Repair Inspection', 'Annual Statutory Inspection'];

// Forklift Safety Checklist — [label, isCritical]
export const AUDIT_CHECKPOINTS = [
  ['Forklift ID / capacity plate visible', false],
  ['Pre-use inspection sticker / status visible', false],
  ['Forks condition, cracks and wear', true],
  ['Fork locking pins / fork positioning', true],
  ['Mast, chains and rollers condition', false],
  ['Hydraulic system leakage', true],
  ['Hydraulic hoses / fittings condition', false],
  ['Service brake operation', true],
  ['Parking brake operation', true],
  ['Steering operation / free play', true],
  ['Tyres / wheels condition', false],
  ['Seat belt / operator restraint', true],
  ['Reverse alarm function', true],
  ['Horn function', false],
  ['Beacon / warning light', false],
  ['Head lights / tail lights', false],
  ['Load backrest / overhead guard', true],
  ['Battery / LPG / fuel system condition', true],
  ['Fire extinguisher / emergency equipment', false],
  ['Housekeeping / operator cabin condition', false],
];

export const DEPT_CLOSURE_PERFORMANCE = [
  { dept: 'Production', value: 82 },
  { dept: 'Maintenance', value: 71 },
  { dept: 'Warehouse', value: 86 },
  { dept: 'Logistics', value: 78 },
];

export const MANAGEMENT_WORKFLOW = [
  { title: 'Safety Officer', desc: 'Audit forklift / record observation + photo' },
  { title: 'Concern Department', desc: 'System assigns observation to responsible department HOD' },
  { title: 'Department HOD', desc: 'Accept concern and nominate action owner' },
  { title: 'Action Owner', desc: 'Correct issue and upload evidence' },
  { title: 'Safety HOD', desc: 'Verify closure and close observation' },
];

export const OBSERVATION_WORKFLOW = [
  { title: 'Safety Officer', desc: 'Record observation + photo' },
  { title: 'Responsible Department', desc: 'Concern assigned' },
  { title: 'Department HOD', desc: 'Accept & assign owner' },
  { title: 'Action Owner', desc: 'Corrective action' },
  { title: 'Safety', desc: 'Verify evidence' },
  { title: 'Closure', desc: 'Close observation' },
];

let seq = 27;
export function nextObservationId() {
  return `OBS-${String(seq++).padStart(3, '0')}`;
}

let caSeq = 27;
export function nextActionId() {
  return `CA-${String(caSeq++).padStart(3, '0')}`;
}
