import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconSettings, IconUsers, IconRepeat } from '../../components/icons';
import { useOhc, updateSettings, resetDemoData } from './store';
import { ExportBar } from './shared';
import './ohc.css';

const TOGGLES = [
  ['ohc_open', 'OHC open for walk-ins', 'Shown on the dashboard status chip'],
  ['auto_backup', 'Auto backup', 'Daily backup of OHC records'],
  ['low_stock_alerts', 'Low-stock notification', 'Alert when a medicine falls to its reorder level'],
  ['followup_reminders', 'Follow-up reminders', 'Show due / overdue follow-ups on the dashboard'],
];

const ROLES = [
  ['Admin', 'Full access, settings, reports'],
  ['Nurse', 'OP registration, vitals, nurse-level closure'],
  ['Doctor', 'Consultation, prescription, referral, fitness'],
  ['Pharmacy', 'Prescription issue, stock receipt'],
  ['HOD', 'Department reports (no clinical notes)'],
];

const FLOW = [
  ['Employee ID / QR', 'Retrieve employee profile'],
  ['OP Registration', 'Complaint → token → nurse queue'],
  ['Nurse Assessment', 'Vitals → screening → doctor queue or nurse closure'],
  ['MBBS Consultation', 'Diagnosis → treatment → prescription / referral'],
  ['Pharmacy', 'Medicine issue → stock deduction'],
  ['History & Analytics', 'Every completed visit retained in employee record'],
];

export default function SettingsPage({ pushToast }) {
  const { settings } = useOhc();
  const [form, setForm] = useState({
    doctor: settings.doctor, nurse: settings.nurse, pharmacist: settings.pharmacist,
    workforce: settings.workforce, expiry_days: settings.expiry_days, opening_hours: settings.opening_hours,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    updateSettings({ ...form, workforce: Number(form.workforce) || 0, expiry_days: Number(form.expiry_days) || 30 });
    pushToast('OHC settings saved', 'success');
  };

  const reset = () => {
    if (!window.confirm('Reset all OHC demo data? Registrations, prescriptions and stock changes made here will be lost.')) return;
    resetDemoData();
    pushToast('OHC demo data reset', 'success');
  };

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="OHC Settings" subtitle="OHC workflow, roles, alerts and configuration" actions={<ExportBar pushToast={pushToast} />} />

      <div className="two-col">
        <div className="ohc-stack">
          <Panel title="System Controls" icon={<IconSettings size={17} />} noMargin>
            {TOGGLES.map(([k, label, hint]) => (
              <label key={k} className="ohc-toggle-row">
                <span><b>{label}</b><small>{hint}</small></span>
                <input type="checkbox" className="ohc-switch" checked={!!settings[k]} onChange={(e) => { updateSettings({ [k]: e.target.checked }); pushToast(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`, 'info'); }} />
              </label>
            ))}
          </Panel>

          <Panel title="Clinic Configuration" icon={<IconUsers size={17} />} noMargin>
            <form onSubmit={save}>
              <div className="form-grid">
                <div className="field"><label>Medical Officer</label><input value={form.doctor} onChange={set('doctor')} /></div>
                <div className="field"><label>Duty Nurse</label><input value={form.nurse} onChange={set('nurse')} /></div>
                <div className="field"><label>Pharmacist</label><input value={form.pharmacist} onChange={set('pharmacist')} /></div>
                <div className="field"><label>Opening Hours</label><input value={form.opening_hours} onChange={set('opening_hours')} /></div>
                <div className="field"><label>Workforce Covered</label><input type="number" min="0" value={form.workforce} onChange={set('workforce')} /></div>
                <div className="field"><label>Expiry Alert (days)</label><input type="number" min="1" max="365" value={form.expiry_days} onChange={set('expiry_days')} /></div>
              </div>
              <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="submit" className="btn btn-primary">Save Settings</button>
              </div>
            </form>
          </Panel>

          <Panel title="Role-based Access" plain noMargin>
            <div className="ohc-legend">
              {ROLES.map(([r, d]) => <div key={r}><span><b>{r}</b></span><span className="ohc-muted">{d}</span></div>)}
            </div>
          </Panel>
        </div>

        <div className="ohc-stack">
          <Panel title="Digital OHC Workflow" plain noMargin>
            <div className="ohc-flow">
              {FLOW.map(([t, d], i) => (
                <div key={t} className="ohc-flow-step" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="ohc-flow-num">{i + 1}</span>
                  <div><b>{t}</b><p>{d}</p></div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Demo Data" icon={<IconRepeat size={17} />} noMargin>
            <p className="ohc-muted" style={{ marginTop: 0 }}>All OHC records are stored in this browser. Resetting restores the sample employees, visits and stock.</p>
            <button type="button" className="btn btn-ghost no-print" onClick={reset}>Reset Demo Data</button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
