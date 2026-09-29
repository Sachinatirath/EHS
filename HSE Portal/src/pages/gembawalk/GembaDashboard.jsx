import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import StatCard from '../../components/StatCard';
import {
  IconClipboard, IconAlertTriangle, IconUser, IconClock, IconBell, IconRepeat, IconPlus, IconArrowRight,
} from '../../components/icons';
import DonutChart from '../safetyobservation/DonutChart';
import {
  GEMBA_AREAS, GEMBA_CATEGORIES, CATEGORY_META, useGemba, isEscalated, resetGembaSample, formatTarget, formatDuration,
} from './store';

/** Gemba Walk dashboard: KPIs, area / category / SLA charts and the worst overdue items. */
export default function GembaDashboard({ onNavigate, pushToast }) {
  const { records, now } = useGemba();

  const escalated = records.filter((o) => isEscalated(o, now));
  const onTrack = records.filter((o) => o.status !== 'Closed' && !isEscalated(o, now));
  const closed = records.filter((o) => o.status === 'Closed');

  const areaCounts = GEMBA_AREAS.map((a) => ({
    area: a,
    total: records.filter((o) => o.area === a).length,
    escalated: escalated.filter((o) => o.area === a).length,
  }));
  const areaMax = Math.max(1, ...areaCounts.map((a) => a.total));
  const categorySlices = GEMBA_CATEGORIES.map((c) => ({ label: c, value: records.filter((o) => o.category === c).length, color: CATEGORY_META[c].color }));
  const slaSlices = [
    { label: 'Escalated to Plant Head', value: escalated.length, color: '#dc2626' },
    { label: 'On-Track Pending', value: onTrack.length, color: '#1f4e9e' },
    { label: 'Closed', value: closed.length, color: '#16a34a' },
  ];
  const worst = [...escalated].sort((a, b) => new Date(a.targetDateTime) - new Date(b.targetDateTime)).slice(0, 5);

  const reload = () => {
    resetGembaSample();
    pushToast('Gemba sample data reloaded.', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Gemba Walk — Dashboard"
        subtitle="Real-time Gemba safety observations, assignments and Plant Head escalations"
        actions={(
          <>
            <button type="button" className="btn btn-outline" onClick={reload}><IconRepeat size={15} /> Reload Sample Data</button>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('gw-log')}><IconPlus size={15} /> Log Observation</button>
          </>
        )}
      />

      <div className="stat-grid">
        <StatCard value={records.length} label="Total Observations" variant="blue" icon={<IconClipboard size={19} />} delay={0} />
        <StatCard value={records.filter((o) => o.category === 'Unsafe Condition').length} label="Unsafe Conditions" variant="red" icon={<IconAlertTriangle size={19} />} delay={50} />
        <StatCard value={records.filter((o) => o.category === 'Unsafe Act').length} label="Unsafe Acts" variant="amber" icon={<IconUser size={19} />} delay={100} />
        <StatCard value={records.filter((o) => o.status !== 'Closed').length} label="In Progress / Open" variant="violet" icon={<IconClock size={19} />} delay={150} />
        <StatCard value={escalated.length} label="Plant Head Escalations" variant="red" icon={<IconBell size={19} />} delay={200} />
      </div>

      <div className="gemba-chart-grid">
        <Panel noMargin>
          <h3 className="gemba-chart-title">Area-wise Observations</h3>
          <div className="gemba-bars">
            {areaCounts.map((a) => (
              <div key={a.area} className="gemba-bar-row">
                <span className="gemba-bar-label">{a.area}</span>
                <span className="gemba-bar-track">
                  <span className="gemba-bar-fill" style={{ width: `${(a.total / areaMax) * 100}%` }}>
                    {a.escalated ? <span className="gemba-bar-esc" style={{ width: `${(a.escalated / a.total) * 100}%` }} /> : null}
                  </span>
                </span>
                <span className="gemba-bar-value">{a.total}</span>
              </div>
            ))}
            <div className="gemba-bar-legend">
              <span><i style={{ background: 'var(--blue-600)' }} /> Observations</span>
              <span><i style={{ background: 'var(--red-600)' }} /> Escalated</span>
            </div>
          </div>
        </Panel>
        <Panel noMargin>
          <h3 className="gemba-chart-title">Safety Category Breakdown</h3>
          <DonutChart slices={categorySlices} />
        </Panel>
        <Panel noMargin>
          <h3 className="gemba-chart-title">SLA &amp; Escalation Status</h3>
          <DonutChart slices={slaSlices} />
        </Panel>
      </div>

      <Panel
        title="Most Overdue — Escalated to Plant Head"
        icon={<IconBell size={17} />}
        accent="red"
        style={{ marginTop: 22 }}
        actions={escalated.length ? (
          <button type="button" className="btn btn-outline" style={{ padding: '5px 12px' }} onClick={() => onNavigate('gw-escalations')}>
            View all <IconArrowRight size={14} />
          </button>
        ) : null}
      >
        {worst.length ? (
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Ref ID</th><th>Missed Target</th><th>Area &amp; Location</th><th>Category</th><th>Action Owner</th><th>Overdue By</th></tr>
              </thead>
              <tbody>
                {worst.map((o) => (
                  <tr key={o.id} className="gemba-row-escalated">
                    <td style={{ fontWeight: 700, color: 'var(--red-700)' }}>{o.id}</td>
                    <td>{formatTarget(o.targetDateTime)}</td>
                    <td><div style={{ fontWeight: 600 }}>{o.area}</div><div className="gemba-sub">{o.location}</div></td>
                    <td><span className={`pill ${CATEGORY_META[o.category]?.pill}`}>{o.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{o.assignedTo}</td>
                    <td style={{ fontWeight: 700, color: 'var(--red-600)', whiteSpace: 'nowrap' }}>{formatDuration(now - new Date(o.targetDateTime))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gemba-all-clear">All observations are resolved or within their target SLA time. No escalations active.</div>
        )}
      </Panel>
    </div>
  );
}
