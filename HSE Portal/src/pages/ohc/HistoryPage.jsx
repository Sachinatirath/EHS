import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import { IconUser, IconClipboard, IconFlag, IconStethoscope, IconFileText } from '../../components/icons';
import {
  useOhc, findEmployee, takePending, addDays, todayKey, fmtDate, fmtTime, followupStatus, vitalFlags, bmi,
} from './store';
import { EmployeeField, ExportBar, StagePill, Pill, VitalsGrid, Empty } from './shared';
import { employeeHistoryPdf, visitPdf, visitsExcel, complaintBreakdown } from './reports';
import './ohc.css';

function TimelineItem({ v, index }) {
  const [open, setOpen] = useState(index === 0);
  const flags = vitalFlags(v.nurse);
  const summary = [
    v.nurse ? (flags.length ? flags.join(', ') : 'Vitals normal') : 'Awaiting nurse',
    v.doctor ? 'Doctor consultation' : v.stage === 'completed' ? 'Treated by nurse' : null,
    v.rx_id ? 'Medicine prescribed' : null,
    v.doctor?.fitness,
  ].filter(Boolean).join(' • ');
  return (
    <div className="ohc-event" style={{ animationDelay: `${index * 40}ms` }}>
      <button type="button" className="ohc-event-head" onClick={() => setOpen((o) => !o)}>
        <b>{fmtDate(v.created_at)} • {v.complaint}</b>
        <StagePill stage={v.stage} />
      </button>
      <p>{summary}</p>
      {open ? (
        <div className="ohc-event-body">
          <div className="ohc-muted">{v.op_number} • {fmtTime(v.created_at)} • {v.visit_type}</div>
          {v.nurse ? <VitalsGrid vitals={v.nurse} /> : null}
          {v.doctor ? (
            <div className="ohc-kv">
              <div><span>Diagnosis</span><b>{v.doctor.diagnosis}</b></div>
              <div><span>Doctor</span><b>{v.doctor.doctor}</b></div>
              <div><span>Advice</span><b>{v.doctor.advice || '—'}</b></div>
              <div><span>Referral</span><b>{v.doctor.referral}</b></div>
            </div>
          ) : null}
          <button type="button" className="btn btn-ghost btn-sm no-print" onClick={() => visitPdf(v)}><IconFileText size={14} /> Visit record PDF</button>
        </div>
      ) : null}
    </div>
  );
}

export default function HistoryPage({ pushToast }) {
  const { visits, followups } = useOhc();
  const [query, setQuery] = useState(() => takePending('dm-history')?.employeeId || 'EMP-1042');
  const [empId, setEmpId] = useState(query);
  const emp = findEmployee(empId);

  const mine = emp ? visits.filter((v) => v.employee_id === emp.id) : [];
  const yearAgo = addDays(todayKey(), -365);
  const lastYear = mine.filter((v) => v.created_at.slice(0, 10) >= yearAgo);
  const fus = emp ? followups.filter((f) => f.employee_id === emp.id) : [];
  const referrals = fus.filter((f) => f.action.startsWith('Referral'));
  const lastVitals = mine.find((v) => v.nurse)?.nurse;
  const lastDoctor = mine.find((v) => v.doctor);
  const top = complaintBreakdown(mine)[0];

  const load = (e) => {
    e.preventDefault();
    if (findEmployee(query)) setEmpId(findEmployee(query).id);
  };

  return (
    <div className="page-enter ohc-page">
      <PageHeader
        title="Employee Medical History"
        subtitle="Complete employee-wise medical history"
        actions={emp ? <ExportBar pushToast={pushToast} onPdf={() => employeeHistoryPdf(emp.id)} onExcel={() => visitsExcel(mine, `${emp.id}-visits.xlsx`)} /> : null}
      />

      <form className="ohc-load-bar no-print" onSubmit={load}>
        <div style={{ flex: 1 }}><EmployeeField value={query} onChange={setQuery} /></div>
        <button type="submit" className="btn btn-primary" disabled={!findEmployee(query)}>Load History</button>
      </form>

      {!emp ? (
        <Panel><Empty title="Select an employee">Enter an Employee ID to load the medical record.</Empty></Panel>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard value={emp.name} label={`${emp.id} • ${emp.department}`} variant="blue" icon={<IconUser size={18} />} />
            <StatCard value={lastYear.length} label="OHC visits • last 12 months" variant="teal" icon={<IconClipboard size={18} />} delay={40} />
            <StatCard value={mine.filter((v) => v.doctor).length} label="Doctor consultations" variant="violet" icon={<IconStethoscope size={18} />} delay={80} />
            <StatCard value={referrals.length} label={`Referrals • ${referrals.filter((r) => r.status === 'completed').length} closed`} variant="amber" icon={<IconFlag size={18} />} delay={120} />
          </div>

          <div className="two-col">
            <Panel title={`Medical Visit Timeline (${mine.length})`} plain noMargin>
              {mine.length ? (
                <div className="ohc-timeline">
                  {mine.slice(0, 30).map((v, i) => <TimelineItem key={v.id} v={v} index={i} />)}
                  {mine.length > 30 ? <p className="ohc-muted">Showing latest 30 — download the PDF for the full record.</p> : null}
                </div>
              ) : <Empty title="No OHC visits recorded" />}
            </Panel>

            <div className="ohc-stack">
              <Panel title="Health Profile" plain noMargin>
                <div className="ohc-legend">
                  <div><span>Age / Gender</span><b>{emp.age} / {emp.gender}</b></div>
                  <div><span>Role</span><b>{emp.role}</b></div>
                  <div><span>Blood Group</span><b>{emp.blood_group}</b></div>
                  <div><span>Allergy</span><b>{emp.allergy}</b></div>
                  <div><span>Last BP</span><b>{lastVitals ? `${lastVitals.bp_sys}/${lastVitals.bp_dia}` : '—'}</b></div>
                  <div><span>Last Weight / BMI</span><b>{lastVitals ? `${lastVitals.weight} kg / ${bmi(lastVitals)}` : '—'}</b></div>
                  <div><span>Last Doctor Visit</span><b>{lastDoctor ? fmtDate(lastDoctor.created_at) : '—'}</b></div>
                  <div><span>Frequent Complaint</span><b>{mine.length ? top.label : '—'}</b></div>
                </div>
              </Panel>
              <Panel title="Follow-ups & Referrals" plain noMargin>
                {fus.length ? (
                  <div className="ohc-mini-list">
                    {fus.map((f) => (
                      <div key={f.id}>
                        <span className="ohc-mini-main"><b>{f.reason}</b><small>{f.action} • {fmtDate(f.review_date)}</small></span>
                        <Pill meta={followupStatus(f)} />
                      </div>
                    ))}
                  </div>
                ) : <p className="ohc-muted">None</p>}
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
