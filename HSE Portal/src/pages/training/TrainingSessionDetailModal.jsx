import { useMemo } from 'react';
import Modal from '../../components/Modal';
import { IconDownload, IconUsers, IconCheckCircle, IconAlertTriangle, IconClock, IconAward } from '../../components/icons';
import {
  SESSION_STATUS_PILL, SESSION_HOD_PILL, ATTENDEE_STATUS_PILL, SHIFT_OPTIONS,
  sessionAttendeeDetails, formatDate,
} from '../../data/trainingData';
import { exportSessionAttendeesExcel } from '../../utils/trainingExcel';
import './employeeProfile.css';

const shiftLabel = (value) => SHIFT_OPTIONS.find((s) => s.value === value)?.label || value || '—';

export default function TrainingSessionDetailModal({ session, onClose, pushToast }) {
  const attendees = useMemo(
    () => (session ? sessionAttendeeDetails(session, session.extraParticipants) : []),
    [session],
  );

  if (!session) return null;

  const present = attendees.filter((a) => a.attendance === 'Present');
  const summary = {
    nominated: attendees.length,
    present: present.length,
    absent: attendees.filter((a) => a.attendance === 'Absent').length,
    certified: present.filter((a) => a.certNo).length,
    expiring: present.filter((a) => a.status === 'Expiring Soon' || a.status === 'Expired').length,
  };
  const multiDay = session.endDate && session.endDate !== session.startDate;

  const handleExport = () => {
    exportSessionAttendeesExcel(session, attendees)
      .then(() => pushToast(`${session.id} attendee list exported to Excel.`, 'success'))
      .catch((err) => pushToast(`Export failed: ${err.message}`, 'error'));
  };

  return (
    <Modal open title={`Training Session — ${session.id}`} onClose={onClose} width={1040}>
      <div className="ep-hero">
        <div className="ep-avatar" style={{ borderRadius: 12 }}><IconAward size={24} /></div>
        <div className="ep-hero-main">
          <div className="ep-name-row">
            <h2 className="ep-name">{session.topic}</h2>
            <span className={`pill ${SESSION_STATUS_PILL[session.status] || 'pill-slate'}`}>{session.status}</span>
            <span className={`pill ${SESSION_HOD_PILL[session.hodReview] || 'pill-slate'}`}>HOD: {session.hodReview}</span>
          </div>
          <div className="ep-meta">{session.id} · Trainer: {session.trainer || '—'}</div>
        </div>
      </div>

      <div className="ep-info-grid">
        <div><span>Started On</span><strong>{formatDate(session.startDate)}</strong></div>
        <div>
          <span>{session.status === 'Completed' ? 'Completed On' : 'Planned Completion'}</span>
          <strong>{formatDate(session.endDate || session.startDate)}{multiDay ? ' (multi-day)' : ''}</strong>
        </div>
        <div><span>Location</span><strong>{session.location || '—'}</strong></div>
        <div><span>Shift</span><strong>{shiftLabel(session.shift)}</strong></div>
        <div><span>Certificate Validity</span><strong>{session.validity ? `${session.validity} months` : '—'}</strong></div>
        <div><span>Trainer</span><strong>{session.trainer || '—'}</strong></div>
        <div><span>Training Status</span><strong>{session.status}</strong></div>
        <div><span>HOD Review</span><strong>{session.hodReview}</strong></div>
      </div>

      <div className="ep-summary">
        <div className="ep-sum ep-sum-blue"><IconUsers size={16} /><div><strong>{summary.nominated}</strong><span>Nominated</span></div></div>
        <div className="ep-sum ep-sum-green"><IconCheckCircle size={16} /><div><strong>{summary.present}</strong><span>Attended</span></div></div>
        <div className="ep-sum ep-sum-red"><IconAlertTriangle size={16} /><div><strong>{summary.absent}</strong><span>Absent</span></div></div>
        <div className="ep-sum ep-sum-slate"><IconAward size={16} /><div><strong>{summary.certified}</strong><span>Certificates Issued</span></div></div>
        <div className="ep-sum ep-sum-amber"><IconClock size={16} /><div><strong>{summary.expiring}</strong><span>Expiring / Expired</span></div></div>
      </div>

      <h4 className="ep-section-title">Employees in this Training</h4>
      <div className="table-wrap ep-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th><th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th><th>Attendance</th>
              <th>Started On</th><th>Completed On</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a, i) => (
              <tr key={`${a.empId}-${i}`}>
                <td>{i + 1}</td>
                <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{a.empId || '—'}</td>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>{a.department}</td>
                <td>{a.role}</td>
                <td>{a.attendance}</td>
                <td>{formatDate(a.startDate)}</td>
                <td>{a.completedOn ? formatDate(a.completedOn) : '—'}</td>
                <td><span className={`pill ${ATTENDEE_STATUS_PILL[a.status] || 'pill-slate'}`}>{a.status}</span></td>
              </tr>
            ))}
            {!attendees.length && (
              <tr><td colSpan={9} className="ep-empty">No employees have been added to this training yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ep-footer">
        <button type="button" className="btn btn-outline" onClick={handleExport} disabled={!attendees.length}>
          <IconDownload size={15} /> Export Attendees
        </button>
        <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
