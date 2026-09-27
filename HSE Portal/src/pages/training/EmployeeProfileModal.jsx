import { useMemo } from 'react';
import Modal from '../../components/Modal';
import { IconDownload, IconCheckCircle, IconClock, IconAlertTriangle, IconBookOpen, IconAward } from '../../components/icons';
import {
  STATUS_PILL, TRAINING_RECORD_STATUS_PILL, employeeTrainingProfile, formatDate,
} from '../../data/trainingData';
import { exportEmployeeTrackerExcel } from '../../utils/trainingExcel';
import './employeeProfile.css';

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function daysLeftLabel(days) {
  if (days < 0) return `Expired ${-days} day${days === -1 ? '' : 's'} ago`;
  if (days === 0) return 'Expires today';
  return `${days} day${days === 1 ? '' : 's'} left`;
}

export default function EmployeeProfileModal({ employee, onClose, pushToast }) {
  const profile = useMemo(() => (employee ? employeeTrainingProfile(employee) : null), [employee]);

  if (!employee || !profile) return null;
  const { details, records, pending, summary } = profile;
  const compliance = Number(details.compliance) || 0;

  return (
    <Modal open title="Employee Training Profile" onClose={onClose} width={960}>
      <div className="ep-hero">
        <div className="ep-avatar">{initials(details.name)}</div>
        <div className="ep-hero-main">
          <div className="ep-name-row">
            <h2 className="ep-name">{details.name}</h2>
            <span className={`pill ${STATUS_PILL[details.status] || 'pill-slate'}`}>{details.status}</span>
          </div>
          <div className="ep-meta">{details.id} · {details.role || '—'} · {details.department}</div>
        </div>
        <div className="ep-compliance">
          <div className="ep-compliance-label">Compliance</div>
          <div className="ep-compliance-value">{compliance}%</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${compliance}%` }} /></div>
        </div>
      </div>

      <div className="ep-info-grid">
        <div><span>Employee Type</span><strong>{details.type || '—'}</strong></div>
        <div><span>Date of Joining</span><strong>{formatDate(details.joined)}</strong></div>
        <div><span>HOD / Manager</span><strong>{details.hod || '—'}</strong></div>
        <div><span>Training Validity</span><strong>{profile.validity || '—'}</strong></div>
      </div>

      <div className="ep-summary">
        <div className="ep-sum ep-sum-blue"><IconBookOpen size={16} /><div><strong>{summary.attended}</strong><span>Trainings Attended</span></div></div>
        <div className="ep-sum ep-sum-green"><IconCheckCircle size={16} /><div><strong>{summary.valid}</strong><span>Valid</span></div></div>
        <div className="ep-sum ep-sum-amber"><IconClock size={16} /><div><strong>{summary.expiring}</strong><span>Expiring ≤ 30 days</span></div></div>
        <div className="ep-sum ep-sum-red"><IconAlertTriangle size={16} /><div><strong>{summary.expired}</strong><span>Expired</span></div></div>
        <div className="ep-sum ep-sum-slate"><IconAward size={16} /><div><strong>{summary.pending}</strong><span>Not Attended</span></div></div>
      </div>

      <h4 className="ep-section-title">Training History</h4>
      <div className="table-wrap ep-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Training</th><th>Attended On</th><th>Session ID</th><th>Trainer</th><th>Score</th>
              <th>Certificate No.</th><th>Expiry Date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={`${r.training}-${r.sessionId}`}>
                <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.training}</td>
                <td>{formatDate(r.date)}</td>
                <td>{r.sessionId}</td>
                <td>{r.trainer}</td>
                <td>{r.score}%</td>
                <td>{r.certNo}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatDate(r.expiry)}</div>
                  <div className={`ep-days ep-days-${r.status === 'Valid' ? 'ok' : r.status === 'Expired' ? 'bad' : 'warn'}`}>{daysLeftLabel(r.daysLeft)}</div>
                </td>
                <td><span className={`pill ${TRAINING_RECORD_STATUS_PILL[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
            {!records.length && (
              <tr><td colSpan={8} className="ep-empty">No training records found for this employee yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h4 className="ep-section-title">Mandatory Training Not Attended</h4>
      {pending.length ? (
        <div className="ep-pending">
          {pending.map((t) => (
            <div key={t} className="ep-pending-item">
              <span>{t}</span>
              <span className={`pill ${TRAINING_RECORD_STATUS_PILL['Not Attended']}`}>Not Attended</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="ep-all-done">All mandatory trainings from the role matrix have been attended.</p>
      )}

      <div className="ep-footer">
        <button type="button" className="btn btn-outline" onClick={() => exportEmployeeTrackerExcel([employee], `training-profile-${details.id}.xlsx`)
            .then(() => pushToast(`Training profile for ${details.id} exported to Excel.`, 'success'))
            .catch((err) => pushToast(`Export failed: ${err.message}`, 'error'))}>
          <IconDownload size={15} /> Export Profile
        </button>
        <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
