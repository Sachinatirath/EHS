export const DOC_TYPES = ['SOP', 'Policy', 'Manual', 'Procedure', 'Form', 'Guideline'];
export const DOC_DEPARTMENTS = ['EHS', 'Production', 'Maintenance', 'Warehouse', 'Projects', 'HR / Training', 'Quality'];
export const REVIEW_FREQUENCIES = ['Annual', 'Biennial', '3-Yearly', 'On Change Only'];
export const SUBMISSION_REASONS = ['New Document', 'Scheduled Review', 'Revision / Update', 'Regulatory Change', 'Obsolete / Withdraw'];

export const TYPE_PILL = { SOP: 'pill-blue', Policy: 'pill-violet', Manual: 'pill-pink', Procedure: 'pill-blue', Form: 'pill-green', Guideline: 'pill-amber' };
export const STATUS_PILL = {
  CURRENT: 'pill-blue',
  'UNDER REVIEW': 'pill-amber',
  REVISION: 'pill-orange',
  'AWAITING APPROVAL': 'pill-cyan',
  APPROVED: 'pill-blue',
  PENDING: 'pill-violet',
  OVERDUE: 'pill-red',
};
export const PRIORITY_PILL = { OVERDUE: 'pill-red', PENDING: 'pill-violet' };

const DEFAULT_REVIEWERS = [{ code: 'SO', name: 'Safety Officer' }, { code: 'ED', name: 'EHS Director' }];

// Single canonical document set — every screen (Inbox, All Documents, Pending Review,
// My Assignments, Approvals, Master Register) is derived from this by filtering on `status`.
export const DOCUMENTS = [
  { id: 'EHS-SOP-041', title: 'Confined Space Entry Procedure', type: 'SOP', version: 'Rev 2.3', department: 'Production', author: 'Production HOD', issueDate: '25-Jan-2026', reviewDue: '25-Jan-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-POL-007', title: 'Contractor HSE Policy', type: 'Policy', version: 'Rev 1.2', department: 'EHS', author: 'EHS Director', issueDate: '15-Mar-2025', reviewDue: '15-Mar-2027', status: 'UNDER REVIEW', priority: 'OVERDUE', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-MAN-002', title: 'Emergency Response Manual', type: 'Manual', version: 'Rev 3.0', department: 'EHS', author: 'Safety Officer', issueDate: '10-Nov-2025', reviewDue: '10-Nov-2026', status: 'UNDER REVIEW', priority: 'OVERDUE', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-PROC-018', title: 'Chemical Spill Response Procedure', type: 'Procedure', version: 'Rev 2.1', department: 'Warehouse', author: 'Warehouse HOD', issueDate: '20-Jun-2025', reviewDue: '20-Jun-2026', status: 'REVISION', priority: 'OVERDUE', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-FRM-009', title: 'Job Safety Analysis (JSA) Form', type: 'Form', version: 'Rev 1.8', department: 'EHS', author: 'Safety Officer', issueDate: '01-Feb-2026', reviewDue: '01-Feb-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-GDL-003', title: 'Personal Protective Equipment (PPE) Selection Guideline', type: 'Guideline', version: 'Rev 2.0', department: 'EHS', author: 'EHS HOD', issueDate: '10-Sep-2025', reviewDue: '10-Sep-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-SOP-028', title: 'Lockout/Tagout (LOTO) Procedure', type: 'SOP', version: 'Rev 1.5', department: 'Maintenance', author: 'Maintenance HOD', issueDate: '15-Aug-2025', reviewDue: '15-Aug-2026', status: 'UNDER REVIEW', priority: 'PENDING', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-SOP-035', title: 'Hot Work Permit Procedure', type: 'SOP', version: 'Rev 2.1', department: 'Maintenance', author: 'Safety Officer', issueDate: '05-Oct-2025', reviewDue: '05-Oct-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-POL-012', title: 'Alcohol & Drug-Free Workplace Policy', type: 'Policy', version: 'Rev 1.0', department: 'HR / Training', author: 'HR HOD', issueDate: '12-Dec-2025', reviewDue: '12-Dec-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-PROC-005', title: 'Incident Reporting & Investigation Procedure', type: 'Procedure', version: 'Rev 3.2', department: 'EHS', author: 'EHS HOD', issueDate: '01-Jul-2025', reviewDue: '01-Jul-2026', status: 'AWAITING APPROVAL', priority: 'PENDING' },
  { id: 'EHS-MAN-001', title: 'EHS Management System Manual', type: 'Manual', version: 'Rev 2.1', department: 'EHS', author: 'EHS Director', issueDate: '01-Sep-2025', reviewDue: '01-Sep-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-FRM-015', title: 'Safety Observation Card', type: 'Form', version: 'Rev 1.2', department: 'EHS', author: 'Safety Officer', issueDate: '20-Oct-2025', reviewDue: '20-Oct-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-SOP-050', title: 'Working at Height Procedure', type: 'SOP', version: 'Rev 1.0', department: 'Projects', author: 'Projects HOD', issueDate: '01-Jun-2026', reviewDue: '01-Jun-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-GDL-007', title: 'Chemical Handling & Storage Guideline', type: 'Guideline', version: 'Rev 2.2', department: 'Warehouse', author: 'Warehouse HOD', issueDate: '15-Mar-2025', reviewDue: '15-Mar-2027', status: 'REVISION', priority: 'PENDING', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-SOP-012', title: 'Forklift Safety Operation', type: 'SOP', version: 'Rev 1.8', department: 'Warehouse', author: 'Warehouse HOD', issueDate: '01-Apr-2026', reviewDue: '01-Apr-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-POL-004', title: 'Environmental Policy', type: 'Policy', version: 'Rev 1.5', department: 'EHS', author: 'EHS Director', issueDate: '05-Jan-2026', reviewDue: '05-Jan-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-PROC-022', title: 'Training & Competency Procedure', type: 'Procedure', version: 'Rev 2.0', department: 'HR / Training', author: 'HR HOD', issueDate: '20-Feb-2026', reviewDue: '20-Feb-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-FRM-022', title: 'Permit to Work Form', type: 'Form', version: 'Rev 1.6', department: 'EHS', author: 'Safety Officer', issueDate: '15-Dec-2025', reviewDue: '15-Dec-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-SOP-040', title: 'Confined Space Rescue Procedure', type: 'SOP', version: 'Rev 1.1', department: 'EHS', author: 'Safety Officer', issueDate: '01-Feb-2026', reviewDue: '01-Feb-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-POL-002', title: 'HSE Policy Statement', type: 'Policy', version: 'Rev 2.0', department: 'EHS', author: 'EHS Director', issueDate: '01-Jan-2026', reviewDue: '01-Jan-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-PROC-008', title: 'Waste Management Procedure', type: 'Procedure', version: 'Rev 2.1', department: 'EHS', author: 'EHS HOD', issueDate: '01-Sep-2025', reviewDue: '01-Sep-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-GDL-001', title: 'Office Safety Guideline', type: 'Guideline', version: 'Rev 1.0', department: 'EHS', author: 'EHS HOD', issueDate: '01-Mar-2026', reviewDue: '01-Mar-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-POL-010', title: 'Document Control Policy', type: 'Policy', version: 'Rev 1.3', department: 'EHS', author: 'EHS Director', issueDate: '01-Jun-2025', reviewDue: '01-Jun-2027', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-FRM-001', title: 'HIRA Risk Assessment Form', type: 'Form', version: 'Rev 2.5', department: 'EHS', author: 'Safety Officer', issueDate: '01-Dec-2025', reviewDue: '01-Dec-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-PROC-002', title: 'Contractor Safety Management Procedure', type: 'Procedure', version: 'Rev 1.4', department: 'EHS', author: 'EHS HOD', issueDate: '10-Oct-2025', reviewDue: '10-Oct-2026', status: 'CURRENT', priority: 'PENDING' },
  { id: 'EHS-SOP-019', title: 'Electrical Safety Procedure', type: 'SOP', version: 'Rev 1.3', department: 'Maintenance', author: 'Maintenance HOD', issueDate: '10-Nov-2025', reviewDue: '10-Nov-2026', status: 'UNDER REVIEW', priority: 'PENDING', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-SOP-009', title: 'Machine Guarding & Safety', type: 'SOP', version: 'Rev 1.4', department: 'Maintenance', author: 'Maintenance HOD', issueDate: '10-Jun-2025', reviewDue: '10-Jun-2026', status: 'REVISION', priority: 'PENDING', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-MAN-003', title: 'Quality Management Manual', type: 'Manual', version: 'Rev 1.2', department: 'Quality', author: 'Quality HOD', issueDate: '15-Apr-2025', reviewDue: '15-Apr-2027', status: 'UNDER REVIEW', priority: 'PENDING', reviewers: DEFAULT_REVIEWERS },
  { id: 'EHS-SOP-006', title: 'HIRA (Hazard Identification & Risk Assessment) Procedure', type: 'SOP', version: 'Rev 3.0', department: 'EHS', author: 'EHS HOD', issueDate: '01-Aug-2025', reviewDue: '01-Aug-2026', status: 'AWAITING APPROVAL', priority: 'PENDING' },
];

// Review Inbox = anything not yet CURRENT (needs attention from a reviewer).
export const REVIEW_INBOX = DOCUMENTS.filter((d) => d.status !== 'CURRENT');

// Pending Review = actively under review or revision (excludes items already awaiting final approval).
export const PENDING_REVIEW = DOCUMENTS
  .filter((d) => d.status === 'UNDER REVIEW' || d.status === 'REVISION')
  .map((d) => ({ ...d, daysInReview: daysBetween(d.issueDate) }));

// My Assignments = the subset of Pending Review specifically assigned to the signed-in reviewer.
export const MY_ASSIGNMENTS = ['EHS-POL-007', 'EHS-MAN-002', 'EHS-PROC-018', 'EHS-SOP-028'].map((id) => {
  const doc = DOCUMENTS.find((d) => d.id === id);
  return { ...doc, assignedBy: 'EHS Director', assignedDate: doc.issueDate, dueDate: doc.reviewDue };
});

// Approvals = review complete, sitting in the final sign-off queue.
export const APPROVALS_QUEUE = DOCUMENTS
  .filter((d) => d.status === 'AWAITING APPROVAL')
  .map((d) => ({ ...d, reviewCompleted: 'APPROVED', hodApproval: 'PENDING', ehsApproval: 'PENDING', docControl: 'AWAITING APPROVAL' }));

// Master Register = only currently issued (CURRENT) controlled documents.
export const MASTER_REGISTER = DOCUMENTS.filter((d) => d.status === 'CURRENT');

function daysBetween(dateStr) {
  const [d, m, y] = dateStr.split('-');
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const submitted = new Date(Number(y), months[m], Number(d));
  const today = new Date(2026, 7, 9);
  return Math.max(0, Math.round((today - submitted) / 86400000));
}

export const REVIEW_HISTORY = [
  { datetime: '28-Jul-2026 09:15', doc: 'EHS-POL-007', user: 'EHS Director', action: 'Review Assigned', comment: 'Biennial review of Contractor HSE Policy', result: 'UNDER REVIEW' },
  { datetime: '27-Jul-2026 14:30', doc: 'EHS-PROC-005', user: 'Safety Officer', action: 'Revision Requested', comment: 'Incident classification and investigation timeline needs alignment with new regulatory requirement', result: 'REVISION' },
  { datetime: '26-Jul-2026 11:00', doc: 'EHS-SOP-041', user: 'Safety Officer', action: 'Comments Submitted', comment: 'Added gas monitoring frequency and rescue plan requirements. Minor edits.', result: 'UNDER REVIEW' },
  { datetime: '25-Jul-2026 16:45', doc: 'EHS-MAN-002', user: 'EHS Director', action: 'Review Assigned', comment: 'Fire drill findings need to be incorporated.', result: 'UNDER REVIEW' },
  { datetime: '24-Jul-2026 10:20', doc: 'EHS-SOP-028', user: 'Maintenance HOD', action: 'Approved — No Changes', comment: 'LOTO procedure remains adequate.', result: 'APPROVED' },
  { datetime: '22-Jul-2026 13:10', doc: 'EHS-SOP-009', user: 'Maintenance HOD', action: 'Review Assigned', comment: 'Machine guarding standard updated to reflect new machinery.', result: 'UNDER REVIEW' },
  { datetime: '20-Jul-2026 09:30', doc: 'EHS-PROC-018', user: 'Warehouse HOD', action: 'Revisions Submitted', comment: 'Chemical spill procedure updated with new SDS references. Sent for re-review.', result: 'REVISION' },
  { datetime: '18-Jul-2026 15:00', doc: 'EHS-GDL-007', user: 'Warehouse HOD', action: 'Review Assigned', comment: 'Chemical handling guideline biennial review.', result: 'UNDER REVIEW' },
  { datetime: '15-Jul-2026 11:20', doc: 'EHS-MAN-003', user: 'Quality HOD', action: 'Comments Submitted', comment: 'Updated quality objectives and internal audit schedule.', result: 'UNDER REVIEW' },
  { datetime: '12-Jul-2026 08:45', doc: 'EHS-SOP-019', user: 'Maintenance HOD', action: 'Review Assigned', comment: 'Electrical safety procedure annual review.', result: 'UNDER REVIEW' },
];

export const ARCHIVE_STATS = { archived: 13, retention: '5 years', oldest: '12-Mar-2022', nextPurge: 'Dec 2026' };
export const ARCHIVED_DOCUMENTS = [];

export const DOC_TYPE_DISTRIBUTION = [
  { type: 'SOP', count: 98, underReview: 7, overdue: 2 },
  { type: 'Policy', count: 24, underReview: 2, overdue: 1 },
  { type: 'Manual', count: 19, underReview: 1, overdue: 1 },
  { type: 'Procedure', count: 52, underReview: 5, overdue: 1 },
  { type: 'Form', count: 37, underReview: 2, overdue: 0 },
  { type: 'Guideline', count: 17, underReview: 1, overdue: 0 },
];

export const DOC_REVIEW_WORKFLOW = [
  { title: '1. Submission', desc: 'Author submits document with reason for new / revised / obsolete.' },
  { title: '2. Technical Review', desc: 'Assigned discipline reviewer evaluates technical accuracy and completeness.' },
  { title: '3. Safety / EHS Review', desc: 'Safety officer verifies HSE content, risk controls, and regulatory alignment.' },
  { title: '4. Quality Review', desc: 'Quality reviewer checks document format, consistency, and compliance with document control standard.' },
  { title: '5. Revision & Resubmit', desc: 'Author addresses review comments and uploads revised version if required.' },
  { title: '6. Final Approval', desc: 'HOD / EHS HOD / Document Controller provide final approval for issuance.' },
  { title: '7. Issuance / Publication', desc: 'Document control team issues, distributes, and supersedes previous version.' },
];

let docSeq = 51;
export function nextDocNumber(type) {
  const prefix = { SOP: 'SOP', Policy: 'POL', Manual: 'MAN', Procedure: 'PROC', Form: 'FRM', Guideline: 'GDL' }[type] || 'SOP';
  return `EHS-${prefix}-${String(docSeq++).padStart(3, '0')}`;
}
