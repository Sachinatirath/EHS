import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconAlertTriangle, IconClipboard, IconTool, IconFileText, IconUser } from '../../components/icons';
import { nextViolationId, EHS_DEPARTMENTS, VIOLATION_TYPES, OFFENCE_LEVELS, CORRECTIVE_ACTIONS } from '../../data/formOptions';

export default function SafetyViolationPage({ pushToast }) {
  const [violationNo] = useState(() => nextViolationId());
  const [info, setInfo] = useState({ department: EHS_DEPARTMENTS[0] });
  const [details, setDetails] = useState({ violationType: VIOLATION_TYPES[0], offence: OFFENCE_LEVELS[0] });
  const [actions, setActions] = useState(() => new Set());
  const [description, setDescription] = useState('');
  const [explanation, setExplanation] = useState('');
  const [signed, setSigned] = useState(false);

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setDetailsField = (key) => (e) => setDetails((f) => ({ ...f, [key]: e.target.value }));

  const toggleAction = (item) => {
    setActions((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    pushToast(`Safety Violation ${violationNo} submitted to HOD.`, 'success');
  };
  const handleDraft = () => pushToast('Violation notice saved as draft.', 'info');
  const handleSign = () => setSigned(true);
  const handleClearSignature = () => setSigned(false);

  return (
    <div className="page-enter">
      <h1 className="page-title">SAFETY VIOLATION NOTICE</h1>

      <Panel title="Violation Information" icon={<IconAlertTriangle size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Violation No</label>
            <input value={violationNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={info.date || ''} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Company / Contractor</label>
            <input value={info.company || ''} onChange={setInfoField('company')} />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={info.department} onChange={setInfoField('department')}>
              {EHS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Supervisor Name</label>
            <input value={info.supervisor || ''} onChange={setInfoField('supervisor')} />
          </div>
          <div className="field">
            <label>Employee Name</label>
            <input value={info.employeeName || ''} onChange={setInfoField('employeeName')} />
          </div>
          <div className="field">
            <label>Employee Code</label>
            <input value={info.employeeCode || ''} onChange={setInfoField('employeeCode')} />
          </div>
          <div className="field">
            <label>Job Title</label>
            <input value={info.jobTitle || ''} onChange={setInfoField('jobTitle')} />
          </div>
        </div>
      </Panel>

      <Panel title="Violation Details" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Violation Type</label>
            <select value={details.violationType} onChange={setDetailsField('violationType')}>
              {VIOLATION_TYPES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Offence</label>
            <select value={details.offence} onChange={setDetailsField('offence')}>
              {OFFENCE_LEVELS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Corrective Action" icon={<IconTool size={17} />}>
        <div className="checkbox-group">
          {CORRECTIVE_ACTIONS.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={actions.has(item)} onChange={() => toggleAction(item)} />
              {item}
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Description" icon={<IconFileText size={17} />}>
        <div className="field">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Violation Description..." />
        </div>
      </Panel>

      <Panel title="Employee Explanation" icon={<IconUser size={17} />}>
        <div className="field">
          <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </div>
      </Panel>

      <Panel title="Evidence Photo" icon={<IconFileText size={17} />}>
        <div className="field"><input type="file" /></div>
      </Panel>

      <Panel title="Digital Signature" icon={<IconUser size={17} />}>
        <div className="signature-box" onClick={handleSign} style={{ cursor: 'pointer' }}>
          {signed ? <span style={{ fontFamily: 'cursive', fontSize: 22, color: 'var(--blue-700)' }}>Signed</span> : 'Click to sign'}
        </div>
        <button type="button" className="btn btn-outline" onClick={handleClearSignature}>Clear</button>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit to HOD</button>
      </div>
    </div>
  );
}
