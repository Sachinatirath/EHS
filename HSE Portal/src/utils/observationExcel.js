import { exportRecordsExcel } from './recordsExcel';

const STATUS = {
  open: 'Open',
  under_review: 'Reassigned to Agent',
  escalated_manager: 'Escalated to Manager',
  escalated: 'Escalated (SLA missed)',
  closed: 'Closed',
  rejected: 'Rejected',
};
const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');

/** Exports observation rows to .xlsx, with each evidence photo embedded. */
export function exportObservationsExcel(rows, filename = 'safety-observations.xlsx') {
  return exportRecordsExcel({
    sheetName: 'Safety Observations',
    color: 'FF1D4ED8',
    filename,
    rows,
    columns: [
      { header: 'Observation No', width: 26, value: (o) => o.observation_no },
      { header: 'Reported By', width: 20, value: (o) => o.agent?.name },
      { header: 'Department', width: 16, value: (o) => o.department },
      { header: 'Category', width: 20, value: (o) => o.category },
      { header: 'Severity', width: 11, value: (o) => o.severity },
      { header: 'Status', width: 20, value: (o) => STATUS[o.status] || o.status },
      { header: 'Filed On', width: 21, value: (o) => dt(o.created_at) },
      { header: 'Plant / Site', width: 14, value: (o) => o.plant },
      { header: 'Area', width: 14, value: (o) => o.area },
      { header: 'Location', width: 18, value: (o) => o.location },
      { header: 'Description', width: 42, value: (o) => o.description },
      { header: 'Corrective Action', width: 32, value: (o) => o.corrective_action },
      { header: 'SLA Close By', width: 21, value: (o) => dt(o.due_at) },
      { header: 'Assigned To', width: 22, value: (o) => (o.handler === 'manager' ? 'Manager' : 'HOD') },
      { header: 'HOD / Manager Remarks', width: 30, value: (o) => o.resolution_note },
      { header: 'Closure Note', width: 30, value: (o) => o.closure_note },
    ],
  });
}
