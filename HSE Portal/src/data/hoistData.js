export const EQUIPMENT = [
  { id: 'RH-01', type: 'Remote Hoist', capacity: '2T', location: 'Assembly Bay-01', department: 'Production', status: 'VALID', nextDue: '12-Aug-2026' },
  { id: 'RH-03', type: 'Remote Hoist', capacity: '3T', location: 'Assembly Bay-02', department: 'Production', status: 'VALID', nextDue: '21-Aug-2026' },
  { id: 'RH-07', type: 'Remote Hoist', capacity: '5T', location: 'Maintenance Bay', department: 'Maintenance', status: 'DUE SOON', nextDue: '29-Jul-2026' },
  { id: 'RH-14', type: 'Remote Hoist', capacity: '2T', location: 'Packing Bay', department: 'Production', status: 'DUE SOON', nextDue: '30-Jul-2026' },
  { id: 'RH-19', type: 'Remote Hoist', capacity: '4T', location: 'Fabrication Bay', department: 'Production', status: 'VALID', nextDue: '17-Aug-2026' },
  { id: 'EOT-03', type: 'EOT Crane', capacity: '10T', location: 'Bay-01', department: 'Production', status: 'VALID', nextDue: '15-Aug-2026' },
  { id: 'EOT-07', type: 'EOT Crane', capacity: '15T', location: 'Bay-03', department: 'Production', status: 'REJECTED', nextDue: 'REJECTED' },
  { id: 'EOT-09', type: 'EOT Crane', capacity: '5T', location: 'Bay-04', department: 'Maintenance', status: 'VALID', nextDue: '18-Aug-2026' },
  { id: 'EOT-11', type: 'EOT Crane', capacity: '20T', location: 'Bay-05', department: 'Production', status: 'DUE SOON', nextDue: '28-Jul-2026' },
  { id: 'EOT-15', type: 'EOT Crane', capacity: '10T', location: 'Bay-06', department: 'Warehouse', status: 'VALID', nextDue: '22-Aug-2026' },
  { id: 'EOT-18', type: 'EOT Crane', capacity: '5T', location: 'Store Bay', department: 'Warehouse', status: 'VALID', nextDue: '25-Aug-2026' },
];

export const EQUIPMENT_TYPES = ['Remote Hoist', 'EOT Crane'];
export const HOIST_DEPARTMENTS = ['Production', 'Maintenance', 'Warehouse'];

export const EQUIP_STATUS_PILL = {
  VALID: 'pill-green',
  'DUE SOON': 'pill-amber',
  REJECTED: 'pill-red',
};

export const EQUIPMENT_TYPE_SUMMARY = [
  { type: 'Remote Hoist <5T', total: 29, valid: 24, due: 3, rejected: 2 },
  { type: 'EOT Crane <20T', total: 19, valid: 15, due: 2, rejected: 2 },
];

export const INSPECTION_CATEGORIES = [
  { label: 'Mechanical', value: 95 },
  { label: 'Electrical', value: 92 },
  { label: 'Safety Devices', value: 89 },
];

export const CRITICAL_FINDINGS = [
  { id: 'EOT-07', title: 'Emergency Stop', meta: 'Bay-03 · Not functioning · 26-Jul-2026', tag: 'REJECTED', pillClass: 'pill-red' },
  { id: 'RH-14', title: 'Hook Latch', meta: 'Assembly Bay · Damaged · 25-Jul-2026', tag: 'ACTION OPEN', pillClass: 'pill-amber' },
  { id: 'EOT-11', title: 'Limit Switch', meta: 'Bay-05 · Adjustment required · 24-Jul-2026', tag: 'ACTION OPEN', pillClass: 'pill-amber' },
];

// Safety Audit Checklist — [label, isCritical]
export const AUDIT_CHECKPOINTS = [
  ['Equipment identification / ID plate', false],
  ['Safe Working Load (SWL) marking visible', true],
  ['Pendant / remote control condition', false],
  ['Emergency stop function', true],
  ['Main isolator / electrical panel condition', true],
  ['Power cable / festoon / cable condition', false],
  ['Pendant cable / remote signal condition', false],
  ['Hoist brake operation', true],
  ['Gearbox / motor abnormal noise', false],
  ['Hook condition and deformation', true],
  ['Hook safety latch', true],
  ['Wire rope / chain condition', true],
  ['Drum / chain pocket condition', false],
  ['Upper limit switch', true],
  ['Lower limit / travel limit', false],
  ['Overload protection / limiter', true],
  ['Crane travel / wheel condition (EOT)', false],
  ['Cross travel operation (EOT)', false],
  ['Long travel / end limit (EOT)', false],
  ['Warning alarm / horn / beacon', false],
];

export const AUDIT_TYPES = ['Monthly Safety Inspection', 'Pre-Use Inspection', 'Post-Repair Inspection', 'Annual Statutory Inspection'];

export const HOD_APPROVALS = [
  { id: 'AUD-2026-047', equipment: 'EOT-07', type: 'Monthly Safety Inspection', score: '0%', recommendation: 'Remove From Service', submitted: '26-Jul-2026' },
  { id: 'AUD-2026-046', equipment: 'RH-14', type: 'Monthly Safety Inspection', score: '85%', recommendation: 'Monitor / Corrective Action', submitted: '25-Jul-2026' },
  { id: 'AUD-2026-045', equipment: 'EOT-11', type: 'Monthly Safety Inspection', score: '82%', recommendation: 'Monitor / Corrective Action', submitted: '24-Jul-2026' },
];

export const CORRECTIVE_ACTIONS = [
  { id: 'CA-026', equipment: 'EOT-07', finding: 'Emergency stop not functioning', responsible: 'Maintenance HOD', due: '28-Jul-2026', status: 'OPEN', action: 'View' },
  { id: 'CA-025', equipment: 'RH-14', finding: 'Hook safety latch damaged', responsible: 'Maintenance', due: '29-Jul-2026', status: 'IN PROGRESS', action: 'Remind' },
  { id: 'CA-024', equipment: 'EOT-11', finding: 'Upper limit switch adjustment', responsible: 'Electrical HOD', due: '25-Jul-2026', status: 'OVERDUE', action: 'Escalate' },
  { id: 'CA-023', equipment: 'RH-03', finding: 'Brake inspection completed', responsible: 'Maintenance', due: '21-Jul-2026', status: 'CLOSED', action: 'Evidence' },
];

export const CA_STATUS_PILL = {
  OPEN: 'pill-red',
  'IN PROGRESS': 'pill-amber',
  OVERDUE: 'pill-red',
  CLOSED: 'pill-green',
};

export const AUDIT_HISTORY = [
  { date: '26-Jul-2026', equipment: 'EOT-07', type: 'Monthly Safety Inspection', inspector: 'Ravi Kumar', score: '0%', status: 'REJECTED', areaHod: 'PENDING', safetyHod: 'PENDING' },
  { date: '25-Jul-2026', equipment: 'RH-14', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '85%', status: 'CONDITIONAL', areaHod: 'PENDING', safetyHod: 'PENDING' },
  { date: '24-Jul-2026', equipment: 'EOT-11', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '82%', status: 'CONDITIONAL', areaHod: 'APPROVED', safetyHod: 'PENDING' },
  { date: '21-Jul-2026', equipment: 'RH-03', type: 'Post-Repair Inspection', inspector: 'Safety Officer', score: '96%', status: 'PASS', areaHod: 'APPROVED', safetyHod: 'APPROVED' },
  { date: '18-Jul-2026', equipment: 'EOT-03', type: 'Monthly Safety Inspection', inspector: 'Safety Officer', score: '94%', status: 'PASS', areaHod: 'APPROVED', safetyHod: 'APPROVED' },
];

export const HISTORY_STATUS_PILL = {
  REJECTED: 'pill-red',
  CONDITIONAL: 'pill-blue',
  PASS: 'pill-green',
};

export const APPROVAL_PILL = {
  PENDING: 'pill-blue',
  APPROVED: 'pill-green',
};

export const AUDIT_AREAS = [
  { label: 'Mechanical System', value: 95 },
  { label: 'Electrical System', value: 92 },
  { label: 'Safety Devices', value: 89 },
  { label: 'Documentation', value: 96 },
];

export const MONTHLY_SUMMARY = [
  { label: 'Remote Hoists', value: 29 },
  { label: 'EOT Cranes', value: 19 },
  { label: 'Valid', value: 39 },
  { label: 'Due Soon', value: 5 },
  { label: 'Rejected', value: 4 },
  { label: 'Open Actions', value: 7 },
];

let auditSeq = 48;
export function nextAuditId() {
  return `AUD-2026-${String(auditSeq++).padStart(3, '0')}`;
}

let caSeq = 27;
export function nextActionId() {
  return `CA-${String(caSeq++).padStart(3, '0')}`;
}
