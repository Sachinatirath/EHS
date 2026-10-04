import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconStethoscope, IconPlus, IconClose, IconCheckCircle } from '../../components/icons';
import {
  useOhc, findEmployee, completeConsultation, takePending, setPending, medicineStatus, fmtDate, fmtDateTime, FITNESS,
} from './store';
import { ExportBar, QueueList, VitalsGrid, Empty } from './shared';
import { downloadPdf } from './ohcExport';
import { prescriptionPdf, visitPdf } from './reports';
import './ohc.css';

const REFERRALS = ['No referral', 'Hospital / Specialist', 'Orthopaedics', 'Ophthalmology', 'ENT', 'General Medicine'];
const blankLine = () => ({ medicine_id: '', dose: '1 tablet • SOS', duration: '1 day', qty: 1 });

function ConsultForm({ visit, onDone, pushToast }) {
  const { settings, medicines, visits } = useOhc();
  const emp = findEmployee(visit.employee_id);
  const past = visits.filter((v) => v.employee_id === emp.id && v.id !== visit.id).slice(0, 4);
  const [c, setC] = useState({
    doctor: settings.doctor, diagnosis: '', duration: '1 day', fitness: FITNESS[0], notes: '', advice: 'Hydration & rest', referral: REFERRALS[0], follow_up_date: '',
  });
  const [lines, setLines] = useState([blankLine()]);
  const [error, setError] = useState('');
  const set = (k) => (e) => setC((s) => ({ ...s, [k]: e.target.value }));
  const setLine = (i, k) => (e) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: e.target.value } : l)));
  const usable = medicines.filter((m) => !['expired', 'out'].includes(medicineStatus(m).key));

  const submit = () => {
    try {
      const over = lines.find((l) => {
        const m = medicines.find((x) => x.id === l.medicine_id);
        return m && Number(l.qty) > m.stock;
      });
      if (over) throw new Error(`Quantity for ${medicines.find((m) => m.id === over.medicine_id).name} exceeds available stock.`);
      const rx = completeConsultation(visit.id, c, lines);
      pushToast(rx ? `Consultation completed. Prescription ${rx.rx_no} sent to pharmacy.` : 'Consultation completed.', 'success');
      onDone(rx);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Panel title={`${visit.op_number} • ${emp.name}`} icon={<IconStethoscope size={17} />} noMargin>
      <div className="ohc-consult-top">
        <div>
          <h4 className="ohc-subhead" style={{ marginTop: 0 }}>Complaint</h4>
          <p className="ohc-complaint">{visit.complaint} — “{visit.complaint_text || 'No details'}”</p>
          <h4 className="ohc-subhead">Nurse vitals ({visit.nurse?.nurse})</h4>
          <VitalsGrid vitals={visit.nurse} />
          {visit.nurse?.observation ? <p className="ohc-muted" style={{ marginTop: 8 }}>{visit.nurse.observation}</p> : null}
        </div>
        <div className="ohc-past">
          <h4 className="ohc-subhead" style={{ marginTop: 0 }}>Previous visits</h4>
          {past.length ? past.map((p) => (
            <div key={p.id}><b>{fmtDate(p.created_at)}</b> {p.complaint}{p.doctor ? ` — ${p.doctor.diagnosis}` : ''}</div>
          )) : <div className="ohc-muted">First OHC visit</div>}
        </div>
      </div>

      <div className="form-grid form-grid-3" style={{ marginTop: 18 }}>
        <div className="field"><label>Doctor</label><input value={c.doctor} onChange={set('doctor')} /></div>
        <div className="field"><label>Provisional Diagnosis<span className="req">*</span></label><input value={c.diagnosis} onChange={set('diagnosis')} placeholder="e.g. Tension-type headache" /></div>
        <div className="field"><label>Duration of Illness</label><input value={c.duration} onChange={set('duration')} /></div>
        <div className="field"><label>Fitness Status</label><select value={c.fitness} onChange={set('fitness')}>{FITNESS.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div className="field"><label>Referral</label><select value={c.referral} onChange={set('referral')}>{REFERRALS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="field"><label>Follow-up Date</label><input type="date" value={c.follow_up_date} onChange={set('follow_up_date')} /></div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Clinical Notes</label><textarea value={c.notes} onChange={set('notes')} placeholder="History reviewed. Vital signs stable. Supportive treatment and hydration advised." /></div>
      </div>

      <h4 className="ohc-subhead">Prescription</h4>
      <div className="ohc-rx-lines">
        {lines.map((l, i) => {
          const m = medicines.find((x) => x.id === l.medicine_id);
          return (
            <div key={i} className="ohc-rx-line">
              <div className="field"><label>Medicine</label>
                <select value={l.medicine_id} onChange={setLine(i, 'medicine_id')}>
                  <option value="">— none —</option>
                  {usable.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.stock} {x.unit})</option>)}
                </select>
              </div>
              <div className="field"><label>Dose / Frequency</label><input value={l.dose} onChange={setLine(i, 'dose')} /></div>
              <div className="field"><label>Duration</label><input value={l.duration} onChange={setLine(i, 'duration')} /></div>
              <div className={`field${m && Number(l.qty) > m.stock ? ' has-error' : ''}`}><label>Qty</label><input type="number" min="1" value={l.qty} onChange={setLine(i, 'qty')} /></div>
              <button type="button" className="icon-btn" aria-label="Remove line" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : [blankLine()]))}><IconClose size={14} /></button>
            </div>
          );
        })}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLines((ls) => [...ls, blankLine()])}><IconPlus size={14} /> Add medicine</button>
      </div>
      <div className="field" style={{ marginTop: 14 }}><label>Advice</label><input value={c.advice} onChange={set('advice')} /></div>

      {error ? <div className="ohc-error">{error}</div> : null}
      <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <button type="button" className="btn btn-primary" onClick={submit}>Complete Consultation</button>
      </div>
    </Panel>
  );
}

export default function DoctorPage({ onNavigate, pushToast }) {
  const { visits, prescriptions } = useOhc();
  const queue = visits.filter((v) => v.stage === 'doctor').slice().reverse();
  const [selected, setSelected] = useState(() => takePending('dm-doctor')?.visitId || null);
  const [result, setResult] = useState(null); // { visitId, rx }
  const visit = queue.find((v) => v.id === selected) || queue[0] || null;

  const pdf = () => downloadPdf({
    title: 'Doctor Consultations',
    filename: 'OHC-consultations.pdf',
    landscape: true,
    blocks: [{ heading: 'Recent consultations', columns: ['Date', 'OP No.', 'Employee', 'Complaint', 'Diagnosis', 'Fitness', 'Referral'], widths: [1.6, 1.5, 2, 1.2, 2.2, 1.3, 1.6], rows: visits.filter((v) => v.doctor).slice(0, 80).map((v) => [fmtDateTime(v.doctor.at), v.op_number, `${v.employee_id} ${findEmployee(v.employee_id)?.name}`, v.complaint, v.doctor.diagnosis, v.doctor.fitness, v.doctor.referral]) }],
  });

  const resultVisit = result && visits.find((v) => v.id === result.visitId);
  const resultRx = result?.rx && prescriptions.find((r) => r.id === result.rx.id);

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="MBBS Doctor Consultation" subtitle="Diagnosis, treatment, prescription and referral" actions={<ExportBar pushToast={pushToast} onPdf={pdf} />} />
      <div className="ohc-split">
        <Panel title={`Doctor Queue (${queue.length})`} plain noMargin>
          <QueueList visits={queue} selectedId={visit?.id} onSelect={(id) => { setSelected(id); setResult(null); }} empty="Patients sent by the nurse will appear here." />
        </Panel>

        {resultVisit ? (
          <Panel noMargin>
            <div className="ohc-success">
              <span className="ohc-success-icon"><IconCheckCircle size={34} /></span>
              <h2>Consultation completed</h2>
              <p className="ohc-muted">{findEmployee(resultVisit.employee_id)?.name} • {resultVisit.doctor.diagnosis} • {resultVisit.doctor.fitness}</p>
              {resultRx ? <div className="ohc-ticket"><div><span>Prescription</span><b>{resultRx.rx_no}</b></div><div><span>Items</span><b>{resultRx.items.length}</b></div><div><span>Status</span><b>Sent to pharmacy</b></div></div> : null}
              <div className="btn-row no-print">
                <button type="button" className="btn btn-outline" onClick={() => visitPdf(resultVisit)}>Download Visit Record</button>
                {resultRx ? <button type="button" className="btn btn-outline" onClick={() => prescriptionPdf(resultRx)}>Download Prescription</button> : null}
                {resultRx ? <button type="button" className="btn btn-primary" onClick={() => { setPending('dm-prescriptions', { rxId: resultRx.id }); onNavigate('dm-prescriptions'); }}>Go to Pharmacy</button> : null}
                {queue.length ? <button type="button" className="btn btn-primary" onClick={() => { setResult(null); setSelected(null); }}>Next Patient</button> : null}
              </div>
            </div>
          </Panel>
        ) : visit ? (
          <ConsultForm key={visit.id} visit={visit} pushToast={pushToast} onDone={(rx) => setResult({ visitId: visit.id, rx })} />
        ) : (
          <Panel noMargin><Empty title="No patients waiting">The doctor queue is clear.</Empty></Panel>
        )}
      </div>
    </div>
  );
}
