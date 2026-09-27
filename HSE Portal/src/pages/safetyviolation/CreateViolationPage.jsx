import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconAlertTriangle, IconClipboard, IconTool, IconFileText, IconUser, IconEye } from '../../components/icons';
import { EHS_DEPARTMENTS, VIOLATION_TYPES, OFFENCE_LEVELS, CORRECTIVE_ACTIONS } from '../../data/formOptions';
import { apiFetch, hodForDepartment } from './store';
import SignaturePad from './SignaturePad';
import PhotoPreview from '../../components/PhotoPreview';

export default function CreateViolationPage({ onNavigate, pushToast }) {
  const [info, setInfo] = useState({ department: EHS_DEPARTMENTS[0] });
  const [details, setDetails] = useState({ violationType: VIOLATION_TYPES[0], offence: OFFENCE_LEVELS[0] });
  const [actions, setActions] = useState(() => new Set());
  const [description, setDescription] = useState('');
  const [explanation, setExplanation] = useState('');
  const [employeeSignature, setEmployeeSignature] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setDetailsField = (key) => (e) => setDetails((f) => ({ ...f, [key]: e.target.value }));

  const toggleAction = (item) => {
    setActions((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDraft = () => pushToast('Violation notice saved as draft.', 'info');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const violation = await apiFetch('/violations', {
        method: 'POST',
        body: JSON.stringify({
          violation_date: info.date || undefined,
          company: info.company || undefined,
          department: info.department,
          supervisor: info.supervisor || undefined,
          employee_name: info.employeeName || undefined,
          employee_code: info.employeeCode || undefined,
          job_title: info.jobTitle || undefined,
          violation_type: details.violationType,
          offence: details.offence,
          corrective_actions: Array.from(actions),
          description: description || undefined,
          explanation: explanation || undefined,
          employee_signature_data: employeeSignature || undefined,
          photo_url: photoUrl || undefined,
        }),
      });
      pushToast(`Safety Violation ${violation.violation_no} submitted to ${hodForDepartment(violation.department)?.name || 'HOD'} (HOD, ${violation.department}).`, 'success');
      onNavigate('sv-agent-home');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <h1 className="page-title">SAFETY VIOLATION NOTICE</h1>

      <Panel title="Violation Information" icon={<IconAlertTriangle size={17} />}>
        <div className="form-grid">
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

      <Panel title="Attach Evidence" icon={<IconEye size={17} />}>
        <div className="field"><input type="file" accept="image/*" onChange={handleFile} /></div>
        {photoUrl ? (
          <div style={{ marginTop: 12 }}>
            <PhotoPreview src={photoUrl} alt="Evidence preview" style={{ maxWidth: 280, maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--slate-200)' }} />
          </div>
        ) : null}
      </Panel>

      <Panel title="Employee Signature" icon={<IconUser size={17} />}>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--slate-500)' }}>
          The employee acknowledges the violation by signing here.
        </p>
        <SignaturePad onChange={setEmployeeSignature} />
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={handleDraft} disabled={submitting}>Save Draft</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit to HOD'}
        </button>
      </div>
    </div>
  );
}
