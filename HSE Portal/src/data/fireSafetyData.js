export const FS_DEPARTMENTS = ['Production', 'Warehouse', 'Assembly', 'Utilities', 'Maintenance'];
export const FIRE_ASSET_TYPES = ['Fire Extinguisher', 'Hose Box', 'Hose Reel', 'Hydrant Valve', 'Fire Hose', 'Other Fire System'];
export const AUDIT_TYPES = ['Scheduled', 'Unscheduled', 'Follow-up'];
export const AUDIT_RESULTS = ['COMPLIANT', 'NON-COMPLIANT', 'OBSERVATION'];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
export const COMPLAINT_TYPES = ['Pressure drop', 'Pressure low', 'Discharge issue', 'Physical damage', 'Seal / pin missing', 'Corrosion'];
export const PUMP_TYPES = ['JOCKEY PUMP', 'MAIN ELECTRIC PUMP', 'DIESEL PUMP'];

export const STATUS_PILL = {
  VALID: 'pill-green',
  'TEST DUE': 'pill-red',
  OBSERVATION: 'pill-amber',
  LEAKAGE: 'pill-orange',
  'ACCESS ISSUE': 'pill-orange',
  COMPLIANT: 'pill-green',
  'NON-COMPLIANT': 'pill-red',
  LOW: 'pill-violet',
  MEDIUM: 'pill-violet',
  HIGH: 'pill-amber',
  CRITICAL: 'pill-red',
  OPEN: 'pill-amber',
  'IN PROGRESS': 'pill-blue',
  VERIFICATION: 'pill-cyan',
  'SPARE INSTALLED': 'pill-cyan',
  'UNDER REPAIR': 'pill-amber',
  CLOSED: 'pill-green',
  DUE: 'pill-red',
};

export const FIRE_ASSETS = [
  { id: 'FE-PRD-044', type: 'Fire Extinguisher', spec: 'ABC Dry Powder', capacity: '6 kg', department: 'Production', location: 'Bay-2 Near Panel', status: 'VALID', score: 94 },
  { id: 'FE-WH-013', type: 'Fire Extinguisher', spec: 'CO2', capacity: '4.5 kg', department: 'Warehouse', location: 'Electrical Room', status: 'TEST DUE', score: 82 },
  { id: 'FE-ASM-031', type: 'Fire Extinguisher', spec: 'ABC Dry Powder', capacity: '9 kg', department: 'Assembly', location: 'Line-3 Entrance', status: 'VALID', score: 96 },
  { id: 'HB-ASM-021', type: 'Hose Box', spec: 'Double Door', capacity: 'Hose + Nozzle', department: 'Assembly', location: 'Hydrant Point-04', status: 'OBSERVATION', score: 88 },
  { id: 'HB-PRD-014', type: 'Hose Box', spec: 'Single Door', capacity: 'Hose + Nozzle', department: 'Production', location: 'Bay-1', status: 'VALID', score: 94 },
  { id: 'HR-WH-008', type: 'Hose Reel', spec: 'Manual Reel', capacity: '30 m', department: 'Warehouse', location: 'Dock Area', status: 'LEAKAGE', score: 79 },
  { id: 'HR-PRD-011', type: 'Hose Reel', spec: 'Manual Reel', capacity: '30 m', department: 'Production', location: 'Bay-4', status: 'VALID', score: 92 },
  { id: 'HV-UTL-012', type: 'Hydrant Valve', spec: 'Gate Valve', capacity: '65 mm', department: 'Utilities', location: 'Hydrant Yard-02', status: 'ACCESS ISSUE', score: 81 },
  { id: 'HV-PRD-006', type: 'Hydrant Valve', spec: 'Landing Valve', capacity: '65 mm', department: 'Production', location: 'Bay-5', status: 'VALID', score: 95 },
  { id: 'FH-UTL-019', type: 'Fire Hose', spec: 'Canvas / Rubber', capacity: '15 m', department: 'Utilities', location: 'Hydrant Yard-02', status: 'VALID', score: 91 },
];

export const FIRE_AUDITS = [
  { id: 'FIRE-AUD-2026-091', assetId: 'FE-PRD-044', type: 'Fire Extinguisher', department: 'Production', date: '27-Jul-2026', score: 94, result: 'COMPLIANT', risk: 'LOW' },
  { id: 'FIRE-AUD-2026-090', assetId: 'HR-WH-008', type: 'Hose Reel', department: 'Warehouse', date: '27-Jul-2026', score: 79, result: 'NON-COMPLIANT', risk: 'HIGH' },
  { id: 'FIRE-AUD-2026-089', assetId: 'HV-UTL-012', type: 'Hydrant Valve', department: 'Utilities', date: '26-Jul-2026', score: 81, result: 'OBSERVATION', risk: 'HIGH' },
  { id: 'FIRE-AUD-2026-088', assetId: 'HB-ASM-021', type: 'Hose Box', department: 'Assembly', date: '26-Jul-2026', score: 88, result: 'OBSERVATION', risk: 'MEDIUM' },
  { id: 'FIRE-AUD-2026-087', assetId: 'FE-WH-013', type: 'Fire Extinguisher', department: 'Warehouse', date: '25-Jul-2026', score: 82, result: 'NON-COMPLIANT', risk: 'HIGH' },
];

export const AUDIT_CHECKLIST = [
  { label: 'Asset is accessible and clearly identified', category: 'General' },
  { label: 'Location signage / fire symbol is visible', category: 'Identification' },
  { label: 'Physical condition / corrosion / damage acceptable', category: 'Condition' },
  { label: 'Pressure / gauge / seal / pin condition acceptable', category: 'Extinguisher' },
  { label: 'Hose, nozzle, reel and coupling condition acceptable', category: 'Hose System' },
  { label: 'Valve operation / access / identification acceptable', category: 'Valve' },
  { label: 'Cabinet / hose box glass / lock / hinges acceptable', category: 'Hose Box' },
  { label: 'AMC / inspection / hydro-test / service date valid', category: 'Records' },
  { label: 'Equipment is free from obstruction', category: 'Access' },
  { label: 'Required operating instructions are available', category: 'Information' },
];

export const FINDINGS = [
  { id: 'FND-2026-118', assetId: 'FE-WH-013', equipment: 'Fire Extinguisher', observation: 'Cylinder hydro-test / service due', department: 'Maintenance', owner: 'Maintenance Engineer', due: '31-Jul-2026', risk: 'HIGH', status: 'OPEN' },
  { id: 'FND-2026-117', assetId: 'HR-WH-008', equipment: 'Hose Reel', observation: 'Hose reel leakage observed during inspection', department: 'Maintenance', owner: 'Maintenance Supervisor', due: '29-Jul-2026', risk: 'HIGH', status: 'IN PROGRESS' },
  { id: 'FND-2026-116', assetId: 'HV-UTL-012', equipment: 'Hydrant Valve', observation: 'Valve access obstructed by stored material', department: 'Utilities', owner: 'Utilities Supervisor', due: '28-Jul-2026', risk: 'HIGH', status: 'OPEN' },
  { id: 'FND-2026-115', assetId: 'HB-ASM-021', equipment: 'Hose Box', observation: 'Cabinet glass damaged and hose identification unclear', department: 'Maintenance', owner: 'Maintenance Engineer', due: '02-Aug-2026', risk: 'MEDIUM', status: 'OPEN' },
  { id: 'FND-2026-114', assetId: 'FE-PRD-031', equipment: 'Fire Extinguisher', observation: 'Extinguisher signage partially faded', department: 'Production', owner: 'Area In-charge', due: '05-Aug-2026', risk: 'LOW', status: 'VERIFICATION' },
];

export const CORRECTIVE_ACTIONS = [
  { id: 'ACT-2026-088', findingId: 'FND-2026-118', assetId: 'FE-WH-013', department: 'Maintenance', owner: 'Maintenance Engineer', due: '31-Jul-2026', status: 'OPEN' },
  { id: 'ACT-2026-087', findingId: 'FND-2026-117', assetId: 'HR-WH-008', department: 'Maintenance', owner: 'Maintenance Supervisor', due: '29-Jul-2026', status: 'IN PROGRESS' },
  { id: 'ACT-2026-086', findingId: 'FND-2026-116', assetId: 'HV-UTL-012', department: 'Utilities', owner: 'Utilities Supervisor', due: '28-Jul-2026', status: 'OPEN' },
  { id: 'ACT-2026-085', findingId: 'FND-2026-115', assetId: 'HB-ASM-021', department: 'Maintenance', owner: 'Maintenance Engineer', due: '02-Aug-2026', status: 'OPEN' },
  { id: 'ACT-2026-084', findingId: 'FND-2026-114', assetId: 'FE-PRD-031', department: 'Production', owner: 'Area In-charge', due: '05-Aug-2026', status: 'VERIFICATION' },
];

export const AMC_SERVICES = [
  { id: 'SR-2026-041', client: 'ABC Manufacturing', assetId: 'FE-PRD-044', complaint: 'Pressure drop', spareId: 'FE-SP-012', workshopJob: 'WRK-2026-221', status: 'SPARE INSTALLED', requestTime: '27-Jul-2026 09:15', engineer: 'Service Team - Ravi', spareInstalled: '27-Jul-2026 10:05' },
  { id: 'SR-2026-040', client: 'XYZ Industries', assetId: 'FE-WH-013', complaint: 'Pressure low', spareId: 'FE-SP-008', workshopJob: 'WRK-2026-220', status: 'UNDER REPAIR', requestTime: '26-Jul-2026 15:20', engineer: 'Service Team - Kumar', spareInstalled: '26-Jul-2026 16:10' },
  { id: 'SR-2026-039', client: 'Delta Engineering', assetId: 'FE-ASM-031', complaint: 'Discharge issue', spareId: 'FE-SP-005', workshopJob: 'WRK-2026-219', status: 'CLOSED', requestTime: '24-Jul-2026 11:00', engineer: 'Service Team - Arun', spareInstalled: '24-Jul-2026 12:00' },
];

function buildPumps() {
  const rows = [];
  const specs = { 'JOCKEY PUMP': { prefix: 'JP', capacity: '5 HP' }, 'MAIN ELECTRIC PUMP': { prefix: 'MP-E', capacity: '75 HP' }, 'DIESEL PUMP': { prefix: 'DP', capacity: '90 HP' } };
  const statuses = ['VALID', 'VALID', 'VALID', 'VALID', 'OBSERVATION', 'TEST DUE'];
  let i = 0;
  PUMP_TYPES.forEach((type) => {
    const { prefix, capacity } = specs[type];
    for (let n = 1; n <= 6; n += 1) {
      const status = statuses[i % statuses.length];
      rows.push({
        id: `${prefix}-${String(n).padStart(2, '0')}`,
        type,
        location: 'Fire Pump House',
        tag: `${prefix}-${String(n).padStart(2, '0')}`,
        capacity,
        lastTest: '10-Jul-2026',
        status,
        score: status === 'VALID' ? 95 : status === 'OBSERVATION' ? 84 : 68,
      });
      i += 1;
    }
  });
  return rows;
}
export const FIRE_PUMPS = buildPumps();

export const REFILL_RECORDS = [
  { assetId: 'FE-PRD-044', extType: 'ABC Dry Powder', capacity: '6 kg', lastRefill: '12-Jun-2026', hydroTest: '18-Feb-2025', nextDue: '18-Feb-2030', certificate: 'HYD-2234', status: 'VALID' },
  { assetId: 'FE-WH-013', extType: 'CO2', capacity: '4.5 kg', lastRefill: '04-May-2026', hydroTest: '11-Jul-2021', nextDue: '11-Jul-2026', certificate: 'HYD-1142', status: 'DUE' },
  { assetId: 'FE-ASM-031', extType: 'ABC Dry Powder', capacity: '9 kg', lastRefill: '22-Jun-2026', hydroTest: '22-Mar-2024', nextDue: '22-Mar-2029', certificate: 'HYD-3311', status: 'VALID' },
];

export const ALERT_RULES = [
  { days: '30 days', action: 'Reminder' },
  { days: '15 days', action: 'HOD Notification' },
  { days: 'Due date', action: 'Escalation' },
  { days: 'Overdue', action: 'Safety HOD Alert' },
];

export const DEPARTMENT_PERFORMANCE = [
  { department: 'Production', assets: 92, audited: 81, findings: 8, overdue: 2, closure: 84 },
  { department: 'Warehouse', assets: 48, audited: 44, findings: 4, overdue: 1, closure: 91 },
  { department: 'Assembly', assets: 61, audited: 53, findings: 5, overdue: 1, closure: 88 },
  { department: 'Utilities', assets: 38, audited: 35, findings: 4, overdue: 1, closure: 86 },
  { department: 'Maintenance', assets: 47, audited: 28, findings: 2, overdue: 0, closure: 95 },
];

export const ESCALATION_FLOW = [
  { title: 'Audit Finding', desc: 'Auditor records exact asset condition with photo.' },
  { title: 'Concern Department', desc: 'Finding assigned to responsible department and owner.' },
  { title: 'Department HOD', desc: 'Notification + target date + action plan.' },
  { title: 'EHS Verification', desc: 'Evidence checked and field condition re-verified.' },
  { title: 'Safety HOD', desc: 'Critical / overdue cases escalated for management action.' },
];

export const AUDIT_TRAIL = [
  { datetime: '27-Jul-2026 11:05', ref: 'FE-PRD-044', user: 'Safety Officer', event: 'Audit Completed', comment: 'All critical checklist points verified; photo evidence uploaded', result: 'COMPLIANT' },
  { datetime: '27-Jul-2026 10:40', ref: 'HR-WH-008', user: 'Safety Officer', event: 'Finding Raised', comment: 'Hose reel leakage identified during functional inspection', result: 'HIGH' },
  { datetime: '27-Jul-2026 10:42', ref: 'HR-WH-008', user: 'EHS System', event: 'Department Assigned', comment: 'Assigned to Maintenance with due date', result: 'OPEN' },
  { datetime: '26-Jul-2026 16:20', ref: 'HV-UTL-012', user: 'Safety Officer', event: 'Observation Raised', comment: 'Valve access obstructed by material', result: 'HIGH' },
  { datetime: '26-Jul-2026 16:30', ref: 'Utilities', user: 'HOD Notification', event: 'Corrective Action Requested', comment: 'Corrective action assigned to Utilities department with target closure date.', result: 'OPEN' },
  { datetime: '25-Jul-2026 15:10', ref: 'FE-WH-013', user: 'Safety Officer', event: 'Compliance Alert', comment: 'Hydro-test / service due', result: 'HIGH' },
];

export const WORKFLOW_STEPS = [
  'Asset Selection', 'Checklist Audit', 'Photo Evidence', 'Score & Finding',
  'Department Assignment', 'Corrective Action', 'Verification', 'HOD Report',
];

export const ASSET_COMPLIANCE = [
  { label: 'Fire Extinguishers', count: 124, value: 94 },
  { label: 'Hose Boxes', count: 46, value: 89 },
  { label: 'Hose Reels', count: 38, value: 92 },
  { label: 'Hydrant / Gate Valves', count: 31, value: 87 },
  { label: 'Fire Hoses', count: 29, value: 91 },
  { label: 'Other Fire Systems', count: 18, value: 96 },
];

export const CRITICAL_ALERTS = [
  { id: 'FE-PRD-044', title: 'Pressure abnormal', tag: 'CRITICAL', meta: 'Production Bay-2 • Department action required immediately.' },
  { id: 'HR-WH-008', title: 'Hose reel leakage', tag: 'HIGH', meta: 'Warehouse • Maintenance assigned.' },
  { id: 'HV-UTL-012', title: 'Valve inaccessible', tag: 'HIGH', meta: 'Utilities • Access obstruction to be removed.' },
  { id: 'HB-ASM-021', title: 'Hose box glass damaged', tag: 'OPEN', meta: 'Assembly • Replace enclosure.' },
];

let auditSeq = 92;
export function nextAuditNo() { return `FIRE-AUD-2026-${auditSeq++}`; }

let actionSeq = 89;
export function nextActionId() { return `ACT-2026-${actionSeq++}`; }

let serviceSeq = 45;
export function nextServiceId() { return `SR-2026-${serviceSeq++}`; }
