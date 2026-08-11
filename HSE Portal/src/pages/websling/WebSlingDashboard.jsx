import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import { IconSling, IconCheckCircle, IconClock, IconAlertTriangle, IconPlus } from '../../components/icons';
import { DEPARTMENT_SUMMARY, CRITICAL_FINDINGS } from '../../data/webSlingData';

export default function WebSlingDashboard({ pushToast, onNavigate }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Web Sling Safety Dashboard"
        subtitle="Real-time inspection, compliance and asset control overview"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ws-inspection')}>
            <IconPlus /> New Inspection
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={126} label="Total Web Slings" variant="blue" icon={<IconSling size={18} />} delay={0} />
        <StatCard value={108} label="Valid / Passed" variant="green" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={11} label="Due Soon" variant="amber" icon={<IconClock size={18} />} delay={80} />
        <StatCard value={7} label="Rejected" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
      </div>

      <div className="two-col">
        <Panel noMargin>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Inspection Compliance</h3>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-700)' }}>91.4%</span>
          </div>
          <div className="progress-track" style={{ marginTop: 10 }}><div className="progress-fill" style={{ width: '91.4%' }} /></div>
          <div className="split-row" style={{ marginTop: 8 }}>
            <span>Inspected: 119</span>
            <span>Pending: 7</span>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 12px' }}>Department Summary</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Department</th><th>Total</th><th>Valid</th><th>Rejected</th></tr>
              </thead>
              <tbody>
                {DEPARTMENT_SUMMARY.map((r) => (
                  <tr key={r.dept}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.dept}</td>
                    <td>{r.total}</td>
                    <td>{r.valid}</td>
                    <td>{r.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('ws-corrective')}>
            View Corrective Actions
          </button>
        </Panel>
      </div>

      <Panel accent="red">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
        <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ws-master')}>Manage Sling Master</button>
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('ws-inspection')}>Start Inspection</button>
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('ws-hod')}>Review HOD Approvals</button>
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('ws-reports')}>Generate Report</button>
        </div>
      </Panel>
    </div>
  );
}
