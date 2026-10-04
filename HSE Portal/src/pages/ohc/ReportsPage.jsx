import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import GroupedBarChart from '../fastaid/GroupedBarChart';
import {
  IconFileText, IconBarChart, IconPill, IconUsers, IconFlag, IconLayers, IconCalendarCheck,
} from '../../components/icons';
import { useOhc, todayKey, addDays, fmtMonth } from './store';
import { ExportBar, BarList } from './shared';
import { downloadPdf } from './ohcExport';
import {
  visitsInRange, complaintBreakdown, departmentBreakdown, medicineConsumption, monthlyKpis,
  dailyReportPdf, monthlyMisExcel, medicineConsumptionExcel, employeeHistoryExcel, followupsExcel, departmentAnalysisExcel,
} from './reports';
import './ohc.css';

export default function ReportsPage({ pushToast }) {
  useOhc(); // re-render when data changes
  const [busy, setBusy] = useState(null);
  const today = todayKey();
  const from = `${today.slice(0, 8)}01`;
  const visits = visitsInRange(from, today);
  const k = monthlyKpis();
  const depts = departmentBreakdown(visits).sort((a, b) => b.value - a.value);
  const complaints = complaintBreakdown(visits).slice(0, 6).map((c) => ({ label: c.label, value: c.pct }));
  const meds = medicineConsumption(from, today).slice(0, 6).map((m) => ({ label: m.name, value: m.qty }));

  // Weekly volume, last 8 weeks (oldest first).
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = addDays(today, -7 * (7 - i));
    const start = addDays(end, -6);
    const wv = visitsInRange(start, end);
    return { label: i === 7 ? 'This wk' : `${start.slice(8)}/${start.slice(5, 7)}`, visits: wv.length, consults: wv.filter((v) => v.doctor).length };
  });

  const REPORTS = [
    { key: 'daily', label: 'Daily OHC Report', sub: 'PDF • today', icon: IconFileText, run: () => dailyReportPdf() },
    { key: 'mis', label: 'Monthly MIS', sub: `Excel • ${fmtMonth(from)}`, icon: IconBarChart, run: monthlyMisExcel },
    { key: 'meds', label: 'Medicine Consumption', sub: 'Excel • this month', icon: IconPill, run: medicineConsumptionExcel },
    { key: 'history', label: 'Employee Medical History', sub: 'Excel • all employees', icon: IconUsers, run: employeeHistoryExcel },
    { key: 'referral', label: 'Referral Report', sub: 'Excel • follow-ups & referrals', icon: IconFlag, run: () => followupsExcel() },
    { key: 'dept', label: 'Department Analysis', sub: 'Excel • this month', icon: IconLayers, run: departmentAnalysisExcel },
    { key: 'yesterday', label: "Yesterday's OHC Report", sub: 'PDF • previous day', icon: IconCalendarCheck, run: () => dailyReportPdf(addDays(today, -1)) },
  ];

  const generate = (r) => async () => {
    setBusy(r.key);
    try {
      await r.run();
      pushToast(`${r.label} generated`, 'success');
    } catch (err) {
      pushToast(err.message || 'Could not generate report', 'error');
    } finally {
      setBusy(null);
    }
  };

  const pdf = () => downloadPdf({
    title: 'OHC Analytics Summary',
    subtitle: fmtMonth(from),
    filename: `OHC-analytics-${today.slice(0, 7)}.pdf`,
    blocks: [
      { heading: 'Monthly KPIs', kv: [['Total OP visits', k.visits], ['Doctor consultations', k.consults], ['Medicines issued (units)', k.issued], ['External referrals', k.referrals], ['Rest advised', k.restAdvised], ['Follow-ups completed', `${k.followupRate}%`]] },
      { heading: 'Department OHC Visits', columns: ['Department', 'Visits'], widths: [3, 1], rows: depts.map((d) => [d.label, d.value]) },
      { heading: 'Top Complaints', columns: ['Complaint', 'Share %'], widths: [3, 1], rows: complaintBreakdown(visits).map((c) => [c.label, `${c.pct}%`]) },
      { heading: 'Medicine Consumption', columns: ['Medicine', 'Units'], widths: [3, 1], rows: medicineConsumption(from, today).map((m) => [m.name, `${m.qty} ${m.unit}`]) },
    ],
  });

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="Reports & Analytics" subtitle={`Management analytics and downloadable MIS • ${fmtMonth(from)}`} actions={<ExportBar pushToast={pushToast} onPdf={pdf} pdfLabel="Summary PDF" onExcel={monthlyMisExcel} excelLabel="Monthly MIS" />} />

      <div className="ohc-grid3">
        <Panel title="Department OHC Visits" plain noMargin><BarList rows={depts} /></Panel>
        <Panel title="Monthly KPIs" plain noMargin>
          <div className="ohc-legend">
            <div><span>Total OP visits</span><b>{k.visits}</b></div>
            <div><span>Doctor consultations</span><b>{k.consults}</b></div>
            <div><span>Medicines issued</span><b>{k.issued}</b></div>
            <div><span>External referrals</span><b>{k.referrals}</b></div>
            <div><span>Rest advised</span><b>{k.restAdvised}</b></div>
            <div><span>Follow-ups completed</span><b>{k.followupRate}%</b></div>
          </div>
        </Panel>
        <Panel title="Top Complaints" plain noMargin><BarList rows={complaints} color="var(--teal-500)" suffix="%" /></Panel>
      </div>

      <div className="two-col" style={{ marginTop: 22 }}>
        <Panel title="Weekly Visit Volume" plain noMargin>
          <p className="ohc-muted">Last 8 weeks</p>
          <GroupedBarChart
            months={weeks.map((w) => w.label)}
            series={[{ key: 'OP visits', color: '#2d62b8', values: weeks.map((w) => w.visits) }, { key: 'Doctor consultations', color: '#3fa34d', values: weeks.map((w) => w.consults) }]}
          />
        </Panel>
        <Panel title="Medicine Consumption" plain noMargin>
          <p className="ohc-muted">Units issued this month</p>
          {meds.length ? <BarList rows={meds} color="var(--violet-600)" /> : <p className="ohc-muted">No issues this month.</p>}
        </Panel>
      </div>

      <Panel title="Report Center" plain style={{ marginTop: 22 }}>
        <div className="ohc-reports">
          {REPORTS.map((r, i) => {
            const Icon = r.icon;
            return (
              <button key={r.key} type="button" disabled={!!busy} style={{ animationDelay: `${i * 50}ms` }} onClick={generate(r)}>
                <span className="ohc-quick-icon"><Icon size={19} /></span>
                <span className="ohc-report-text"><b>{busy === r.key ? 'Generating…' : r.label}</b><small>{r.sub}</small></span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
