import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconUser, IconClipboard, IconEye, IconAlertTriangle, IconTool, IconFileText } from '../../components/icons';
import { OBSERVATION_CATEGORIES, SEVERITY_LEVELS, OBSERVATION_STATUSES } from '../../data/formOptions';

export default function SafetyObservationPage({ pushToast }) {
  const [reporter, setReporter] = useState({});
  const [details, setDetails] = useState({});
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(SEVERITY_LEVELS[0]);
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');

  const setReporterField = (key) => (e) => setReporter((f) => ({ ...f, [key]: e.target.value }));
  const setDetailsField = (key) => (e) => setDetails((f) => ({ ...f, [key]: e.target.value }));

  const handleReset = () => {
    setReporter({});
    setDetails({});
    setCategory('');
    setDescription('');
    setSeverity(SEVERITY_LEVELS[0]);
    setAction('');
    setStatus('');
    pushToast('Form reset.', 'info');
  };

  const handleSubmit = () => {
    if (!status) {
      pushToast('Please select an observation status before submitting.', 'error');
      return;
    }
    pushToast('Safety observation report submitted.', 'success');
    handleReset();
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
            <input value={reporter.empId || ''} onChange={setReporterField('empId')} />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={reporter.department || ''} onChange={setReporterField('department')} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={reporter.date || ''} onChange={setReporterField('date')} />
          </div>
        </div>
      </Panel>

      <Panel title="Observation Details" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Plant / Site</label>
            <input value={details.plant || ''} onChange={setDetailsField('plant')} />
          </div>
          <div className="field">
            <label>Area</label>
            <input value={details.area || ''} onChange={setDetailsField('area')} />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={details.location || ''} onChange={setDetailsField('location')} />
          </div>
          <div className="field">
            <label>Observation Time</label>
            <input type="time" value={details.time || ''} onChange={setDetailsField('time')} />
          </div>
        </div>
      </Panel>

      <Panel title="Observation Information" icon={<IconEye size={17} />}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Observation Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
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

      <Panel title="Immediate Corrective Action" icon={<IconTool size={17} />}>
        <div className="field">
          <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action taken immediately..." />
        </div>
      </Panel>

      <Panel title="Attach Evidence" icon={<IconFileText size={17} />}>
        <div className="field"><input type="file" /></div>
      </Panel>

      <Panel title="Observation Status" icon={<IconClipboard size={17} />}>
        <div className="radio-group">
          {OBSERVATION_STATUSES.map((s) => (
            <label key={s}>
              <input type="radio" name="observation-status" checked={status === s} onChange={() => setStatus(s)} />
              {s}
            </label>
          ))}
        </div>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={handleReset}>Reset</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Observation</button>
      </div>
    </div>
  );
}
