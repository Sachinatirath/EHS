import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import { IconHoist, IconCheckCircle, IconClock, IconAlertTriangle, IconPercent, IconPlus } from '../../components/icons';
import { EQUIPMENT_TYPE_SUMMARY, INSPECTION_CATEGORIES, CRITICAL_FINDINGS } from '../../data/hoistData';

export default function HoistDashboard({ pushToast, onNavigate }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Hoist & EOT Crane Safety Dashboard"
        subtitle="Remote hoist below 5T and EOT crane below 20T — inspection & compliance control"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ho-audit')}>
            <IconPlus /> New Audit
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={48} label="Total Equipment" variant="blue" icon={<IconHoist size={18} />} delay={0} />
        <StatCard value={39} label="Valid / Passed" variant="amber" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={5} label="Due Soon" variant="green" icon={<IconClock size={18} />} delay={80} />
        <StatCard value={4} label="Rejected" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value="91.7%" label="Compliance" variant="blue" icon={<IconPercent size={18} />} delay={160} />
      </div>

      <div className="two-col">
        <Panel noMargin>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Audit Compliance</h3>
            <span style={{ fontSize: 14, color: 'var(--slate-500)' }}>91.7%</span>
          </div>
          <div className="progress-track" style={{ marginTop: 10 }}><div className="progress-fill" style={{ width: '91.7%' }} /></div>
          <div className="split-row" style={{ marginTop: 8 }}>
            <span>Audited: 44</span>
            <span>Pending: 4</span>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 12px' }}>Equipment Type Summary</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Type</th><th>Total</th><th>Valid</th><th>Due</th><th>Rejected</th></tr>
              </thead>
              <tbody>
                {EQUIPMENT_TYPE_SUMMARY.map((r) => (
                  <tr key={r.type}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.type}</td>
                    <td>{r.total}</td>
                    <td>{r.valid}</td>
                    <td>{r.due}</td>
                    <td>{r.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 12px' }}>Inspection Categories</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {INSPECTION_CATEGORIES.map((c) => (
              <div key={c.label} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '14px 16px', background: 'var(--slate-50)' }}>
                <div style={{ fontSize: 12.5, color: 'var(--slate-500)', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-700)' }}>{c.value}%</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel noMargin accent="amber">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Critical Findings</h3>
          {CRITICAL_FINDINGS.map((f) => (
            <div key={f.id} className="finding-item" onClick={() => pushToast(`${f.id} — ${f.title} opened.`, 'info')}>
              <div className="finding-title">{f.id} — {f.title}</div>
              <div className="finding-meta">{f.meta}</div>
              <span className={`pill ${f.pillClass}`} style={{ marginTop: 6 }}>{f.tag}</span>
            </div>
          ))}
          <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('ho-corrective')}>
            View Corrective Actions
          </button>
        </Panel>
      </div>
    </div>
  );
}
