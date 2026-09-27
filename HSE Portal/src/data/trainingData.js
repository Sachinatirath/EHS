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

// Extra master details used by the employee training profile.
export const EMPLOYEE_DETAILS = {
  'EMP-1001': { type: 'Employee', joined: '2021-04-12', hod: 'Mahesh Patil' },
  'EMP-1002': { type: 'Employee', joined: '2019-08-01', hod: 'Sanjay Rao' },
  'EMP-1003': { type: 'Employee', joined: '2022-01-17', hod: 'Kavitha M' },
  'EMP-1004': { type: 'Employee', joined: '2018-06-25', hod: 'Sanjay Rao' },
  'EMP-1005': { type: 'Contractor', joined: '2023-03-09', hod: 'Naveen K' },
  'EMP-1006': { type: 'Employee', joined: '2017-11-20', hod: 'Mahesh Patil' },
  'EMP-1007': { type: 'Contractor', joined: '2024-02-05', hod: 'Girish H' },
  'EMP-1008': { type: 'Employee', joined: '2020-09-14', hod: 'Mahesh Patil' },
  'EMP-1009': { type: 'Employee', joined: '2019-12-02', hod: 'Rekha S' },
  'EMP-1010': { type: 'Contractor', joined: '2022-07-11', hod: 'Girish H' },
};

// Training attended per employee. Dates are ISO (YYYY-MM-DD); status is derived from expiry.
export const EMPLOYEE_TRAINING_RECORDS = [
  { empId: 'EMP-1001', training: 'Safety Induction', sessionId: 'TR-0912', date: '2026-01-12', trainer: 'EHS Team', score: 92, validity: 12, expiry: '2027-01-12', certNo: 'TC-26-0112' },
  { empId: 'EMP-1001', training: 'General Safety', sessionId: 'TR-0931', date: '2026-03-05', trainer: 'EHS Team', score: 88, validity: 12, expiry: '2027-03-05', certNo: 'TC-26-0305' },
  { empId: 'EMP-1001', training: 'Fire & Emergency', sessionId: 'TR-004', date: '2026-07-25', trainer: 'Fire Officer', score: 90, validity: 12, expiry: '2027-07-25', certNo: 'TC-26-0725' },
  { empId: 'EMP-1001', training: 'Work at Height', sessionId: 'TR-0968', date: '2026-07-29', trainer: 'External Trainer', score: 94, validity: 12, expiry: '2027-07-29', certNo: 'CERT-001' },
  { empId: 'EMP-1001', training: 'Job-Specific', sessionId: 'TR-0874', date: '2025-11-10', trainer: 'Line Supervisor', score: 85, validity: 12, expiry: '2026-11-10', certNo: 'TC-25-1110' },

  { empId: 'EMP-1002', training: 'Safety Induction', sessionId: 'TR-002', date: '2026-07-28', trainer: 'EHS Team', score: 88, validity: 12, expiry: '2027-07-28', certNo: 'TC-26-0728' },
  { empId: 'EMP-1002', training: 'General Safety', sessionId: 'TR-0851', date: '2025-10-15', trainer: 'EHS Team', score: 81, validity: 12, expiry: '2026-10-15', certNo: 'TC-25-1015' },
  { empId: 'EMP-1002', training: 'LOTO', sessionId: 'TR-0846', date: '2025-10-10', trainer: 'EHS Team', score: 86, validity: 12, expiry: '2026-10-10', certNo: 'CERT-002' },
  { empId: 'EMP-1002', training: 'Fire & Emergency', sessionId: 'TR-004', date: '2026-07-25', trainer: 'Fire Officer', score: 84, validity: 12, expiry: '2027-07-25', certNo: 'TC-26-0726' },

  { empId: 'EMP-1003', training: 'Safety Induction', sessionId: 'TR-0702', date: '2025-07-18', trainer: 'EHS Team', score: 76, validity: 12, expiry: '2026-07-18', certNo: 'TC-25-0718' },
  { empId: 'EMP-1003', training: 'General Safety', sessionId: 'TR-0905', date: '2026-02-02', trainer: 'EHS Team', score: 79, validity: 12, expiry: '2027-02-02', certNo: 'TC-26-0202' },
  { empId: 'EMP-1003', training: 'Forklift Operator', sessionId: 'TR-0588', date: '2024-07-18', trainer: 'External Trainer', score: 72, validity: 24, expiry: '2026-07-18', certNo: 'CERT-003' },

  { empId: 'EMP-1004', training: 'Safety Induction', sessionId: 'TR-002', date: '2026-07-28', trainer: 'EHS Team', score: 95, validity: 12, expiry: '2027-07-28', certNo: 'TC-26-0729' },
  { empId: 'EMP-1004', training: 'General Safety', sessionId: 'TR-0944', date: '2026-04-10', trainer: 'EHS Team', score: 93, validity: 12, expiry: '2027-04-10', certNo: 'TC-26-0410' },
  { empId: 'EMP-1004', training: 'LOTO', sessionId: 'TR-0958', date: '2026-05-15', trainer: 'EHS Team', score: 97, validity: 12, expiry: '2027-05-15', certNo: 'TC-26-0515' },
  { empId: 'EMP-1004', training: 'Work at Height', sessionId: 'TR-0966', date: '2026-06-20', trainer: 'External Trainer', score: 91, validity: 12, expiry: '2027-06-20', certNo: 'TC-26-0620' },
  { empId: 'EMP-1004', training: 'Fire & Emergency', sessionId: 'TR-0880', date: '2025-11-12', trainer: 'Fire Officer', score: 96, validity: 12, expiry: '2026-11-12', certNo: 'CERT-004' },

  { empId: 'EMP-1005', training: 'Safety Induction', sessionId: 'TR-0901', date: '2026-02-01', trainer: 'EHS Team', score: 83, validity: 12, expiry: '2027-02-01', certNo: 'TC-26-0201' },
  { empId: 'EMP-1005', training: 'General Safety', sessionId: 'TR-0822', date: '2025-09-22', trainer: 'EHS Team', score: 78, validity: 12, expiry: '2026-09-22', certNo: 'TC-25-0922' },
  { empId: 'EMP-1005', training: 'Defensive Driving', sessionId: 'TR-0611', date: '2024-10-20', trainer: 'External Trainer', score: 80, validity: 24, expiry: '2026-10-20', certNo: 'CERT-005' },

  { empId: 'EMP-1006', training: 'Safety Induction', sessionId: 'TR-0915', date: '2026-01-20', trainer: 'EHS Team', score: 96, validity: 12, expiry: '2027-01-20', certNo: 'TC-26-0120' },
  { empId: 'EMP-1006', training: 'General Safety', sessionId: 'TR-001', date: '2026-07-29', trainer: 'EHS Team', score: 94, validity: 12, expiry: '2027-07-29', certNo: 'TC-26-0730' },
  { empId: 'EMP-1006', training: 'Fire & Emergency', sessionId: 'TR-004', date: '2026-07-25', trainer: 'Fire Officer', score: 98, validity: 12, expiry: '2027-07-25', certNo: 'TC-26-0727' },
  { empId: 'EMP-1006', training: 'Incident Communication', sessionId: 'TR-0950', date: '2026-04-28', trainer: 'EHS Manager', score: 92, validity: 12, expiry: '2027-04-28', certNo: 'TC-26-0428' },

  { empId: 'EMP-1007', training: 'Safety Induction', sessionId: 'TR-0898', date: '2026-02-05', trainer: 'EHS Team', score: 87, validity: 12, expiry: '2027-02-05', certNo: 'TC-26-0205' },
  { empId: 'EMP-1007', training: 'General Safety', sessionId: 'TR-001', date: '2026-07-29', trainer: 'EHS Team', score: 90, validity: 12, expiry: '2027-07-29', certNo: 'TC-26-0731' },
  { empId: 'EMP-1007', training: 'LOTO', sessionId: 'TR-005', date: '2026-08-03', trainer: 'EHS Team', score: 84, validity: 12, expiry: '2027-08-03', certNo: 'TC-26-0803' },
  { empId: 'EMP-1007', training: 'Electrical Safety', sessionId: 'TR-0840', date: '2025-10-05', trainer: 'Electrical Engineer', score: 89, validity: 12, expiry: '2026-10-05', certNo: 'TC-25-1005' },

  { empId: 'EMP-1008', training: 'Safety Induction', sessionId: 'TR-0921', date: '2026-02-18', trainer: 'EHS Team', score: 91, validity: 12, expiry: '2027-02-18', certNo: 'TC-26-0218' },
  { empId: 'EMP-1008', training: 'General Safety', sessionId: 'TR-001', date: '2026-07-29', trainer: 'EHS Team', score: 89, validity: 12, expiry: '2027-07-29', certNo: 'TC-26-0732' },
  { empId: 'EMP-1008', training: 'Fire & Emergency', sessionId: 'TR-004', date: '2026-07-25', trainer: 'Fire Officer', score: 93, validity: 12, expiry: '2027-07-25', certNo: 'TC-26-0733' },
  { empId: 'EMP-1008', training: 'Job-Specific', sessionId: 'TR-0937', date: '2026-03-22', trainer: 'Line Supervisor', score: 88, validity: 12, expiry: '2027-03-22', certNo: 'TC-26-0322' },

  { empId: 'EMP-1009', training: 'Safety Induction', sessionId: 'TR-0908', date: '2026-02-09', trainer: 'EHS Team', score: 94, validity: 12, expiry: '2027-02-09', certNo: 'TC-26-0209' },
  { empId: 'EMP-1009', training: 'Electrical Safety', sessionId: 'TR-0947', date: '2026-04-16', trainer: 'Electrical Engineer', score: 97, validity: 12, expiry: '2027-04-16', certNo: 'TC-26-0416' },
  { empId: 'EMP-1009', training: 'LOTO', sessionId: 'TR-0958', date: '2026-05-15', trainer: 'EHS Team', score: 95, validity: 12, expiry: '2027-05-15', certNo: 'TC-26-0516' },
  { empId: 'EMP-1009', training: 'Fire & Emergency', sessionId: 'TR-0866', date: '2025-10-30', trainer: 'Fire Officer', score: 90, validity: 12, expiry: '2026-10-30', certNo: 'TC-25-1030' },

  { empId: 'EMP-1010', training: 'Safety Induction', sessionId: 'TR-0925', date: '2026-03-02', trainer: 'EHS Team', score: 80, validity: 12, expiry: '2027-03-02', certNo: 'TC-26-0302' },
  { empId: 'EMP-1010', training: 'General Safety', sessionId: 'TR-0781', date: '2025-08-01', trainer: 'EHS Team', score: 74, validity: 12, expiry: '2026-08-01', certNo: 'TC-25-0801' },
  { empId: 'EMP-1010', training: 'Electrical Safety', sessionId: 'TR-0760', date: '2025-07-09', trainer: 'Electrical Engineer', score: 71, validity: 12, expiry: '2026-07-09', certNo: 'CERT-006' },
];

export const TRAINING_RECORD_STATUS_PILL = {
  Valid: 'pill-green',
  'Expiring Soon': 'pill-amber',
  Expired: 'pill-red',
  'Not Attended': 'pill-slate',
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Days until expiry (negative once expired) and the derived status.
export function trainingValidity(expiryIso, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = expiryIso.split('-').map(Number);
  const daysLeft = Math.round((new Date(y, m - 1, d) - start) / DAY_MS);
  const status = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid';
  return { daysLeft, status };
}

export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d).padStart(2, '0')}-${months[m - 1]}-${y}`;
}

// Full training picture for one employee: attended records (with derived status),
// mandatory trainings from the role matrix that are not attended, and counts.
export function employeeTrainingProfile(employee, today = new Date()) {
  const details = { ...EMPLOYEE_DETAILS[employee.id], ...employee };
  const records = EMPLOYEE_TRAINING_RECORDS
    .filter((r) => r.empId === employee.id)
    .map((r) => ({ ...r, ...trainingValidity(r.expiry, today) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const matrix = TRAINING_MATRIX.find((m) => m.department === employee.department && m.role === employee.role);
  const required = matrix ? matrix.training.split(';').map((t) => t.trim()) : [];
  const attended = new Set(records.map((r) => r.training));
  const pending = required.filter((t) => !attended.has(t));

  const count = (s) => records.filter((r) => r.status === s).length;
  return {
    details,
    records,
    required,
    pending,
    validity: matrix?.validity,
    nextExpiry: records.find((r) => r.daysLeft >= 0) || null,
    summary: { attended: records.length, valid: count('Valid'), expiring: count('Expiring Soon'), expired: count('Expired'), pending: pending.length },
  };
}

// Detailed attendee list for a session: employee master info + certificate/expiry from the
// training record. `extra` holds participants typed into a newly created session.
export function sessionAttendeeDetails(session, extra = [], today = new Date()) {
  const base = (SESSION_ATTENDEES[session.id] || []).map((a) => ({ ...a }));
  const list = base.concat(extra.map((p) => ({ empId: p.employeeId, name: p.name, department: p.department, role: p.role, attendance: p.attendance })));

  return list.map((a) => {
    const emp = EMPLOYEES.find((e) => e.id === a.empId) || {};
    const record = EMPLOYEE_TRAINING_RECORDS.find((r) => r.empId === a.empId && r.sessionId === session.id);
    const validity = record ? trainingValidity(record.expiry, today) : null;
    let status = a.attendance;
    if (a.attendance === 'Present') status = validity ? validity.status : 'Pending Certificate';
    return {
      empId: a.empId,
      name: a.name || emp.name || '—',
      department: a.department || emp.department || '—',
      role: a.role || emp.role || '—',
      attendance: a.attendance,
      startDate: session.startDate,
      completedOn: record?.date || null,
      score: record?.score ?? null,
      certNo: record?.certNo || null,
      expiry: record?.expiry || null,
      daysLeft: validity?.daysLeft ?? null,
      status,
    };
  });
}

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

export const SHIFT_OPTIONS = [
  { value: 'A', label: 'Shift A' },
  { value: 'B', label: 'Shift B' },
  { value: 'C', label: 'Shift C' },
  { value: 'GA', label: 'GA (General)' },
];

export const CERT_VALIDITY_OPTIONS = ['6 Months', '12 Months', '24 Months', '36 Months'];

// Dates are ISO (YYYY-MM-DD). startDate/endDate cover multi-day sessions.
export const TRAINING_SESSIONS = [
  { id: 'TR-001', topic: 'General Safety Awareness', startDate: '2026-07-29', endDate: '2026-07-29', trainer: 'EHS Team', location: 'Training Hall 1', shift: 'GA', validity: 12, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-002', topic: 'Safety Induction', startDate: '2026-07-28', endDate: '2026-07-28', trainer: 'EHS Team', location: 'Training Hall 1', shift: 'A', validity: 12, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-003', topic: 'Work at Height', startDate: '2026-10-08', endDate: '2026-10-09', trainer: 'External Trainer', location: 'Maintenance Bay', shift: 'B', validity: 12, status: 'Scheduled', hodReview: 'Pending HOD' },
  { id: 'TR-004', topic: 'Fire & Emergency', startDate: '2026-07-25', endDate: '2026-07-25', trainer: 'Fire Officer', location: 'Fire Station Yard', shift: 'GA', validity: 12, status: 'Completed', hodReview: 'Approved' },
  { id: 'TR-005', topic: 'LOTO', startDate: '2026-08-02', endDate: '2026-08-03', trainer: 'EHS Team', location: 'Utilities Block', shift: 'C', validity: 12, status: 'Completed', hodReview: 'Modification Required' },
];

// Who was nominated for each session and whether they attended.
// Present attendees of completed sessions have a matching EMPLOYEE_TRAINING_RECORDS entry.
export const SESSION_ATTENDEES = {
  'TR-001': [
    { empId: 'EMP-1006', attendance: 'Present' },
    { empId: 'EMP-1007', attendance: 'Present' },
    { empId: 'EMP-1008', attendance: 'Present' },
    { empId: 'EMP-1005', attendance: 'Absent' },
  ],
  'TR-002': [
    { empId: 'EMP-1002', attendance: 'Present' },
    { empId: 'EMP-1004', attendance: 'Present' },
  ],
  'TR-003': [
    { empId: 'EMP-1002', attendance: 'Registered' },
    { empId: 'EMP-1009', attendance: 'Registered' },
    { empId: 'EMP-1010', attendance: 'Registered' },
  ],
  'TR-004': [
    { empId: 'EMP-1001', attendance: 'Present' },
    { empId: 'EMP-1002', attendance: 'Present' },
    { empId: 'EMP-1006', attendance: 'Present' },
    { empId: 'EMP-1008', attendance: 'Present' },
    { empId: 'EMP-1003', attendance: 'Absent' },
    { empId: 'EMP-1010', attendance: 'Absent' },
  ],
  'TR-005': [
    { empId: 'EMP-1007', attendance: 'Present' },
    { empId: 'EMP-1010', attendance: 'Absent' },
  ],
};

export const ATTENDEE_STATUS_PILL = {
  Valid: 'pill-green',
  'Expiring Soon': 'pill-amber',
  Expired: 'pill-red',
  Absent: 'pill-red',
  Registered: 'pill-blue',
  'Pending Certificate': 'pill-amber',
};


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
  { cert: 'CERT-002', empId: 'EMP-1002', name: 'Suresh B', training: 'LOTO', expiry: '10-Oct-2026', status: 'Expiring Soon' },
  { cert: 'CERT-003', empId: 'EMP-1003', name: 'Anil Kumar', training: 'Forklift Operator', expiry: '18-Jul-2026', status: 'Expired' },
  { cert: 'CERT-004', empId: 'EMP-1004', name: 'Meena R', training: 'Fire & Emergency', expiry: '12-Nov-2026', status: 'Valid' },
  { cert: 'CERT-005', empId: 'EMP-1005', name: 'Kiran S', training: 'Defensive Driving', expiry: '20-Oct-2026', status: 'Renewal Pending' },
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
