export const MOC_DEPARTMENTS = ['Production', 'Maintenance', 'Projects', 'Warehouse', 'EHS'];
export const MOC_CATEGORIES = ['Equipment', 'Process', 'Material/Chemical', 'People', 'Document', 'Temporary'];
export const CHANGE_TYPES = ['Permanent Change', 'Temporary Change'];
export const IMPACT_AREAS = ['Safety + Environment + Quality', 'Safety Only', 'Environment Only', 'Quality Only', 'Operational Only'];
export const PROCEDURE_COVERAGE = ['No — MOC required', 'Yes — no MOC required'];

export const RISK_PILL = { HIGH: 'pill-amber', MEDIUM: 'pill-amber', LOW: 'pill-green' };
export const STATUS_PILL = {
  RAISED: 'pill-slate',
  SCREENING: 'pill-blue',
  'RISK REVIEW': 'pill-blue',
  APPROVAL: 'pill-amber',
  IMPLEMENTATION: 'pill-violet',
  VERIFICATION: 'pill-blue',
  CLOSED: 'pill-green',
  REJECTED: 'pill-red',
  PENDING: 'pill-amber',
  APPROVED: 'pill-green',
  OPEN: 'pill-amber',
  'IN PROGRESS': 'pill-blue',
  OVERDUE: 'pill-red',
};

export const MOC_REGISTER = [
  { id: 'MOC-2026-041', title: 'EOT capacity upgrade below 20 ton', category: 'Equipment', department: 'Maintenance', hod: 'Maintenance HOD', risk: 'HIGH', status: 'RISK REVIEW', raised: '25-Jul-2026', target: '02-Aug-2026' },
  { id: 'MOC-2026-037', title: 'Introduction of new chemical cleaning agent', category: 'Material/Chemical', department: 'Production', hod: 'Production HOD', risk: 'HIGH', status: 'APPROVAL', raised: '21-Jul-2026', target: '30-Jul-2026' },
  { id: 'MOC-2026-029', title: 'Furnace burner and control modification', category: 'Equipment', department: 'Projects', hod: 'Project HOD', risk: 'HIGH', status: 'VERIFICATION', raised: '10-Jul-2026', target: '25-Jul-2026' },
  { id: 'MOC-2026-021', title: 'Contractor onboarding process change', category: 'People', department: 'EHS', hod: 'EHS HOD', risk: 'MEDIUM', status: 'IMPLEMENTATION', raised: '04-Jul-2026', target: '31-Jul-2026' },
  { id: 'MOC-2026-018', title: 'New web sling inspection process', category: 'Process', department: 'EHS', hod: 'Safety HOD', risk: 'MEDIUM', status: 'VERIFICATION', raised: '28-Jun-2026', target: '30-Jul-2026' },
  { id: 'MOC-2026-012', title: 'Forklift traffic segregation', category: 'Process', department: 'Warehouse', hod: 'Warehouse HOD', risk: 'LOW', status: 'CLOSED', raised: '10-Jun-2026', target: '12-Jun-2026' },
  { id: 'MOC-2026-008', title: 'New WMS document control workflow', category: 'Document', department: 'EHS', hod: 'EHS HOD', risk: 'LOW', status: 'CLOSED', raised: '02-Jun-2026', target: '06-Jun-2026' },
  { id: 'MOC-2026-004', title: 'Temporary production line bypass', category: 'Temporary', department: 'Production', hod: 'Production HOD', risk: 'HIGH', status: 'REJECTED', raised: '20-May-2026', target: '22-May-2026' },
];

export const STAGE_PIPELINE = [
  { label: 'Raised', count: 68 },
  { label: 'Screening', count: 9 },
  { label: 'Risk Review', count: 9 },
  { label: 'Approval', count: 6 },
  { label: 'Implementation', count: 8 },
  { label: 'Verification', count: 4 },
  { label: 'Closed', count: 32 },
];

export const CHANGE_CATEGORY_DISTRIBUTION = [
  { label: 'Equipment / Machinery', value: 27 },
  { label: 'Process / Method', value: 24 },
  { label: 'Documents / SOP / JSA', value: 18 },
  { label: 'People / Organisation', value: 13 },
  { label: 'Other', value: 18 },
];

export const CRITICAL_ALERTS = [
  { id: 'MOC-2026-041', title: 'EOT capacity upgrade', tag: 'HIGH', pillClass: 'pill-amber', meta: 'Structural / lifting risk assessment awaiting Engineering and Safety review.' },
  { id: 'MOC-2026-037', title: 'New chemical', tag: 'HIGH', pillClass: 'pill-amber', meta: 'SDS, chemical compatibility and emergency response actions pending.' },
  { id: 'MOC-2026-029', title: 'Furnace modification', tag: 'OVERDUE', pillClass: 'pill-red', meta: 'Pre-startup verification not yet completed.' },
  { id: 'MOC-2026-021', title: 'Contractor process', tag: 'OPEN', pillClass: 'pill-amber', meta: 'Training and competency action remains open.' },
];

export const RISK_REVIEW_QUEUE = MOC_REGISTER.filter((r) => r.status === 'RISK REVIEW' || r.status === 'SCREENING');

export const RISK_ASSESSMENTS = [
  { mocId: 'MOC-2026-041', hazard: 'Mechanical energy / lifting / structural integrity', initial: '4 × 5 = 20', level: 'HIGH', controls: 'Load test, SWL marking, competent operator, inspection, exclusion zone', residual: '2 × 3 = 6', status: 'RISK REVIEW' },
  { mocId: 'MOC-2026-037', hazard: 'Chemical exposure / compatibility', initial: '4 × 4 = 16', level: 'HIGH', controls: 'SDS, compatibility, spill control, PPE, emergency response', residual: '2 × 3 = 6', status: 'APPROVAL' },
];

export const MOC_ACTIONS = [
  { id: 'ACT-126', mocId: 'MOC-2026-041', control: 'Verify EOT structural capacity, SWL marking and load test certificate', department: 'Maintenance', owner: 'Maintenance Engineer', due: '30-Jul-2026', status: 'OPEN' },
  { id: 'ACT-127', mocId: 'MOC-2026-041', control: 'Update lifting plan, JSA and operator competency requirements', department: 'EHS', owner: 'Safety Officer', due: '31-Jul-2026', status: 'OPEN' },
  { id: 'ACT-121', mocId: 'MOC-2026-037', control: 'Obtain SDS and complete chemical compatibility assessment', department: 'Production', owner: 'Process Engineer', due: '27-Jul-2026', status: 'IN PROGRESS' },
  { id: 'ACT-118', mocId: 'MOC-2026-029', control: 'Complete pre-startup safety verification and interlock test', department: 'Projects', owner: 'Project Engineer', due: '25-Jul-2026', status: 'OVERDUE' },
  { id: 'ACT-110', mocId: 'MOC-2026-021', control: 'Complete contractor training and competency matrix update', department: 'EHS', owner: 'EHS Executive', due: '31-Jul-2026', status: 'OPEN' },
];

export const APPROVAL_QUEUE = [
  { mocId: 'MOC-2026-037', title: 'Introduction of new chemical cleaning agent', risk: 'HIGH', technical: 'APPROVED', deptHod: 'PENDING', safetyHod: 'PENDING', status: 'APPROVAL' },
];

export const PSSR_CHECKLIST = [
  { text: 'All MOC actions required before start are closed', tag: 'Mandatory', checked: true },
  { text: 'Updated HIRA / JSA / SOP / WMS available', tag: 'Document control', checked: true },
  { text: 'Equipment / machine guards and interlocks verified', tag: 'Engineering', checked: false },
  { text: 'Training / competency completed for affected persons', tag: 'HR / Dept', checked: false },
  { text: 'Emergency response / fire / spill arrangements updated', tag: 'EHS', checked: false },
  { text: 'Drawings, layout and identification boards updated', tag: 'Engineering', checked: false },
  { text: 'Permit requirements reviewed before execution', tag: 'Safety', checked: false },
];

export const IMPLEMENTATION_QUEUE = [
  { mocId: 'MOC-2026-041', title: 'EOT capacity upgrade', date: '02-Aug-2026', responsible: 'Maintenance HOD', pssr: 'OPEN', execution: 'IMPLEMENTATION' },
  { mocId: 'MOC-2026-037', title: 'New chemical', date: '30-Jul-2026', responsible: 'Production HOD', pssr: 'OPEN', execution: 'PENDING' },
];

export const VERIFICATION_CHECKLIST = [
  { text: 'Actual change matches approved scope', tag: 'Scope' },
  { text: 'No new uncontrolled hazards identified', tag: 'Safety' },
  { text: 'Controls are effective in field', tag: 'Effectiveness' },
  { text: 'Updated documents are available at point of use', tag: 'Documents' },
  { text: 'Employees / contractors understand the change', tag: 'Training' },
  { text: 'Performance / quality / environmental impact acceptable', tag: 'Performance' },
  { text: 'All temporary-change expiry controls addressed', tag: 'Closure' },
];

export const VERIFICATION_RESULTS = ['Effective — Close MOC', 'Partially Effective — Keep Open', 'Not Effective — Reopen Actions'];

export const VERIFICATION_QUEUE = [
  { mocId: 'MOC-2026-018', title: 'New web sling inspection process', verification: 'PENDING', openActions: 0, owner: 'EHS', closure: 'Awaiting verification' },
  { mocId: 'MOC-2026-012', title: 'Forklift traffic segregation', verification: 'APPROVED', openActions: 0, owner: 'Warehouse', closure: 'Closed 12-Jun-2026' },
];

export const AUDIT_TRAIL = [
  { datetime: '27-Jul-2026 10:40', mocId: 'MOC-2026-041', user: 'Safety Officer', action: 'Risk Review Started', comment: 'EOT capacity change requires structural, lifting and operational risk review', result: 'RISK REVIEW' },
  { datetime: '27-Jul-2026 09:55', mocId: 'MOC-2026-037', user: 'Production HOD', action: 'Approved with Conditions', comment: 'SDS and emergency response actions required before implementation', result: 'APPROVAL' },
  { datetime: '26-Jul-2026 16:20', mocId: 'MOC-2026-029', user: 'Project Engineer', action: 'PSSR Pending', comment: 'Interlock verification evidence not uploaded', result: 'OVERDUE' },
  { datetime: '25-Jul-2026 15:10', mocId: 'MOC-2026-021', user: 'EHS HOD', action: 'Action Assigned', comment: 'Training and competency action assigned', result: 'OPEN' },
  { datetime: '24-Jul-2026 13:40', mocId: 'MOC-2026-018', user: 'Safety Officer', action: 'Post-Change Review', comment: 'Field verification scheduled', result: 'VERIFICATION' },
  { datetime: '12-Jun-2026 17:10', mocId: 'MOC-2026-012', user: 'Safety HOD', action: 'MOC Closed', comment: 'Change verified effective; documents updated', result: 'CLOSED' },
];

export const DEPARTMENT_PERFORMANCE = [
  { department: 'Production', mocs: 21, highRisk: 2, openActions: 5, overdue: 1, closure: 92 },
  { department: 'Maintenance', mocs: 18, highRisk: 3, openActions: 6, overdue: 1, closure: 88 },
  { department: 'Projects', mocs: 14, highRisk: 1, openActions: 3, overdue: 1, closure: 90 },
  { department: 'Warehouse', mocs: 9, highRisk: 1, openActions: 2, overdue: 0, closure: 95 },
  { department: 'EHS', mocs: 6, highRisk: 0, openActions: 1, overdue: 0, closure: 100 },
];

export const MOC_WORKFLOW_STEPS = [
  { title: '1. Initiate', desc: 'Requester describes current state, proposed change and reason.' },
  { title: '2. Screening', desc: 'Confirm whether MOC is required and define affected functions.' },
  { title: '3. Risk Assessment', desc: 'HIRA / risk assessment, legal, environmental, quality and operational impacts.' },
  { title: '4. Action Assignment', desc: 'Concern department receives controls with owner and due date.' },
  { title: '5. Approval', desc: 'Technical → Department HOD → EHS / Safety HOD.' },
  { title: '6. Implementation / PSSR', desc: 'Execute only after approval; verify readiness before start-up.' },
  { title: '7. Post-Change Verification', desc: 'Verify effectiveness, update documents and close only after evidence.' },
];

export const NEW_MOC_STEPS = ['Initiate', 'Screening', 'Risk Review', 'Approval', 'Implement', 'Verify', 'Close'];

let mocSeq = 69;
export function nextMocId() { return `MOC-2026-${String(mocSeq++).padStart(3, '0')}`; }

let actionSeq = 128;
export function nextActionId() { return `ACT-${actionSeq++}`; }
