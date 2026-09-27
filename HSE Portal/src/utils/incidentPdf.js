import { downloadRecordPdf } from './recordPdf';

const STATUS = { open: 'Open', under_investigation: 'Under Investigation', closed: 'Closed' };
const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');

export function downloadIncidentPdf(i, hodName) {
  const status = STATUS[i.status] || i.status;
  return downloadRecordPdf({
    title: 'INCIDENT REPORT',
    subtitle: `${i.incident_no}   |   ${status}`,
    color: [194, 65, 12],
    filename: `${i.incident_no}.pdf`,
    sections: [
      {
        title: 'Incident details',
        rows: [
          ['Incident No', i.incident_no],
          ['Status', status],
          ['Severity', i.severity],
          ['Reported by', i.agent ? `${i.agent.name} (${i.agent.employee_id})` : ''],
          ['Reporter name', i.reported_by],
          ['Filed on', dt(i.created_at)],
          ['Incident date / time', i.incident_date ? `${new Date(i.incident_date).toLocaleDateString()} ${i.incident_time || ''}`.trim() : ''],
          ['Department', i.department],
          ['Location', i.location],
          ['Incident type', i.incident_type],
          ['Assigned HOD', hodName],
        ],
      },
      {
        title: 'Description',
        paragraphs: [
          ['Incident description', i.description],
          ['Immediate corrective action', i.corrective_action],
          ['Root cause', i.root_cause],
          ['Corrective & preventive action', i.preventive_action],
        ],
      },
      {
        title: 'Progress',
        rows: [
          ['Reported by agent', dt(i.created_at)],
          ['Picked up by HOD', i.reviewed_at ? dt(i.reviewed_at) : 'Waiting for HOD'],
          ['Closed by HOD', i.status === 'closed' ? dt(i.closed_at) : ''],
          ['HOD feedback / closure note', i.resolution_note, true],
        ],
      },
      { title: 'Attachment', image: { label: 'Photo attached with the incident report', src: i.photo_url, maxH: 120 } },
    ],
  });
}
