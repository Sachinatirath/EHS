import { exportRecordsExcel } from './recordsExcel';

const STATUS = { open: 'Open', under_investigation: 'Under Investigation', closed: 'Closed' };
const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');

/** Exports incident rows to .xlsx, with each attachment photo embedded. */
export function exportIncidentsExcel(rows, filename = 'incident-reports.xlsx') {
  return exportRecordsExcel({
    sheetName: 'Incident Reports',
    color: 'FFC2410C',
    photoHeader: 'Attachment Photo',
    filename,
    rows,
    columns: [
      { header: 'Incident No', width: 24, value: (i) => i.incident_no },
      { header: 'Reported By', width: 20, value: (i) => i.agent?.name },
      { header: 'Incident Type', width: 20, value: (i) => i.incident_type },
      { header: 'Severity', width: 11, value: (i) => i.severity },
      { header: 'Status', width: 20, value: (i) => STATUS[i.status] || i.status },
      { header: 'Department', width: 16, value: (i) => i.department },
      { header: 'Location', width: 20, value: (i) => i.location },
      { header: 'Incident Date', width: 14, value: (i) => (i.incident_date ? new Date(i.incident_date).toLocaleDateString() : '') },
      { header: 'Incident Time', width: 12, value: (i) => i.incident_time },
      { header: 'Filed On', width: 21, value: (i) => dt(i.created_at) },
      { header: 'Description', width: 42, value: (i) => i.description },
      { header: 'Corrective Action', width: 32, value: (i) => i.corrective_action },
      { header: 'Root Cause', width: 30, value: (i) => i.root_cause },
      { header: 'Preventive Action', width: 30, value: (i) => i.preventive_action },
      { header: 'HOD Note', width: 30, value: (i) => i.resolution_note },
      { header: 'Employee Signed', width: 15, value: (i) => (i.employee_signature_data ? 'Yes' : 'No') },
    ],
  });
}
