import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconUser, IconClipboard, IconEye, IconAlertTriangle, IconTool, IconFileText, IconClock } from '../../components/icons';
import { OBSERVATION_CATEGORIES, SEVERITY_LEVELS } from '../../data/formOptions';
import { apiFetch, hodsForDepartment, SO_DEPARTMENTS } from './store';

const pad = (n) => String(n).padStart(2, '0');
// Value format for <input type="datetime-local">, in local time.
const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function CreateObservationPage({ onNavigate, pushToast }) {
  const [reporter, setReporter] = useState({ department: SO_DEPARTMENTS[0] });
  const departmentHods = hodsForDepartment(reporter.department);
  const [details, setDetails] = useState({});
  const [category, setCategory] = useState(OBSERVATION_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(SEVERITY_LEVELS[0]);
  const [action, setAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [closingAt, setClosingAt] = useState(() => toLocalInput(new Date(Date.now() + 24 * 3600000)));
  const [submitting, setSubmitting] = useState(false);

  const setReporterField = (key) => (e) => setReporter((f) => ({ ...f, [key]: e.target.value }));
  const setDetailsField = (key) => (e) => setDetails((f) => ({ ...f, [key]: e.target.value }));

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

  const handleSubmit = async () => {
    const closingMs = closingAt ? new Date(closingAt).getTime() : NaN;
    if (!Number.isFinite(closingMs) || closingMs <= Date.now()) {
      pushToast('Pick a closing date & time in the future.', 'error');
      return;
    }
    setSubmitting(true);
    // Observation date and time are the local date/time at the moment of submission.
    const submittedAt = new Date();
    const observationDate = `${submittedAt.getFullYear()}-${pad(submittedAt.getMonth() + 1)}-${pad(submittedAt.getDate())}`;
    const observationTime = `${pad(submittedAt.getHours())}:${pad(submittedAt.getMinutes())}`;
    try {
      const observation = await apiFetch('/observations', {
        method: 'POST',
        body: JSON.stringify({
          observer_name: reporter.name || undefined,
          observer_employee_code: reporter.empId || undefined,
          department: reporter.department,
          observation_date: observationDate,
          department_head: departmentHods.map((h) => h.name).join(', ') || undefined,
          plant: details.plant || undefined,
          area: details.area || undefined,
          location: details.location || undefined,
          observation_time: observationTime,
          category,
          description: description || undefined,
          severity,
          corrective_action: action || undefined,
          photo_url: photoUrl || undefined,
          closing_at: new Date(closingMs).toISOString(),
        }),
      });
      pushToast(`Safety observation ${observation.observation_no} assigned to the ${observation.department} Shift A, B & C HODs. If none of them acts by ${new Date(observation.hod_due_at).toLocaleString()} it moves to the Manager.`, 'success');
      onNavigate('so-agent-home');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <h1 className="page-title">Safety Observation Report</h1>

      <Panel title="Reporter Information" icon={<IconUser size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Observer Name</label>
            <input value={reporter.name || ''} onChange={setReporterField('name')} placeholder="Enter name" />
          </div>
          <div className="field">
            <label>Employee ID</label>
            <input value={reporter.empId || ''} onChange={setReporterField('empId')} placeholder="e.g. EMP-2201" />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={reporter.department} onChange={setReporterField('department')}>
              {SO_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Department HODs (Shift A, B, C)</label>
            <input
              value={departmentHods.length ? departmentHods.map((h) => `${h.shift}: ${h.name}`).join(' · ') : 'Not assigned'}
              readOnly
              title="Auto-filled from the selected department"
              style={{ background: 'var(--slate-50)', color: 'var(--slate-700)', cursor: 'default' }}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Observation Details" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Plant / Site</label>
            <input value={details.plant || ''} onChange={setDetailsField('plant')} placeholder="e.g. Main Plant" />
          </div>
          <div className="field">
            <label>Area</label>
            <input value={details.area || ''} onChange={setDetailsField('area')} placeholder="e.g. Zone B" />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={details.location || ''} onChange={setDetailsField('location')} placeholder="e.g. Near Press 3" />
          </div>
        </div>
      </Panel>

      <Panel title="Observation Information" icon={<IconEye size={17} />}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Observation Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {OBSERVATION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the observation in detail..." />
        </div>
      </Panel>

      <Panel title="Risk Assessment" icon={<IconAlertTriangle size={17} />}>
        <div className="field" style={{ maxWidth: 320 }}>
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {SEVERITY_LEVELS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Panel>

      <Panel title="Closing Time" icon={<IconClock size={17} />}>
        <div className="field" style={{ maxWidth: 320 }}>
          <label>Close By (Date &amp; Time)</label>
          <input
            type="datetime-local"
            value={closingAt}
            min={toLocalInput(new Date())}
            onChange={(e) => setClosingAt(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 6 }}>
          The countdown runs from submission until this time. If the HOD hasn&apos;t acted by then, it moves to the Manager.
        </div>
      </Panel>

      <Panel title="Immediate Corrective Action" icon={<IconTool size={17} />}>
        <div className="field">
          <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action taken immediately..." />
        </div>
      </Panel>

      <Panel title="Attach Evidence" icon={<IconFileText size={17} />}>
        <div className="field"><input type="file" accept="image/*" onChange={handleFile} /></div>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Evidence preview"
            style={{ marginTop: 12, maxWidth: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}
          />
        ) : null}
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Observation'}
        </button>
      </div>
    </div>
  );
}
