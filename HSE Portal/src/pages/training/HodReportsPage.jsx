import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import { IconPrinter, IconPercent } from '../../components/icons';
import { ACTION_REQUIRED } from '../../data/trainingData';

export default function HodReportsPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Training Report"
        subtitle="Management review and monthly compliance summary"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            <IconPrinter size={15} /> Print / Save PDF
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value="93%" label="Overall Compliance" variant="blue" icon={<IconPercent size={18} />} delay={0} />
        <StatCard value="98%" label="Induction" variant="amber" icon={<IconPercent size={18} />} delay={40} />
        <StatCard value="91%" label="Special Training" variant="green" icon={<IconPercent size={18} />} delay={80} />
        <StatCard value="95%" label="Certificate Validity" variant="red" icon={<IconPercent size={18} />} delay={120} />
        <StatCard value={7} label="HOD Pending" variant="blue" icon={<IconPercent size={18} />} delay={160} />
      </div>

      <div className="two-col">
        <Panel noMargin plain title="Management Summary">
          <p style={{ fontSize: 13.5, color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>
            Training requirements are generated from job role, department, risk assessment, incidents, audits and competency needs.
            Employee-wise records include attendance, assessment, competency, certificates, expiry and refresher tracking.
          </p>
        </Panel>

        <Panel noMargin plain accent="amber" title="Action Required">
          <ul className="side-list">
            {ACTION_REQUIRED.map((a) => (
              <li key={a.text} style={{ cursor: 'pointer' }} onClick={() => pushToast(a.text, 'info')}>
                <div className="side-sub" style={{ fontSize: 13.5, color: 'var(--slate-700)' }}>{a.text}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
