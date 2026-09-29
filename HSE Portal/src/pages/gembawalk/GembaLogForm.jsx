import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconUser, IconClipboard, IconClock, IconFileText, IconSend } from '../../components/icons';
import { GEMBA_AREAS, GEMBA_CATEGORIES, GEMBA_STATUSES, addGemba, localDateTime } from './store';

function initialForm() {
  const now = localDateTime(0);
  return {
    observerName: '',
    employeeId: '',
    obsDate: now.slice(0, 10),
    obsTime: now.slice(11, 16),
    area: '',
    location: '',
    category: GEMBA_CATEGORIES[0],
    assignedTo: '',
    targetDateTime: localDateTime(24),
    status: 'Open',
    description: '',
    correctiveAction: '',
  };
}

/** Industrial Gemba observation reporting form; the target date & time starts the SLA clock. */
export default function GembaLogForm({ onNavigate, pushToast }) {
  const [form, setForm] = useState(() => initialForm());
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    try {
      const obs = addGemba(form);
      pushToast(`Gemba observation ${obs.id} logged. If it is not closed by ${new Date(obs.targetDateTime).toLocaleString()} it escalates to the Plant Head.`, 'success');
      onNavigate('gw-records');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const Req = () => <span className="req">*</span>;

  return (
    <form className="page-enter" onSubmit={submit}>
      <PageHeader
        title="Log Gemba Observation"
        subtitle="Unresolved observations past their target time auto-escalate to the Plant Head"
        badge={<span className="pill pill-amber"><IconClock size={12} /> Auto SLA Tracking</span>}
      />

      <Panel title="1. Observer & Timestamp Info" icon={<IconUser size={17} />}>
        <div className="form-grid gemba-grid-4">
          <div className="field"><label>Observer Name<Req /></label><input value={form.observerName} onChange={set('observerName')} placeholder="Ex: K. Rajesh" /></div>
          <div className="field"><label>Employee ID Number<Req /></label><input value={form.employeeId} onChange={set('employeeId')} placeholder="Ex: EMP-4092" /></div>
          <div className="field"><label>Observation Date<Req /></label><input type="date" value={form.obsDate} onChange={set('obsDate')} /></div>
          <div className="field"><label>Observation Time<Req /></label><input type="time" value={form.obsTime} onChange={set('obsTime')} /></div>
        </div>
      </Panel>

      <Panel title="2. Plant Area, Location & Category" icon={<IconClipboard size={17} />}>
        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Plant Area / Department<Req /></label>
            <select value={form.area} onChange={set('area')}>
              <option value="">-- Select Plant Area --</option>
              {GEMBA_AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="field"><label>Specific Location / Machine ID<Req /></label><input value={form.location} onChange={set('location')} placeholder="Ex: Machine Line 3 - Press Area" /></div>
          <div className="field">
            <label>Observation Category<Req /></label>
            <select value={form.category} onChange={set('category')}>
              {GEMBA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="3. Responsibility & Target SLA Time" icon={<IconClock size={17} />}>
        <div className="form-grid form-grid-3">
          <div className="field"><label>Action Owner (Person &amp; Dept)<Req /></label><input value={form.assignedTo} onChange={set('assignedTo')} placeholder="Ex: Suresh Kumar (Maintenance Lead)" /></div>
          <div className="field"><label>Target Completion Date &amp; Time<Req /></label><input type="datetime-local" value={form.targetDateTime} onChange={set('targetDateTime')} /></div>
          <div className="field">
            <label>Observation Status<Req /></label>
            <select value={form.status} onChange={set('status')}>
              {GEMBA_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="4. Observation Details & Corrective Action" icon={<IconFileText size={17} />}>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Observation Details (what was observed)<Req /></label>
          <textarea rows={3} value={form.description} onChange={set('description')} placeholder="Detailed description of the unsafe condition / act observed during the Gemba walk…" />
        </div>
        <div className="field">
          <label>Proposed Corrective / Preventive Action</label>
          <textarea rows={2} value={form.correctiveAction} onChange={set('correctiveAction')} placeholder="Immediate action taken or recommended corrective action…" />
        </div>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={() => setForm(initialForm())}>Reset</button>
        <button type="submit" className="btn btn-primary"><IconSend size={15} /> Submit Observation &amp; Start SLA Timer</button>
      </div>
    </form>
  );
}
