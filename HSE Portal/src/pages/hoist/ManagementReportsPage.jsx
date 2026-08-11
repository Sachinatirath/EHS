import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import {
  IconPrinter, IconDownload, IconHoist, IconClock, IconPercent,
  IconAlertTriangle, IconArrowUpRight,
} from '../../components/icons';
import { AUDIT_AREAS, MONTHLY_SUMMARY } from '../../data/hoistData';

export default function ManagementReportsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Management Reports & Analytics"
        subtitle="HOD / Safety HOD monthly management review"
        actions={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              <IconPrinter size={15} /> Print / PDF
            </button>
            <button type="button" className="btn btn-primary" onClick={() => pushToast('Report data exported to CSV.', 'info')}>
              <IconDownload size={15} /> Export CSV
            </button>
          </>
        )}
      />

      <div className="stat-grid">
        <StatCard value={48} label="Total Equipment" variant="blue" icon={<IconHoist size={18} />} delay={0} />
        <StatCard value={44} label="Audited" variant="amber" icon={<IconClock size={18} />} delay={40} />
        <StatCard value="91.7%" label="Compliance" variant="green" icon={<IconPercent size={18} />} delay={80} />
        <StatCard value={4} label="Rejected" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={7} label="Open Actions" variant="blue" icon={<IconArrowUpRight size={18} />} delay={160} />
      </div>

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Audit Areas</h3>
          {AUDIT_AREAS.map((a) => (
            <div className="dept-bar-row" key={a.label}>
              <div className="dept-bar-head">
                <span>{a.label}</span>
                <span>{a.value}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${a.value}%` }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel noMargin accent="amber">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Monthly Management Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {MONTHLY_SUMMARY.map((s) => (
              <div key={s.label} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '12px 14px', background: 'var(--slate-50)' }}>
                <div style={{ fontSize: 12, color: 'var(--slate-500)', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-700)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Approval Workflow</h3>
          <p style={{ fontSize: 12.5, color: 'var(--slate-500)', lineHeight: 1.6 }}>
            Inspector → Area HOD → Safety HOD → Corrective Action → Verification → Closure
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => pushToast('Management report generated.', 'success')}
          >
            Generate Management Report
          </button>
        </Panel>
      </div>
    </div>
  );
}
