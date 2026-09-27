import { useEffect, useState } from 'react';
import Panel from '../../components/Panel';
import Skeleton from './Skeleton';
import { IconFlag, IconFileText, IconClipboard, IconTool, IconSearch, IconPlus } from '../../components/icons';
import { apiFetch } from './store';
import PhotoPreview from '../../components/PhotoPreview';

const EMPTY_TEXT = { incident_date: '', incident_time: '', reported_by: '', location: '' };

export default function CreateIncidentPage({ onNavigate, pushToast }) {
  const [options, setOptions] = useState(null);
  const [text, setText] = useState(EMPTY_TEXT);
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/incidents/options')
      .then((opts) => {
        if (cancelled) return;
        setOptions(opts);
        setDepartment(opts.departments[0]);
        setIncidentType(opts.incident_types[0]);
        setSeverity(opts.severity_levels[0]);
      })
      .catch((err) => pushToast(err.message, 'error'));
    return () => { cancelled = true; };
  }, [pushToast]);

  const setTextField = (key) => (e) => setText((f) => ({ ...f, [key]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setPhotoUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const incident = await apiFetch('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          incident_date: text.incident_date || undefined,
          incident_time: text.incident_time || undefined,
          reported_by: text.reported_by || undefined,
          department,
          location: text.location || undefined,
          description: description || undefined,
          incident_type: incidentType,
          severity,
          corrective_action: correctiveAction || undefined,
          root_cause: rootCause || undefined,
          preventive_action: preventiveAction || undefined,
          photo_url: photoUrl || undefined,
        }),
      });
      pushToast(`Incident ${incident.incident_no} submitted to EHS HOD.`, 'success');
      onNavigate('ir-agent-home');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!options) {
    return (
      <div className="page-enter">
        <h1 className="page-title">SAFETY INCIDENT REPORT</h1>
        <p className="page-subtitle">Report all incidents immediately.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Skeleton height={190} radius={16} />
          <Skeleton height={120} radius={16} />
          <Skeleton height={120} radius={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <h1 className="page-title">SAFETY INCIDENT REPORT</h1>
      <p className="page-subtitle">Report all incidents immediately.</p>

      <Panel title="Incident Details" icon={<IconFlag size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={text.incident_date} onChange={setTextField('incident_date')} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={text.incident_time} onChange={setTextField('incident_time')} />
          </div>
          <div className="field">
            <label>Reported By</label>
            <input value={text.reported_by} onChange={setTextField('reported_by')} placeholder="Enter name" />
          </div>
          <div className="field">
            <label>Location of Incident</label>
            <input value={text.location} onChange={setTextField('location')} placeholder="e.g. Loading Dock 3" />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {options.departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Incident Description" icon={<IconFileText size={17} />}>
        <div className="field">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what happened..." />
        </div>
      </Panel>

      <Panel title="Classification" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Incident Type</label>
            <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              {options.incident_types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {options.severity_levels.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Immediate Corrective Action" icon={<IconTool size={17} />}>
        <div className="field">
          <textarea value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} placeholder="Action taken immediately..." />
        </div>
      </Panel>

      <Panel title="Investigation" icon={<IconSearch size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Root Cause</label>
            <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="What caused this incident..." />
          </div>
          <div className="field">
            <label>Corrective &amp; Preventive Action</label>
            <textarea value={preventiveAction} onChange={(e) => setPreventiveAction(e.target.value)} placeholder="Steps to prevent recurrence..." />
          </div>
        </div>
      </Panel>

      <Panel title="Attachments" icon={<IconPlus size={17} />}>
        <div className="field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </div>
        {photoUrl ? (
          <div style={{ marginTop: 12 }}>
            <PhotoPreview src={photoUrl} alt="Attachment preview" style={{ width: 200, maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--slate-200)' }} />
          </div>
        ) : null}
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit to EHS HOD'}
        </button>
      </div>
    </div>
  );
}
