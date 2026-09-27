import { useMemo } from 'react';
import Modal from '../../components/Modal';
import { IconBell, IconAward, IconAlertTriangle, IconClock, IconCheckCircle } from '../../components/icons';
import {
  EMPLOYEES, STATUS_PILL, CERT_STATUS_PILL, TRAINING_RECORD_STATUS_PILL,
  employeeTrainingProfile, formatDate,
} from '../../data/trainingData';
import './employeeProfile.css';

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function daysNote(days) {
  if (days == null) return null;
  if (days < 0) return { text: `Expired ${-days} day${days === -1 ? '' : 's'} ago`, tone: 'bad' };
  if (days === 0) return { text: 'Expires today', tone: 'warn' };
  return { text: `${days} day${days === 1 ? '' : 's'} left`, tone: days <= 30 ? 'warn' : 'ok' };
}

export default function CertificateDetailModal({ certificate, onClose, onSendReminder }) {
  const data = useMemo(() => {
    if (!certificate) return null;
    const employee = EMPLOYEES.find((e) => e.id === certificate.empId);
    const profile = employee ? employeeTrainingProfile(employee) : null;
    const record = profile?.records.find((r) => r.certNo === certificate.cert)
      || profile?.records.find((r) => r.training === certificate.training)
      || null;
    const needsAction = profile ? profile.records.filter((r) => r.status !== 'Valid') : [];
    return { profile, record, needsAction };
  }, [certificate]);

  if (!certificate || !data) return null;
  const { profile, record, needsAction } = data;
  const note = daysNote(record?.daysLeft);
  const details = profile?.details;

  return (
    <Modal open title={`Certificate — ${certificate.cert}`} onClose={onClose} width={960}>
      {details ? (
        <>
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
              <div className="ep-compliance-value">{details.compliance}%</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${details.compliance}%` }} /></div>
            </div>
          </div>

          <div className="ep-info-grid">
            <div><span>Employee Type</span><strong>{details.type || '—'}</strong></div>
            <div><span>Date of Joining</span><strong>{formatDate(details.joined)}</strong></div>
            <div><span>HOD / Manager</span><strong>{details.hod || '—'}</strong></div>
            <div><span>Trainings Attended</span><strong>{profile.summary.attended}</strong></div>
          </div>
        </>
      ) : (
        <div className="info-callout" style={{ marginBottom: 16 }}>
          <strong>{certificate.empId}</strong>&nbsp;is not in the Employee Master, so only the certificate details are shown.
        </div>
      )}

      <h4 className="ep-section-title">Selected Certificate</h4>
      <div className={`cd-cert cd-cert-${note?.tone || 'ok'}`}>
        <div className="cd-cert-icon"><IconAward size={22} /></div>
        <div className="cd-cert-main">
          <div className="cd-cert-title">
            {certificate.training}
            <span className={`pill ${CERT_STATUS_PILL[certificate.status] || 'pill-slate'}`}>{certificate.status}</span>
          </div>
          <div className="cd-cert-grid">
            <div><span>Certificate No.</span><strong>{certificate.cert}</strong></div>
            <div><span>Issued On</span><strong>{record ? formatDate(record.date) : '—'}</strong></div>
            <div><span>Expiry Date</span><strong>{record ? formatDate(record.expiry) : certificate.expiry}</strong></div>
            <div>
              <span>Time Left</span>
              <strong className={note ? `ep-days-${note.tone}` : ''}>{note ? note.text : '—'}</strong>
            </div>
            <div><span>Session</span><strong>{record?.sessionId || '—'}</strong></div>
            <div><span>Trainer</span><strong>{record?.trainer || '—'}</strong></div>
            <div><span>Score</span><strong>{record ? `${record.score}%` : '—'}</strong></div>
            <div><span>Validity</span><strong>{record ? `${record.validity} months` : '—'}</strong></div>
          </div>
        </div>
      </div>

      {profile ? (
        <>
          <div className="ep-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="ep-sum ep-sum-green"><IconCheckCircle size={16} /><div><strong>{profile.summary.valid}</strong><span>Valid Certificates</span></div></div>
            <div className="ep-sum ep-sum-amber"><IconClock size={16} /><div><strong>{profile.summary.expiring}</strong><span>Expiring ≤ 30 days</span></div></div>
            <div className="ep-sum ep-sum-red"><IconAlertTriangle size={16} /><div><strong>{profile.summary.expired}</strong><span>Expired</span></div></div>
          </div>

          <h4 className="ep-section-title">Certificates Expiring / Expired for this Employee</h4>
          {needsAction.length ? (
            <div className="table-wrap ep-table">
              <table className="data-table">
                <thead>
                  <tr><th>Training</th><th>Issued On</th><th>Certificate No.</th><th>Expiry Date</th><th>Time Left</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {needsAction.map((r) => {
                    const n = daysNote(r.daysLeft);
                    return (
                      <tr key={r.certNo} className={r.certNo === certificate.cert ? 'cd-row-selected' : undefined}>
                        <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.training}</td>
                        <td>{formatDate(r.date)}</td>
                        <td>{r.certNo}</td>
                        <td style={{ fontWeight: 600 }}>{formatDate(r.expiry)}</td>
                        <td><span className={`ep-days ep-days-${n.tone}`} style={{ fontSize: 12.5 }}>{n.text}</span></td>
                        <td><span className={`pill ${TRAINING_RECORD_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ep-all-done" style={{ marginBottom: 20 }}>No certificates are expiring in the next 30 days.</p>
          )}

          <h4 className="ep-section-title">All Certificates</h4>
          <div className="table-wrap ep-table">
            <table className="data-table">
              <thead>
                <tr><th>Training</th><th>Issued On</th><th>Certificate No.</th><th>Expiry Date</th><th>Time Left</th><th>Status</th></tr>
              </thead>
              <tbody>
                {profile.records.map((r) => {
                  const n = daysNote(r.daysLeft);
                  return (
                    <tr key={r.certNo} className={r.certNo === certificate.cert ? 'cd-row-selected' : undefined}>
                      <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.training}</td>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.certNo}</td>
                      <td>{formatDate(r.expiry)}</td>
                      <td><span className={`ep-days ep-days-${n.tone}`} style={{ fontSize: 12.5 }}>{n.text}</span></td>
                      <td><span className={`pill ${TRAINING_RECORD_STATUS_PILL[r.status]}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <div className="ep-footer">
        {certificate.status !== 'Valid' ? (
          <button type="button" className="btn btn-outline" onClick={() => onSendReminder(certificate.cert)}>
            <IconBell size={15} /> Send Expiry Reminder
          </button>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
