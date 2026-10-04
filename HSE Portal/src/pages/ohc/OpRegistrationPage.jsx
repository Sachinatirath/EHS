import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import { IconQrCode, IconUser, IconCheckCircle, IconClipboard } from '../../components/icons';
import {
  useOhc, findEmployee, registerVisit, setPending, todayKey, dayKey, fmtTime, COMPLAINTS, VISIT_TYPES,
} from './store';
import { EmployeeField, ExportBar, StagePill } from './shared';
import { opSlipPdf, visitsExcel } from './reports';
import './ohc.css';

const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function ScanModal({ open, onClose, onFound }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const lookup = (e) => {
    e.preventDefault();
    const emp = findEmployee(code);
    if (emp) {
      onFound(emp.id);
      onClose();
    } else setError(`No employee found for "${code}".`);
  };
  return (
    <Modal open={open} title="Scan Employee ID / QR" onClose={onClose} width={440}>
      <form onSubmit={lookup}>
        <div className="ohc-scan-frame"><span /><IconQrCode size={46} /></div>
        <p className="ohc-muted" style={{ textAlign: 'center', margin: '10px 0 16px' }}>
          Scan the ID card with a handheld scanner, or type the code printed under the QR.
        </p>
        <div className="field">
          <label>Employee code</label>
          <input autoFocus value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }} placeholder="EMP-1042" />
        </div>
        {error ? <div className="ohc-error">{error}</div> : null}
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!code.trim()}>Find Employee</button>
        </div>
      </form>
    </Modal>
  );
}

export default function OpRegistrationPage({ onNavigate, pushToast }) {
  const { visits, seq } = useOhc();
  const blank = { employee_id: '', created_at: localNow(), visit_type: VISIT_TYPES[0], complaint: COMPLAINTS[0], complaint_text: '', priority: 'Normal' };
  const [form, setForm] = useState(blank);
  const [scan, setScan] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emp = findEmployee(form.employee_id);
  const todays = visits.filter((v) => dayKey(v.created_at) === todayKey());

  const save = (e) => {
    e.preventDefault();
    try {
      const v = registerVisit(form);
      setSaved(v);
      setError('');
      pushToast(`OP ${v.op_number} registered • Token ${v.token}. Nurse queue updated.`, 'success');
    } catch (err) {
      setError(err.message);
    }
  };

  const startNurse = () => {
    setPending('dm-nurse', { visitId: saved.id });
    onNavigate('dm-nurse');
  };

  return (
    <div className="page-enter ohc-page">
      <PageHeader
        title="OP Registration"
        subtitle="Employee identification → complaint → unique OP number → nurse queue"
        actions={<ExportBar pushToast={pushToast} excelLabel="Today's Register" onExcel={() => visitsExcel(todays, `OHC-OP-register-${todayKey()}.xlsx`)} />}
      />

      <div className="two-col">
        {saved ? (
          <Panel noMargin>
            <div className="ohc-success">
              <span className="ohc-success-icon"><IconCheckCircle size={34} /></span>
              <h2>OP registration saved</h2>
              <p className="ohc-muted">{findEmployee(saved.employee_id)?.name} has been added to the nurse queue.</p>
              <div className="ohc-ticket">
                <div><span>Token</span><b>{saved.token}</b></div>
                <div><span>OP Number</span><b>{saved.op_number}</b></div>
                <div><span>Complaint</span><b>{saved.complaint}</b></div>
              </div>
              <div className="btn-row no-print">
                <button type="button" className="btn btn-outline" onClick={() => opSlipPdf(saved)}>Download OP Slip</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setSaved(null); setForm({ ...blank, created_at: localNow() }); }}>Register Another</button>
                <button type="button" className="btn btn-primary" onClick={startNurse}>Start Nurse Assessment</button>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="New OHC Visit" icon={<IconClipboard size={17} />} noMargin>
            <form onSubmit={save}>
              <div className="ohc-scan-row">
                <div style={{ flex: 1 }}><EmployeeField value={form.employee_id} onChange={(v) => setForm((f) => ({ ...f, employee_id: v }))} required autoFocus /></div>
                <button type="button" className="btn btn-outline" onClick={() => setScan(true)}><IconQrCode size={16} /> Scan QR</button>
              </div>

              {emp ? (
                <div className="ohc-emp-card">
                  <span className="ohc-avatar">{emp.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</span>
                  <div>
                    <b>{emp.name}</b>
                    <span>{emp.department} • {emp.role} • {emp.age} yrs • {emp.blood_group}</span>
                    {!/^none/i.test(emp.allergy) ? <span className="pill pill-orange" style={{ marginTop: 4 }}>Allergy: {emp.allergy}</span> : null}
                  </div>
                </div>
              ) : (
                <div className="ohc-emp-card is-empty"><IconUser size={20} /> Identify the employee to auto-fill name & department</div>
              )}

              <div className="form-grid">
                <div className="field"><label>Date & Time</label><input type="datetime-local" value={form.created_at} onChange={set('created_at')} /></div>
                <div className="field"><label>Visit Type</label><select value={form.visit_type} onChange={set('visit_type')}>{VISIT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                <div className="field"><label>Primary Complaint<span className="req">*</span></label><select value={form.complaint} onChange={set('complaint')}>{COMPLAINTS.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label>Priority</label><select value={form.priority} onChange={set('priority')}><option>Normal</option><option>Priority</option></select></div>
                <div className="field span-2"><label>Employee Complaint</label><textarea value={form.complaint_text} onChange={set('complaint_text')} placeholder="e.g. Headache since morning. No other major complaint reported." /></div>
                <div className="field"><label>OP Number (auto)</label><input readOnly value={`OHC-${form.created_at.slice(0, 4)}-${String(seq.op + 1).padStart(4, '0')}`} /></div>
                <div className="field"><label>Token (auto)</label><input readOnly value={String(todays.length + 1).padStart(3, '0')} /></div>
              </div>
              {error ? <div className="ohc-error">{error}</div> : null}
              <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="submit" className="btn btn-primary" disabled={!emp}>Save & Send to Nurse Queue</button>
              </div>
            </form>
          </Panel>
        )}

        <Panel title={`Today's Registrations (${todays.length})`} plain noMargin>
          <div className="ohc-mini-list">
            {todays.slice(0, 12).map((v) => (
              <div key={v.id}>
                <span className="ohc-token sm">{v.token}</span>
                <span className="ohc-mini-main"><b>{findEmployee(v.employee_id)?.name}</b><small>{v.complaint} • {fmtTime(v.created_at)}</small></span>
                <StagePill stage={v.stage} />
              </div>
            ))}
            {!todays.length ? <p className="ohc-muted">No registrations yet today.</p> : null}
          </div>
        </Panel>
      </div>

      {scan ? <ScanModal open onClose={() => setScan(false)} onFound={(id) => setForm((f) => ({ ...f, employee_id: id }))} /> : null}
    </div>
  );
}
