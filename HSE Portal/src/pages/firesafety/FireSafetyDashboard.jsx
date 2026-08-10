import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import {
  IconPlus, IconFlame, IconCheckCircle, IconAlertTriangle, IconTool,
} from '../../components/icons';
import { ASSET_COMPLIANCE, CRITICAL_ALERTS, WORKFLOW_STEPS, STATUS_PILL } from '../../data/fireSafetyData';

export default function FireSafetyDashboard({ pushToast, onNavigate }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Fire Equipment Audit Dashboard"
        subtitle="Digital inspection, compliance, observations, corrective actions, AMC and HOD reporting"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('fs-new-audit')}>
            <IconPlus /> Start Fire Audit
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={286} label="Total Fire Assets" color="#2563eb" bg="#eef4ff" icon={<IconFlame size={18} />} delay={0} />
        <StatCard value={241} label="Audited This Month" color="#b45309" bg="#fef1d6" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={218} label="Compliant" color="#15803d" bg="#d9f6e4" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={23} label="Open Findings" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={7} label="Critical / High" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={160} />
        <StatCard value={12} label="AMC / Test Due" color="#2563eb" bg="#eef4ff" icon={<IconTool size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--blue-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Asset Compliance by Equipment</h3>
            {ASSET_COMPLIANCE.map((a) => (
              <div className="dept-bar-row" key={a.label}>
                <div className="dept-bar-head">
                  <span>{a.label} — {a.count}</span>
                  <span>{a.value}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-fill-red" style={{ width: `${a.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Critical Alerts</h3>
            {CRITICAL_ALERTS.map((f) => (
              <div key={f.id} className="finding-item" onClick={() => pushToast(`${f.id} opened.`, 'info')}>
                <div className="finding-title">
                  {f.id} — {f.title} <span className={`pill ${STATUS_PILL[f.tag]}`} style={{ marginLeft: 6 }}>{f.tag}</span>
                </div>
                <div className="finding-meta">{f.meta}</div>
              </div>
            ))}
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('fs-observations')}>
              Open Findings
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--red-500)' }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Fire Safety Audit Workflow</h3>
          <div className="workflow-grid">
            {WORKFLOW_STEPS.map((step, i) => (
              <div className="workflow-step" key={step}>
                <div className="step-index">{i + 1}</div>
                <div className="step-title">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
