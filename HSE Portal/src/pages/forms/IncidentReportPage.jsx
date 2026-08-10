import { useState } from 'react';
import { IconFlag, IconFileText, IconClipboard, IconTool, IconSearch, IconAlertTriangle } from '../../components/icons';
import { nextIncidentId, EHS_DEPARTMENTS, INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUSES } from '../../data/formOptions';

export default function IncidentReportPage({ pushToast }) {
  const [incidentNo] = useState(() => nextIncidentId());
  const [info, setInfo] = useState({ department: '' });
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState({ type: INCIDENT_TYPES[0], severity: SEVERITY_LEVELS[0] });
  const [action, setAction] = useState('');
  const [investigation, setInvestigation] = useState({ rootCause: '', correctiveAction: '' });
  const [status, setStatus] = useState(INCIDENT_STATUSES[0]);

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setClassificationField = (key) => (e) => setClassification((f) => ({ ...f, [key]: e.target.value }));
  const setInvestigationField = (key) => (e) => setInvestigation((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => pushToast(`Incident ${incidentNo} saved.`, 'info');
  const handleSubmit = () => pushToast(`Incident ${incidentNo} submitted to EHS HOD.`, 'success');

  return (
    <div className="page-enter">
      <h1 className="page-title">SAFETY INCIDENT REPORT</h1>
      <p className="page-subtitle">Report all incidents immediately.</p>

      <div className="panel">
        <div className="panel-header"><IconFlag size={17} /> Incident Details</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Incident No</label>
            <input value={incidentNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={info.date || ''} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={info.time || ''} onChange={setInfoField('time')} />
          </div>
          <div className="field">
            <label>Reported By</label>
            <input value={info.reportedBy || ''} onChange={setInfoField('reportedBy')} />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={info.department} onChange={setInfoField('department')}>
              <option value="">Select</option>
              {EHS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Location of Incident</label>
            <input value={info.location || ''} onChange={setInfoField('location')} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconFileText size={17} /> Incident Description</div>
        <div className="panel-body">
          <div className="field">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconClipboard size={17} /> Classification</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Incident Type</label>
            <select value={classification.type} onChange={setClassificationField('type')}>
              {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Severity</label>
            <select value={classification.severity} onChange={setClassificationField('severity')}>
              {SEVERITY_LEVELS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconTool size={17} /> Immediate Corrective Action</div>
        <div className="panel-body">
          <div className="field">
            <textarea value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconSearch size={17} /> Investigation</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Root Cause</label>
            <textarea value={investigation.rootCause} onChange={setInvestigationField('rootCause')} />
          </div>
          <div className="field">
            <label>Corrective &amp; Preventive Action</label>
            <textarea value={investigation.correctiveAction} onChange={setInvestigationField('correctiveAction')} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconAlertTriangle size={17} /> Attachments &amp; Status</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Upload Photo</label>
            <input type="file" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {INCIDENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={handleSave}>Save</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit to EHS HOD</button>
      </div>
    </div>
  );
}
