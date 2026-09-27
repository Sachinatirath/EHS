import { downloadRecordPdf } from './recordPdf';

const STATUS = {
  open: 'Open',
  under_review: 'Reassigned to Agent',
  escalated_manager: 'Escalated to Manager',
  escalated: 'Escalated (SLA missed)',
  closed: 'Closed',
  rejected: 'Rejected',
};
const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');
const d = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

export function downloadObservationPdf(o, assignee) {
  const status = STATUS[o.status] || o.status;
  const closedBy = o.closed_by === 'hod' ? 'HOD' : (o.closed_by === 'manager' ? 'Manager' : 'agent');
  return downloadRecordPdf({
    title: 'SAFETY OBSERVATION REPORT',
    subtitle: `${o.observation_no}   |   ${status}`,
    color: [29, 78, 216],
    filename: `${o.observation_no}.pdf`,
    sections: [
      {
        title: 'Observation details',
        rows: [
          ['Observation No', o.observation_no],
          ['Status', status],
          ['Reported by', o.agent ? `${o.agent.name} (${o.agent.employee_id})` : ''],
          ['Observer', o.observer_name ? `${o.observer_name}${o.observer_employee_code ? ` (${o.observer_employee_code})` : ''}` : ''],
          ['Filed on', dt(o.created_at)],
          ['Observation date', d(o.observation_date)],
          ['Observation time', o.observation_time],
          ['Department', o.department],
          [assignee?.role === 'Manager' ? 'Assigned to (Manager)' : 'Assigned Shift HODs', assignee?.name],
          ['Plant / Site', o.plant],
          ['Area', o.area],
          ['Location', o.location],
          ['Category', o.category],
          ['Severity', o.severity],
        ],
      },
      {
        title: 'Description',
        paragraphs: [
          ['Observation description', o.description],
          ['Immediate corrective action', o.corrective_action],
        ],
      },
      {
        title: 'Progress & SLA',
        rows: [
          ['Submitted by agent', dt(o.created_at)],
          ['HOD did not act in 24 hours', o.hod_escalated_at ? `Moved to Manager on ${dt(o.hod_escalated_at)}` : ''],
          ['HOD action due by', o.status === 'open' ? dt(o.hod_due_at) : ''],
          [o.status === 'rejected' ? 'Rejected' : 'Reviewed', (o.status === 'open' || o.status === 'escalated_manager') ? `Waiting for ${assignee?.role || 'HOD'} review` : dt(o.reviewed_at)],
          ['HOD / Manager remarks', o.reviewed_at ? o.resolution_note : '', true],
          ['Assigned to agent on', dt(o.assigned_at)],
          ['SLA – close by', dt(o.due_at)],
          ['Escalated to HOD', dt(o.escalated_at)],
          [`Closed by ${closedBy}`, o.status === 'closed' ? dt(o.closed_at) : ''],
          ['Closure note', o.status === 'closed' ? o.closure_note : '', true],
        ],
      },
      { title: 'Attached evidence', image: { label: 'Photo attached with the observation', src: o.photo_url, maxH: 120 } },
    ],
  });
}
