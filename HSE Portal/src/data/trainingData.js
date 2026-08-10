export const DEPARTMENTS = ['Production', 'Maintenance', 'Stores', 'Logistics', 'Utilities', 'Facilities', 'Admin'];

export const EMPLOYEES = [
  { id: 'EMP-1001', name: 'Ravi Kumar', department: 'Production', role: 'Operator', status: 'Compliant', compliance: 93, history: 5 },
  { id: 'EMP-1002', name: 'Suresh B', department: 'Maintenance', role: 'Technician', status: 'Training Due', compliance: 88, history: 4 },
  { id: 'EMP-1003', name: 'Anil Kumar', department: 'Stores', role: 'Store Executive', status: 'Expired', compliance: 75, history: 3 },
  { id: 'EMP-1004', name: 'Meena R', department: 'Maintenance', role: 'Engineer', status: 'Compliant', compliance: 100, history: 4 },
  { id: 'EMP-1005', name: 'Kiran S', department: 'Logistics', role: 'Driver', status: 'Action Required', compliance: 82, history: 0 },
  { id: 'EMP-1006', name: 'Priya N', department: 'Production', role: 'Supervisor', status: 'Compliant', compliance: 100, history: 0 },
  { id: 'EMP-1007', name: 'Arun P', department: 'Utilities', role: 'Technician', status: 'Training Due', compliance: 92, history: 0 },
  { id: 'EMP-1008', name: 'Ramesh G', department: 'Production', role: 'Operator', status: 'Compliant', compliance: 100, history: 0 },
  { id: 'EMP-1009', name: 'Deepa S', department: 'Facilities', role: 'Electrician', status: 'Compliant', compliance: 96, history: 3 },
  { id: 'EMP-1010', name: 'Vijay M', department: 'Utilities', role: 'Technician', status: 'Expired', compliance: 70, history: 2 },
];

export const STATUS_PILL = {
  Compliant: 'pill-green',
  'Training Due': 'pill-amber',
  Expired: 'pill-red',
  'Action Required': 'pill-blue',
};

export const EMPLOYEE_TYPES = ['Employee', 'Contractor'];

export const TRAINING_TOPICS = [
  'General Safety Awareness', 'Safety Induction', 'Work at Height', 'Fire & Emergency', 'LOTO',
  'Hot Work', 'Lifting & Rigging', 'Forklift Operator', 'Electrical Safety', 'Defensive Driving',
];

export const CERT_VALIDITY_OPTIONS = ['6 Months', '12 Months', '24 Months', '36 Months'];

export const TRAINING_SESSIONS = [
  { id: 'TR-001', topic: 'General Safety Awareness', date: '29-Jul-2026', trainer: 'EHS Team', participants: 42, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-002', topic: 'Safety Induction', date: '28-Jul-2026', trainer: 'EHS Team', participants: 18, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-003', topic: 'Work at Height', date: '30-Jul-2026', trainer: 'External Trainer', participants: 22, status: 'Scheduled', hodReview: 'Pending HOD' },
  { id: 'TR-004', topic: 'Fire & Emergency', date: '25-Jul-2026', trainer: 'Fire Officer', participants: 86, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-005', topic: 'LOTO', date: '02-Aug-2026', trainer: 'EHS Team', participants: 16, status: 'Completed', hodReview: 'Modification Required' },
];

export const SESSION_STATUS_PILL = {
  Completed: 'pill-green',
  Scheduled: 'pill-blue',
};

export const SESSION_HOD_PILL = {
  Approved: 'pill-green',
  'Pending HOD': 'pill-amber',
  'Modification Required': 'pill-amber',
};

let sessionSeq = 90000 + Math.floor(Math.random() * 9000);
export function nextSessionId() { return `TR-${sessionSeq++}`; }

export const TRAINING_MATRIX = [
  { department: 'Production', role: 'Operator', training: 'Safety Induction; General Safety; Fire & Emergency; Job-Specific', validity: '12 months' },
  { department: 'Production', role: 'Supervisor', training: 'Safety Induction; General Safety; Fire & Emergency; Incident Communication', validity: '12 months' },
  { department: 'Maintenance', role: 'Technician', training: 'Safety Induction; General Safety; LOTO; Work at Height; Fire & Emergency', validity: '12 months' },
  { department: 'Maintenance', role: 'Engineer', training: 'Safety Induction; General Safety; LOTO; Work at Height; Fire & Emergency', validity: '12 months' },
  { department: 'Stores', role: 'Store Executive', training: 'Safety Induction; General Safety; Fire & Emergency', validity: '12 months' },
  { department: 'Logistics', role: 'Driver', training: 'Safety Induction; General Safety; Defensive Driving; Emergency', validity: '12 months' },
  { department: 'Utilities', role: 'Technician', training: 'Safety Induction; General Safety; Electrical Safety; Fire & Emergency', validity: '12 months' },
  { department: 'Facilities', role: 'Electrician', training: 'Safety Induction; Electrical Safety; LOTO; Fire & Emergency', validity: '12 months' },
  { department: 'Admin', role: 'HR Executive', training: 'Safety Induction; General Safety; Emergency Awareness', validity: '12 months' },
];

export const CERTIFICATES = [
  { cert: 'CERT-001', empId: 'EMP-1001', name: 'Ravi Kumar', training: 'Work at Height', expiry: '29-Jul-2027', status: 'Valid' },
  { cert: 'CERT-002', empId: 'EMP-1002', name: 'Suresh B', training: 'LOTO', expiry: '05-Aug-2026', status: 'Expiring Soon' },
  { cert: 'CERT-003', empId: 'EMP-1003', name: 'Anil Kumar', training: 'Forklift Operator', expiry: '18-Jul-2026', status: 'Expired' },
  { cert: 'CERT-004', empId: 'EMP-1004', name: 'Meena R', training: 'Fire & Emergency', expiry: '12-Nov-2026', status: 'Valid' },
  { cert: 'CERT-005', empId: 'EMP-1005', name: 'Kiran S', training: 'Defensive Driving', expiry: '22-Sep-2026', status: 'Renewal Pending' },
  { cert: 'CERT-006', empId: 'EMP-1010', name: 'Vijay M', training: 'Electrical Safety', expiry: '09-Jul-2026', status: 'Expired' },
];

export const CERT_STATUS_PILL = {
  Valid: 'pill-green',
  'Expiring Soon': 'pill-amber',
  Expired: 'pill-red',
  'Renewal Pending': 'pill-amber',
};

export const SAFETY_INDUCTIONS = [
  { id: 'IND-001', empId: 'EMP-1001', name: 'Ravi Kumar', department: 'Production', date: '29-Jul-2026', score: 92, status: 'Valid' },
  { id: 'IND-002', empId: 'EMP-1002', name: 'Suresh B', department: 'Maintenance', date: '28-Jul-2026', score: 88, status: 'Valid' },
  { id: 'IND-003', empId: 'EMP-1003', name: 'Anil Kumar', department: 'Stores', date: '18-Jul-2025', score: 76, status: 'Expired' },
  { id: 'IND-004', empId: 'EMP-1004', name: 'Meena R', department: 'Maintenance', date: '29-Jul-2026', score: 95, status: 'Valid' },
];

export const SPECIAL_TRAININGS = [
  { key: 'hotwork', emoji: '🔥', title: 'Hot Work', desc: 'Fire watch, gas testing, permit controls and emergency response.', trained: 42, pct: 94 },
  { key: 'height', emoji: '↕️', title: 'Work at Height', desc: 'Harness, lifeline, anchor point, rescue and fall prevention.', trained: 68, pct: 91 },
  { key: 'loto', emoji: '⚡', title: 'LOTO', desc: 'Isolation, lock identification, verification and authorised competency.', trained: 54, pct: 96 },
  { key: 'rigging', emoji: '🏗️', title: 'Lifting & Rigging', desc: 'Web sling, lifting accessories, crane signals and safe lifting.', trained: 86, pct: 93 },
  { key: 'forklift', emoji: '🚚', title: 'Forklift Operator', desc: 'Operator competency, pre-use inspection and safe handling.', trained: 31, pct: 90 },
  { key: 'fire', emoji: '🧯', title: 'Fire & Emergency', desc: 'Extinguisher use, evacuation, emergency response and drills.', trained: 212, pct: 97 },
];

export const SAFETY_ALERTS = [
  { alert: 'SA-001', incident: 'INC-2026-014', title: 'Hand Injury During Material Handling', departments: 'Production, Stores', issued: '28-Jul-2026', status: 'Issued', ack: 96 },
  { alert: 'SA-002', incident: 'INC-2026-011', title: 'Near Miss - Fall From Height', departments: 'Maintenance', issued: '20-Jul-2026', status: 'Closed', ack: 100 },
  { alert: 'SA-003', incident: 'INC-2026-009', title: 'Fire Pump House Unsafe Condition', departments: 'Utilities', issued: '17-Jul-2026', status: 'Acknowledgement Pending', ack: 82 },
];

export const ALERT_STATUS_PILL = {
  Issued: 'pill-blue',
  Closed: 'pill-green',
  'Acknowledgement Pending': 'pill-amber',
};

let incidentSeq = 15;
export function nextIncidentId() { return `INC-2026-0${incidentSeq++}`; }

export const HOD_TRAINING_APPROVALS = [
  { id: 'APR-001', trainingId: 'TR-003', training: 'Work at Height', participants: 22, verification: 'EHS Verified', status: 'Pending HOD' },
  { id: 'APR-002', trainingId: 'TR-005', training: 'LOTO', participants: 16, verification: 'HOD Returned', status: 'Modification Required' },
  { id: 'APR-003', trainingId: 'TR-004', training: 'Fire & Emergency', participants: 86, verification: 'EHS Verified', status: 'Approved' },
  { id: 'APR-004', trainingId: 'TR-002', training: 'Safety Induction', participants: 18, verification: 'EHS Verified', status: 'Approved' },
];

export const APPROVAL_STATUS_PILL = {
  Approved: 'pill-green',
  'Pending HOD': 'pill-amber',
  'Modification Required': 'pill-amber',
};

export const NOTIFICATION_RULES = [
  { text: 'Training due in 30 days → Employee + HOD' },
  { text: 'Certificate expires in 30 / 15 / 7 days → Employee + HOD + EHS' },
  { text: 'Training record submitted → HOD approval notification' },
  { text: 'Rejected / modification required → Trainer + EHS' },
  { text: 'Incident communication → Concern departments + employees → acknowledgement tracking' },
];

export const ACTION_REQUIRED = [
  { text: '19 certificates need expiry follow-up.' },
  { text: '74 training renewals are due.' },
  { text: '7 records require HOD review.' },
];
