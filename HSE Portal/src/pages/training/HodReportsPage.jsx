import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
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
        <StatCard value="93%" label="Overall Compliance" color="#2563eb" bg="#eef4ff" icon={<IconPercent size={18} />} delay={0} />
        <StatCard value="98%" label="Induction" color="#b45309" bg="#fef1d6" icon={<IconPercent size={18} />} delay={40} />
        <StatCard value="91%" label="Special Training" color="#15803d" bg="#d9f6e4" icon={<IconPercent size={18} />} delay={80} />
        <StatCard value="95%" label="Certificate Validity" color="#dc2626" bg="#fde0e0" icon={<IconPercent size={18} />} delay={120} />
        <StatCard value={7} label="HOD Pending" color="#2563eb" bg="#eef4ff" icon={<IconPercent size={18} />} delay={160} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Management Summary</h3>
            <p style={{ fontSize: 13.5, color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>
              Training requirements are generated from job role, department, risk assessment, incidents, audits and competency needs.
              Employee-wise records include attendance, assessment, competency, certificates, expiry and refresher tracking.
            </p>
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderTop: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Action Required</h3>
            <ul className="side-list">
              {ACTION_REQUIRED.map((a) => (
                <li key={a.text} style={{ cursor: 'pointer' }} onClick={() => pushToast(a.text, 'info')}>
                  <div className="side-sub" style={{ fontSize: 13.5, color: 'var(--slate-700)' }}>{a.text}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
