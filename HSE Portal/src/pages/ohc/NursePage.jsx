import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconClipboard, IconUser } from '../../components/icons';
import {
  useOhc, findEmployee, saveNurseAssessment, takePending, setPending, vitalFlags, bmi, fmtDateTime,
} from './store';
import { ExportBar, QueueList, Empty } from './shared';
import { downloadPdf } from './ohcExport';
import './ohc.css';

const RANGES = {
  bp_sys: [60, 250, 'Systolic BP'], bp_dia: [30, 150, 'Diastolic BP'], temp: [90, 110, 'Temperature'],
  pulse: [30, 220, 'Pulse'], spo2: [50, 100, 'SpO₂'], weight: [25, 250, 'Weight'], height: [100, 230, 'Height'],
};

function NurseForm({ visit, onDone, pushToast }) {
  const { settings } = useOhc();
  const emp = findEmployee(visit.employee_id);
  const [v, setV] = useState({
    nurse: settings.nurse, bp_sys: '', bp_dia: '', temp: '', pulse: '', spo2: '', weight: '', height: '',
    allergy: emp?.allergy || 'No known allergy', priority: visit.priority === 'Priority' ? 'Doctor Review Priority' : 'Normal', observation: '',
  });
  const [error, setError] = useState('');
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const flags = vitalFlags(v);

  const submit = (toDoctor) => {
    for (const [k, [lo, hi, label]] of Object.entries(RANGES)) {
      const n = Number(v[k]);
      if (v[k] === '' || Number.isNaN(n)) return setError(`${label} is required.`);
      if (n < lo || n > hi) return setError(`${label} looks wrong (${lo}–${hi}).`);
    }
    if (!toDoctor && flags.length) return setError(`Abnormal vitals (${flags.join(', ')}) — send this employee to the doctor.`);
    saveNurseAssessment(visit.id, v, toDoctor);
    pushToast(toDoctor ? `Nurse assessment saved — ${emp?.name} sent to doctor queue.` : `Visit closed at nurse level for ${emp?.name}.`, 'success');
    onDone(toDoctor);
    return null;
  };

  const num = (k, label, unit, step = '1') => (
    <div className="field">
      <label>{label}</label>
      <div className="ohc-unit"><input type="number" step={step} inputMode="decimal" value={v[k]} onChange={set(k)} /><span>{unit}</span></div>
    </div>
  );

  return (
    <Panel title={`${visit.op_number} • Token ${visit.token}`} icon={<IconClipboard size={17} />} noMargin>
      <div className="ohc-emp-card">
        <span className="ohc-avatar">{emp?.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
        <div>
          <b>{emp?.id} • {emp?.name}</b>
          <span>{emp?.department} • {emp?.age} yrs • {emp?.gender} • {visit.visit_type}</span>
          <span className="ohc-complaint">“{visit.complaint_text || visit.complaint}”</span>
        </div>
      </div>

      <div className="form-grid form-grid-3">
        <div className="field"><label>Nurse</label><input value={v.nurse} onChange={set('nurse')} /></div>
        <div className="field">
          <label>Blood Pressure</label>
          <div className="ohc-bp"><input type="number" placeholder="Sys" value={v.bp_sys} onChange={set('bp_sys')} /><span>/</span><input type="number" placeholder="Dia" value={v.bp_dia} onChange={set('bp_dia')} /><em>mmHg</em></div>
        </div>
        {num('temp', 'Temperature', '°F', '0.1')}
        {num('pulse', 'Pulse Rate', 'bpm')}
        {num('spo2', 'SpO₂', '%')}
        {num('weight', 'Weight', 'kg', '0.1')}
        {num('height', 'Height', 'cm')}
        <div className="field"><label>BMI (auto)</label><input readOnly value={bmi(v) || '—'} /></div>
        <div className="field"><label>Priority</label><select value={v.priority} onChange={set('priority')}><option>Normal</option><option>Doctor Review Priority</option></select></div>
        <div className="field span-2" style={{ gridColumn: '1 / -1' }}><label>Known Allergy</label><input value={v.allergy} onChange={set('allergy')} /></div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Nurse Observation</label><textarea value={v.observation} onChange={set('observation')} placeholder="Employee alert and oriented. No abnormal vital signs observed during screening." /></div>
      </div>

      <div className="ohc-flags" style={{ marginTop: 14 }}>
        {flags.length ? flags.map((f) => <span key={f} className="pill pill-red">{f}</span>) : <span className="pill pill-green">No abnormal readings</span>}
      </div>
      {error ? <div className="ohc-error">{error}</div> : null}
      <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <button type="button" className="btn btn-ghost" onClick={() => submit(false)}>Treat & Close at Nurse Level</button>
        <button type="button" className="btn btn-primary" onClick={() => submit(true)}>Save & Send to Doctor</button>
      </div>
    </Panel>
  );
}

export default function NursePage({ onNavigate, pushToast }) {
  const { visits } = useOhc();
  const queue = visits.filter((v) => v.stage === 'nurse').slice().reverse();
  const [selected, setSelected] = useState(() => takePending('dm-nurse')?.visitId || null);
  const visit = queue.find((v) => v.id === selected) || queue[0] || null;
  const recent = visits.filter((v) => v.nurse).slice(0, 8);

  const done = (toDoctor) => {
    if (toDoctor && queue.length <= 1) {
      setPending('dm-doctor', { visitId: visit.id });
      onNavigate('dm-doctor');
      return;
    }
    setSelected(null);
  };

  const pdf = () => downloadPdf({
    title: 'Nurse Assessments',
    filename: 'OHC-nurse-assessments.pdf',
    blocks: [{ heading: 'Recent screenings', columns: ['Time', 'OP No.', 'Employee', 'BP', 'Temp', 'Pulse', 'SpO₂', 'Flags'], widths: [1.6, 1.5, 2, 0.9, 0.7, 0.7, 0.7, 1.6], rows: visits.filter((v) => v.nurse).slice(0, 60).map((v) => [fmtDateTime(v.nurse.at), v.op_number, `${v.employee_id} ${findEmployee(v.employee_id)?.name}`, `${v.nurse.bp_sys}/${v.nurse.bp_dia}`, v.nurse.temp, v.nurse.pulse, v.nurse.spo2, vitalFlags(v.nurse).join(', ') || 'Normal']) }],
  });

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="Nurse Assessment" subtitle="Nurse screening and vital signs" actions={<ExportBar pushToast={pushToast} onPdf={pdf} />} />
      <div className="ohc-split">
        <Panel title={`Nurse Queue (${queue.length})`} plain noMargin>
          <QueueList visits={queue} selectedId={visit?.id} onSelect={setSelected} empty={<button type="button" className="btn btn-outline btn-sm" onClick={() => onNavigate('dm-op')}>Register a visit</button>} />
          {recent.length ? (
            <>
              <h4 className="ohc-subhead">Recently screened</h4>
              <div className="ohc-mini-list">
                {recent.map((r) => (
                  <div key={r.id}>
                    <span className="ohc-token sm">{r.token}</span>
                    <span className="ohc-mini-main"><b>{findEmployee(r.employee_id)?.name}</b><small>BP {r.nurse.bp_sys}/{r.nurse.bp_dia} • {r.nurse.temp}°F</small></span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </Panel>
        {visit ? (
          <NurseForm key={visit.id} visit={visit} onDone={done} pushToast={pushToast} />
        ) : (
          <Panel noMargin><Empty title="No one waiting for screening"><IconUser size={16} /> New OP registrations will appear here automatically.</Empty></Panel>
        )}
      </div>
    </div>
  );
}
