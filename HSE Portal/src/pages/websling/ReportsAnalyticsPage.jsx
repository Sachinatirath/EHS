import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { IconPrinter, IconDownload, IconSling, IconClock, IconPercent, IconAlertTriangle } from '../../components/icons';
import { TOP_DEFECTS, MANAGEMENT_REPORT_STATS } from '../../data/webSlingData';

const maxDefect = Math.max(...TOP_DEFECTS.map((d) => d.value));

export default function ReportsAnalyticsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Management report for HOD / Safety HOD review"
        actions={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              <IconPrinter size={15} /> Print / PDF
            </button>
            <button type="button" className="btn btn-primary" onClick={() => pushToast('Report exported as Excel-compatible CSV.', 'info')}>
              <IconDownload size={15} /> Export Excel-compatible CSV
            </button>
          </>
        )}
      />

      <div className="stat-grid">
        <StatCard value={126} label="Total Assets" color="#2563eb" bg="#eef4ff" icon={<IconSling size={18} />} delay={0} />
        <StatCard value={119} label="Inspected" color="#b45309" bg="#fef1d6" icon={<IconClock size={18} />} delay={40} />
        <StatCard value="91.4%" label="Compliance" color="#15803d" bg="#d9f6e4" icon={<IconPercent size={18} />} delay={80} />
        <StatCard value={7} label="Rejected" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={120} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Defects — Current Month</h3>
            {TOP_DEFECTS.map((d) => (
              <div className="dept-bar-row" key={d.label}>
                <div className="dept-bar-head">
                  <span>{d.label}</span>
                  <span>{d.value}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(d.value / maxDefect) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderTop: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Management Report</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {MANAGEMENT_REPORT_STATS.map((s) => (
                <div key={s.label} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '12px 14px', background: 'var(--slate-50)' }}>
                  <div style={{ fontSize: 12, color: 'var(--slate-500)', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-700)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Report Workflow</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}
