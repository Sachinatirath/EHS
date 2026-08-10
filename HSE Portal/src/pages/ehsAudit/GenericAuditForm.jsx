import { useState } from 'react';
import { IconCheckSquare, IconFileText, IconGauge } from '../../components/icons';

const CHECKLIST_ITEMS = [
  'Compliance with Standards',
  'Documentation Reviewed',
  'Equipment Condition',
  'Training Records',
  'PPE Compliance',
];

let auditSeq = 1;

export default function GenericAuditForm({ title, icon, pushToast }) {
  const [auditNo] = useState(() => `AUD-2026-${String(auditSeq++).padStart(3, '0')}`);
  const [info, setInfo] = useState({ auditType: 'Scheduled' });
  const [rows, setRows] = useState(CHECKLIST_ITEMS.map(() => ({ status: 'Yes', remarks: '' })));
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [rating, setRating] = useState('Excellent');
  const [followUp, setFollowUp] = useState('Yes');

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setRow = (idx, key) => (e) => {
    const value = e.target.value;
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const statusClass = (status) => (status === 'Yes' ? 'status-yes' : status === 'No' ? 'status-no' : 'status-na');

  const handleSubmit = () => pushToast(`${title} ${auditNo} submitted.`, 'success');
  const handleDraft = () => pushToast('Draft saved.', 'info');
  const handlePrint = () => window.print();

  return (
    <div className="page-enter">
      <h1 className="page-title">{title}</h1>

      <div className="panel">
        <div className="panel-header">{icon} Audit Information</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Audit No</label>
            <input value={auditNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={info.date || ''} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={info.department || ''} onChange={setInfoField('department')} placeholder="Department" />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={info.location || ''} onChange={setInfoField('location')} placeholder="Location" />
          </div>
          <div className="field">
            <label>Auditor Name</label>
            <input value={info.auditorName || ''} onChange={setInfoField('auditorName')} placeholder="Auditor Name" />
          </div>
          <div className="field">
            <label>Audit Type</label>
            <select value={info.auditType} onChange={setInfoField('auditType')}>
              <option>Scheduled</option>
              <option>Unscheduled</option>
              <option>Follow-up</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconCheckSquare size={17} /> Audit Checklist</div>
        <div className="panel-body" style={{ paddingTop: 16 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th style={{ width: 48 }}>No</th><th>Checklist Item</th><th style={{ width: 130 }}>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <tr key={item}>
                    <td>{idx + 1}</td>
                    <td>{item}</td>
                    <td>
                      <select
                        className={`checklist-select ${statusClass(rows[idx].status)}`}
                        value={rows[idx].status}
                        onChange={setRow(idx, 'status')}
                      >
                        <option>Yes</option>
                        <option>No</option>
                        <option>N/A</option>
                      </select>
                    </td>
                    <td>
                      <textarea rows={1} value={rows[idx].remarks} onChange={setRow(idx, 'remarks')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconFileText size={17} /> Findings &amp; Recommendations</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Findings</label>
            <textarea value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="Describe findings..." />
          </div>
          <div className="field">
            <label>Recommendations</label>
            <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} placeholder="Recommended actions..." />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconGauge size={17} /> Overall Rating</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </div>
          <div className="field">
            <label>Follow-up Required</label>
            <select value={followUp} onChange={(e) => setFollowUp(e.target.value)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Audit</button>
        <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
        <button type="button" className="btn btn-ghost" onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
}
