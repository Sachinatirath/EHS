import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import {
  IconPlus, IconRepeat, IconSearch, IconCheckCircle, IconArrowUpRight, IconTool, IconAlertTriangle,
} from '../../components/icons';
import { STAGE_PIPELINE, CHANGE_CATEGORY_DISTRIBUTION, CRITICAL_ALERTS } from '../../data/mocData';

export default function MocDashboard({ pushToast, onNavigate }) {
  const [activeStage, setActiveStage] = useState(null);

  const handleStageClick = (label) => {
    setActiveStage(label);
    pushToast(`Showing MOCs in stage: ${label}.`, 'info');
    onNavigate('moc-register');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Management Dashboard"
        subtitle="End-to-end Management of Change workflow with risk assessment, approvals, action tracking and post-change verification"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('moc-new')}>
            <IconPlus /> Raise New MOC
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={68} label="Total MOCs" variant="blue" icon={<IconRepeat size={18} />} delay={0} />
        <StatCard value={9} label="Under Review" variant="amber" icon={<IconSearch size={18} />} delay={40} />
        <StatCard value={6} label="Pending Approval" variant="green" icon={<IconCheckCircle size={18} />} delay={80} />
        <StatCard value={17} label="Actions Open" variant="red" icon={<IconArrowUpRight size={18} />} delay={120} />
        <StatCard value={8} label="Implementation" variant="blue" icon={<IconTool size={18} />} delay={160} />
        <StatCard value={3} label="Overdue" variant="amber" icon={<IconAlertTriangle size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <Panel noMargin style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>MOC Stage Pipeline</h3>
          <div className="stage-pill-row">
            {STAGE_PIPELINE.map((s) => (
              <button
                key={s.label}
                type="button"
                className={`stage-pill${activeStage === s.label ? ' active' : ''}`}
                onClick={() => handleStageClick(s.label)}
              >
                {s.label} {s.count}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Change Category Distribution</h3>
          {CHANGE_CATEGORY_DISTRIBUTION.map((c) => (
            <div className="dept-bar-row" key={c.label}>
              <div className="dept-bar-head">
                <span>{c.label}</span>
                <span>{c.value}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel noMargin plain title="Critical MOC Alerts" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          {CRITICAL_ALERTS.map((f) => (
            <div key={f.id} className="finding-item" onClick={() => pushToast(`${f.id} opened.`, 'info')}>
              <div className="finding-title">
                {f.id} — {f.title} <span className={`pill ${f.pillClass}`} style={{ marginLeft: 6 }}>{f.tag}</span>
              </div>
              <div className="finding-meta">{f.meta}</div>
            </div>
          ))}
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('moc-register')}>
            Open Management View
          </button>
        </Panel>
      </div>
    </div>
  );
}
