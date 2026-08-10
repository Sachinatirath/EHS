export const SLINGS = [
  { id: 'WS-001', swl: '2T', length: '3 m', width: '50 mm', department: 'Production', location: 'Bay-01', status: 'VALID', nextDue: '15-Aug-2026' },
  { id: 'WS-002', swl: '3T', length: '4 m', width: '75 mm', department: 'Production', location: 'Bay-02', status: 'DUE SOON', nextDue: '29-Jul-2026' },
  { id: 'WS-003', swl: '5T', length: '5 m', width: '100 mm', department: 'Maintenance', location: 'Bay-03', status: 'VALID', nextDue: '12-Aug-2026' },
  { id: 'WS-019', swl: '2T', length: '3 m', width: '50 mm', department: 'Production', location: 'Bay-05', status: 'VALID', nextDue: '10-Aug-2026' },
  { id: 'WS-031', swl: '5T', length: '5 m', width: '100 mm', department: 'Production', location: 'Bobbin Bay-01', status: 'DUE SOON', nextDue: '28-Jul-2026' },
  { id: 'WS-047', swl: '5T', length: '5 m', width: '100 mm', department: 'Production', location: 'Bobbin Bay-02', status: 'REJECTED', nextDue: 'REJECTED' },
  { id: 'WS-082', swl: '3T', length: '4 m', width: '75 mm', department: 'Maintenance', location: 'Workshop-02', status: 'DUE SOON', nextDue: '30-Jul-2026' },
  { id: 'WS-101', swl: '2T', length: '2 m', width: '50 mm', department: 'Warehouse', location: 'Store-01', status: 'VALID', nextDue: '17-Aug-2026' },
  { id: 'WS-118', swl: '3T', length: '4 m', width: '75 mm', department: 'Warehouse', location: 'Store-02', status: 'VALID', nextDue: '19-Aug-2026' },
  { id: 'WS-126', swl: '5T', length: '5 m', width: '100 mm', department: 'Utility', location: 'Utility Bay', status: 'VALID', nextDue: '21-Aug-2026' },
];

export const SLING_DEPARTMENTS = ['Production', 'Maintenance', 'Warehouse', 'Utility'];
export const SWL_OPTIONS = ['2T', '3T', '5T'];

export const SLING_STATUS_PILL = {
  VALID: 'pill-green',
  'DUE SOON': 'pill-amber',
  REJECTED: 'pill-red',
};

export const DEPARTMENT_SUMMARY = [
  { dept: 'Production', total: 65, valid: 58, rejected: 4 },
  { dept: 'Maintenance', total: 31, valid: 27, rejected: 2 },
  { dept: 'Warehouse', total: 20, valid: 18, rejected: 1 },
  { dept: 'Utility', total: 10, valid: 5, rejected: 0 },
];

export const CRITICAL_FINDINGS = [
  { id: 'WS-047', title: 'Cut / Tear', meta: 'Bobbin Bay-02 · Critical · 26-Jul-2026', tag: 'REJECTED', pillClass: 'pill-red' },
  { id: 'WS-082', title: 'Missing Tag', meta: 'Maintenance · High · 25-Jul-2026', tag: 'ACTION OPEN', pillClass: 'pill-amber' },
  { id: 'WS-031', title: 'Abrasion', meta: 'Production · Medium · 24-Jul-2026', tag: 'ACTION OPEN', pillClass: 'pill-amber' },
];

// Safety Inspection Checklist — [label, isCritical]
export const INSPECTION_CHECKPOINTS = [
  ['Identification tag available', false],
  ['SWL / WLL marking clearly visible', false],
  ['Webbing cuts / tears', true],
  ['Abrasion / excessive wear', false],
  ['Burn / heat damage', true],
  ['Chemical damage', true],
  ['Stitching condition', false],
  ['Eye loop condition', false],
  ['Hardware / fittings condition', false],
  ['Distortion / deformation', false],
  ['Contamination / oil / paint', false],
  ['Previous repair indication', false],
  ['Edge condition', false],
  ['Overall webbing integrity', false],
  ['Storage / handling condition', false],
];

export const INSPECTION_TYPES = ['Monthly Inspection', 'Pre-Use Inspection', 'Post-Repair Inspection', 'Annual Statutory Inspection'];

export const HOD_APPROVALS = [
  { id: 'INSP-2026-047', sling: 'WS-047', inspector: 'Ravi Kumar', score: '0%', recommendation: 'Remove From Service', submitted: '26-Jul-2026' },
  { id: 'INSP-2026-046', sling: 'WS-082', inspector: 'Safety Officer', score: '87%', recommendation: 'Monitor / Corrective Action', submitted: '25-Jul-2026' },
  { id: 'INSP-2026-045', sling: 'WS-031', inspector: 'Safety Officer', score: '80%', recommendation: 'Monitor / Corrective Action', submitted: '24-Jul-2026' },
];

export const CORRECTIVE_ACTIONS = [
  { id: 'CA-2026-031', sling: 'WS-047', finding: 'Cut observed on webbing edge', responsible: 'Maintenance HOD', due: '28-Jul-2026', status: 'OPEN', action: 'View' },
  { id: 'CA-2026-030', sling: 'WS-082', finding: 'Identification tag missing', responsible: 'Stores HOD', due: '29-Jul-2026', status: 'IN PROGRESS', action: 'View' },
  { id: 'CA-2026-029', sling: 'WS-031', finding: 'Heavy abrasion near eye loop', responsible: 'Production HOD', due: '26-Jul-2026', status: 'OVERDUE', action: 'Escalate' },
  { id: 'CA-2026-028', sling: 'WS-019', finding: 'Stitching checked and repaired', responsible: 'Maintenance', due: '22-Jul-2026', status: 'CLOSED', action: 'Evidence' },
];

export const CA_STATUS_PILL = {
  OPEN: 'pill-red',
  'IN PROGRESS': 'pill-amber',
  OVERDUE: 'pill-red',
  CLOSED: 'pill-green',
};

export const INSPECTION_HISTORY = [
  { date: '26-Jul-2026', sling: 'WS-047', type: 'Monthly Inspection', inspector: 'Ravi Kumar', score: '0%', status: 'REJECTED', hod: 'PENDING', safetyHod: 'PENDING' },
  { date: '25-Jul-2026', sling: 'WS-082', type: 'Monthly Inspection', inspector: 'Safety Officer', score: '87%', status: 'CONDITIONAL', hod: 'PENDING', safetyHod: 'PENDING' },
  { date: '24-Jul-2026', sling: 'WS-031', type: 'Monthly Inspection', inspector: 'Safety Officer', score: '80%', status: 'CONDITIONAL', hod: 'APPROVED', safetyHod: 'PENDING' },
  { date: '22-Jul-2026', sling: 'WS-019', type: 'Post-Repair Inspection', inspector: 'Safety Officer', score: '96%', status: 'PASS', hod: 'APPROVED', safetyHod: 'APPROVED' },
  { date: '18-Jul-2026', sling: 'WS-001', type: 'Monthly Inspection', inspector: 'Safety Officer', score: '100%', status: 'PASS', hod: 'APPROVED', safetyHod: 'APPROVED' },
  { date: '15-Jul-2026', sling: 'WS-003', type: 'Monthly Inspection', inspector: 'Safety Officer', score: '93%', status: 'PASS', hod: 'APPROVED', safetyHod: 'APPROVED' },
];

export const HISTORY_STATUS_PILL = {
  REJECTED: 'pill-red',
  CONDITIONAL: 'pill-amber',
  PASS: 'pill-green',
};

export const APPROVAL_PILL = {
  PENDING: 'pill-amber',
  APPROVED: 'pill-green',
};

export const TOP_DEFECTS = [
  { label: 'Abrasion', value: 18 },
  { label: 'Cut / Tear', value: 11 },
  { label: 'Tag Missing', value: 7 },
  { label: 'Stitching Damage', value: 5 },
  { label: 'Chemical Damage', value: 3 },
];

export const MANAGEMENT_REPORT_STATS = [
  { label: 'Valid', value: 108 },
  { label: 'Conditional', value: 4 },
  { label: 'Rejected', value: 7 },
  { label: 'Due Soon', value: 11 },
  { label: 'Open Actions', value: 8 },
  { label: 'Closed Actions', value: 22 },
];

let inspSeq = 48;
export function nextInspectionId() {
  return `INSP-2026-${String(inspSeq++).padStart(3, '0')}`;
}
