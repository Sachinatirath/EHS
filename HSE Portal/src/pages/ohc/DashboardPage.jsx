import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import GroupedBarChart from '../fastaid/GroupedBarChart';
import DonutChart from '../fastaid/DonutChart';
import {
  IconUsers, IconClipboard, IconStethoscope, IconPill, IconBell, IconPlus, IconAlertTriangle, IconCheckCircle, IconArrowRight,
} from '../../components/icons';
import {
  useOhc, findEmployee, todayKey, addDays, dayKey, fmtDate, medicineStatus, isFollowupDue, setPending, updateSettings,
} from './store';
import { ExportBar, StagePill } from './shared';
import { complaintBreakdown, dailyReportPdf, visitsExcel } from './reports';
import './ohc.css';

const SLICE_COLORS = ['#1f4e9e', '#3fa34d', '#d97706', '#0284c7', '#7c3aed', '#dc2626', '#0e7490', '#db2777', '#c2410c', '#94a3b8'];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Stage → page that works on it, so a queue row opens the right screen.
const STAGE_VIEW = { nurse: 'dm-nurse', doctor: 'dm-doctor', pharmacy: 'dm-prescriptions', completed: 'dm-history' };

export default function DashboardPage({ onNavigate, pushToast }) {
  const { visits, medicines, followups, issues, settings, prescriptions } = useOhc();
  const today = todayKey();
  const todays = visits.filter((v) => dayKey(v.created_at) === today);
  const consults = todays.filter((v) => v.doctor).length;
  const issuedToday = issues.filter((i) => dayKey(i.at) === today).reduce((s, i) => s + i.qty, 0);
  const due = followups.filter(isFollowupDue);

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const weekCounts = week.map((d) => visits.filter((v) => dayKey(v.created_at) === d).length);
  const prevAvg = Math.round(weekCounts.slice(0, 6).reduce((s, n) => s + n, 0) / 6);

  const monthVisits = visits.filter((v) => dayKey(v.created_at) >= `${today.slice(0, 8)}01`);
  const breakdown = complaintBreakdown(monthVisits);
  const top = breakdown.slice(0, 5);
  const otherVal = breakdown.slice(5).reduce((s, r) => s + r.value, 0);
  const slices = [...top, { label: 'Other', value: otherVal, pct: 100 - top.reduce((s, r) => s + r.pct, 0) }]
    .map((s, i) => ({ ...s, color: SLICE_COLORS[i] }));

  const lowStock = medicines.filter((m) => ['low', 'out'].includes(medicineStatus(m).key));
  const expiring = medicines.filter((m) => medicineStatus(m).key === 'expiring');
  const expired = medicines.filter((m) => medicineStatus(m).key === 'expired');
  const referrals = followups.filter((f) => f.status === 'referred');
  const pendingRx = prescriptions.filter((r) => r.status === 'pending');
  const alerts = [
    ...expired.map((m) => ({ tone: 'red', text: `${m.name} (batch ${m.batch}) expired ${fmtDate(m.expiry)} — remove from stock`, go: 'dm-medicines' })),
    ...(settings.low_stock_alerts ? lowStock.map((m) => ({ tone: 'amber', text: `${m.name} — low stock: ${m.stock} ${m.unit} (reorder at ${m.reorder})`, go: 'dm-medicines' })) : []),
    ...expiring.map((m) => ({ tone: 'amber', text: `${m.name} expires ${fmtDate(m.expiry)}`, go: 'dm-medicines' })),
    ...(settings.followup_reminders && due.length ? [{ tone: 'amber', text: `${due.length} follow-up${due.length === 1 ? '' : 's'} due or overdue`, go: 'dm-followup' }] : []),
    ...(pendingRx.length ? [{ tone: 'blue', text: `${pendingRx.length} prescription${pendingRx.length === 1 ? '' : 's'} waiting at pharmacy`, go: 'dm-prescriptions' }] : []),
    referrals.length
      ? { tone: 'blue', text: `${referrals.length} external referral${referrals.length === 1 ? '' : 's'} open`, go: 'dm-followup' }
      : { tone: 'green', text: 'No critical referral pending' },
  ];

  const openVisit = (v) => {
    setPending(STAGE_VIEW[v.stage], v.stage === 'completed' ? { employeeId: v.employee_id } : { visitId: v.id });
    onNavigate(STAGE_VIEW[v.stage]);
  };

  const quick = [
    { label: 'New OP Registration', icon: IconPlus, view: 'dm-op' },
    { label: 'Nurse Assessment', icon: IconClipboard, view: 'dm-nurse', count: todays.filter((v) => v.stage === 'nurse').length },
    { label: 'Doctor Consultation', icon: IconStethoscope, view: 'dm-doctor', count: todays.filter((v) => v.stage === 'doctor').length },
    { label: 'Issue Medicine', icon: IconPill, view: 'dm-prescriptions', count: pendingRx.length },
  ];

  return (
    <div className="page-enter ohc-page">
      <div className="ohc-hero">
        <div className="ohc-hero-text">
          <span className="ohc-hero-kicker">Digital Occupational Health Management</span>
          <h1>OHC Command Dashboard</h1>
          <p>{settings.workforce.toLocaleString()} employee workforce • {fmtDate(today)} • Opening hours {settings.opening_hours}</p>
        </div>
        <div className="ohc-hero-side">
          <button
            type="button"
            className={`ohc-open-chip${settings.ohc_open ? '' : ' is-closed'}`}
            title="Click to toggle OHC status"
            onClick={() => updateSettings({ ohc_open: !settings.ohc_open })}
          >
            <span className="ohc-live-dot" /> OHC {settings.ohc_open ? 'OPEN' : 'CLOSED'}
          </button>
          <ExportBar
            pushToast={pushToast}
            pdfLabel="Daily Report"
            onPdf={() => dailyReportPdf()}
            onExcel={() => visitsExcel(todays, `OHC-visits-${today}.xlsx`)}
          />
        </div>
      </div>

      <div className="stat-grid">
        <StatCard value={settings.workforce.toLocaleString()} label="Total Employees" variant="blue" icon={<IconUsers size={18} />} delay={0} />
        <StatCard value={todays.length} label={`Today's OP Visits • 6-day avg ${prevAvg}`} variant="teal" icon={<IconClipboard size={18} />} delay={40} />
        <StatCard value={consults} label={`Doctor Consultations • ${todays.length ? Math.round((consults / todays.length) * 100) : 0}% of visits`} variant="violet" icon={<IconStethoscope size={18} />} delay={80} />
        <StatCard value={issuedToday} label="Medicines Issued Today" variant="green" icon={<IconPill size={18} />} delay={120} />
        <StatCard value={String(due.length).padStart(2, '0')} label="Follow-ups Due" variant="amber" icon={<IconBell size={18} />} delay={160} />
      </div>

      <div className="two-col">
        <Panel title="OHC Visit Trend" plain noMargin>
          <p className="ohc-muted">Last 7 days</p>
          <GroupedBarChart
            months={week.map((d, i) => (i === 6 ? 'Today' : DAY[new Date(`${d}T00:00:00`).getDay()]))}
            series={[{ key: 'OP visits', color: '#2d62b8', values: weekCounts }]}
            height={230}
          />
        </Panel>
        <Panel title="Visit Reason Distribution" plain noMargin>
          <p className="ohc-muted">Current month • {monthVisits.length} visits</p>
          <DonutChart slices={slices} size={170} showLegend={false} />
          <div className="ohc-legend">
            {slices.map((s) => (
              <div key={s.label}><span><i style={{ background: s.color }} />{s.label}</span><b>{s.pct}%</b></div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="two-col" style={{ marginTop: 22 }}>
        <Panel
          title="Today's OP Queue"
          plain
          noMargin
          actions={<button type="button" className="btn btn-outline btn-sm no-print" onClick={() => onNavigate('dm-op')}><IconPlus size={14} /> Register</button>}
        >
          <div className="table-wrap">
            <table className="data-table compact">
              <thead><tr><th>Token</th><th>Employee</th><th>Complaint</th><th>Stage</th><th className="no-print" /></tr></thead>
              <tbody>
                {todays.map((v) => (
                  <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => openVisit(v)}>
                    <td><b>{v.token}</b></td>
                    <td>{v.employee_id} {findEmployee(v.employee_id)?.name}</td>
                    <td>{v.complaint}</td>
                    <td><StagePill stage={v.stage} /></td>
                    <td className="no-print"><IconArrowRight size={14} /></td>
                  </tr>
                ))}
                {!todays.length ? <tr><td colSpan={5} className="ohc-muted" style={{ textAlign: 'center', padding: 24 }}>No visits registered today.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="OHC Alerts" plain noMargin icon={<IconAlertTriangle size={16} />}>
          <div className="ohc-alerts">
            {alerts.map((a, i) => (
              <button
                key={a.text}
                type="button"
                className={`ohc-alert tone-${a.tone}`}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={a.go ? () => onNavigate(a.go) : undefined}
              >
                {a.tone === 'green' ? <IconCheckCircle size={15} /> : <IconAlertTriangle size={15} />}
                <span>{a.text}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Quick Actions" plain style={{ marginTop: 22 }}>
        <div className="ohc-quick">
          {quick.map((q, i) => {
            const Icon = q.icon;
            return (
              <button key={q.view} type="button" style={{ animationDelay: `${i * 60}ms` }} onClick={() => onNavigate(q.view)}>
                <span className="ohc-quick-icon"><Icon size={20} /></span>
                <span>{q.label}</span>
                {q.count ? <span className="ohc-quick-badge">{q.count}</span> : null}
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
