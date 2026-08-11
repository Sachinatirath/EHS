import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
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
        <StatCard value={286} label="Total Fire Assets" variant="blue" icon={<IconFlame size={18} />} delay={0} />
        <StatCard value={241} label="Audited This Month" variant="amber" icon={<IconCheckCircle size={18} />} delay={40} />
        <StatCard value={218} label="Compliant" variant="green" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={23} label="Open Findings" variant="red" icon={<IconAlertTriangle size={18} />} delay={120} />
        <StatCard value={7} label="Critical / High" variant="red" icon={<IconAlertTriangle size={18} />} delay={160} />
        <StatCard value={12} label="AMC / Test Due" variant="blue" icon={<IconTool size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <Panel noMargin plain title="Asset Compliance by Equipment" style={{ borderLeft: '3px solid var(--blue-500)' }}>
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
        </Panel>

        <Panel noMargin plain title="Critical Alerts" style={{ borderLeft: '3px solid var(--amber-500)' }}>
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
        </Panel>
      </div>

      <Panel noMargin plain title="Fire Safety Audit Workflow" style={{ borderLeft: '3px solid var(--red-500)' }}>
        <div className="workflow-grid">
          {WORKFLOW_STEPS.map((step, i) => (
            <div className="workflow-step" key={step}>
              <div className="step-index">{i + 1}</div>
              <div className="step-title">{step}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
