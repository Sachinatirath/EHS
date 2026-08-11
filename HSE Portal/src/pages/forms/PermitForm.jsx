import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconClipboard, IconFileText, IconAlertTriangle, IconCheckSquare, IconUser } from '../../components/icons';
import { nextPermitId, PPE_ITEMS } from '../../data/formOptions';

export default function PermitForm({ title, pushToast }) {
  const [permitNo] = useState(() => nextPermitId());
  const [info, setInfo] = useState({});
  const [jobDescription, setJobDescription] = useState('');
  const [hazard, setHazard] = useState({ identified: '', controls: '' });
  const [ppe, setPpe] = useState(() => new Set());
  const [auth, setAuth] = useState({});

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setHazardField = (key) => (e) => setHazard((f) => ({ ...f, [key]: e.target.value }));
  const setAuthField = (key) => (e) => setAuth((f) => ({ ...f, [key]: e.target.value }));

  const togglePpe = (item) => {
    setPpe((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const handleSubmit = () => pushToast(`${title} ${permitNo} submitted for approval.`, 'success');
  const handleDraft = () => pushToast('Permit saved as draft.', 'info');
  const handlePrint = () => window.print();

  return (
    <div className="page-enter">
      <h1 className="page-title">{title}</h1>

      <Panel title="Permit Information" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Permit No</label>
            <input value={permitNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
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
            <label>Requested By</label>
            <input value={info.requestedBy || ''} onChange={setInfoField('requestedBy')} placeholder="Name" />
          </div>
          <div className="field">
            <label>Valid Until</label>
            <input type="date" value={info.validUntil || ''} onChange={setInfoField('validUntil')} />
          </div>
        </div>
      </Panel>

      <Panel title="Job Description" icon={<IconFileText size={17} />}>
        <div className="field">
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Describe the job to be performed..." />
        </div>
      </Panel>

      <Panel title="Hazard Assessment" icon={<IconAlertTriangle size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Hazard Identified</label>
            <textarea value={hazard.identified} onChange={setHazardField('identified')} />
          </div>
          <div className="field">
            <label>Control Measures</label>
            <textarea value={hazard.controls} onChange={setHazardField('controls')} />
          </div>
        </div>
      </Panel>

      <Panel title="PPE Required" icon={<IconCheckSquare size={17} />}>
        <div className="checkbox-group">
          {PPE_ITEMS.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={ppe.has(item)} onChange={() => togglePpe(item)} />
              {item}
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Authorization" icon={<IconUser size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Permit Issuer</label>
            <input value={auth.issuer || ''} onChange={setAuthField('issuer')} />
          </div>
          <div className="field">
            <label>Safety Officer</label>
            <input value={auth.safetyOfficer || ''} onChange={setAuthField('safetyOfficer')} />
          </div>
          <div className="field">
            <label>Area Incharge</label>
            <input value={auth.areaIncharge || ''} onChange={setAuthField('areaIncharge')} />
          </div>
          <div className="field">
            <label>Valid Date</label>
            <input type="date" value={auth.validDate || ''} onChange={setAuthField('validDate')} />
          </div>
        </div>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Permit</button>
        <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
        <button type="button" className="btn btn-ghost" onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
}
