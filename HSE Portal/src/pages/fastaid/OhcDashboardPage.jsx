import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { IconFirstAid, IconClipboard, IconCheckCircle, IconAlertTriangle, IconArrowUpRight, IconEye } from '../../components/icons';
import { STAT_VARIANTS } from '../../data/statColors';
import { apiFetch, setPendingTarget } from './store';
import { formatDate } from './statusMeta';
import { COMPLETION_RATE_TREND, EXPIRED_MISSING_BREAKDOWN, REFILLS_BY_DEPARTMENT } from './chartData';
import GroupedBarChart from './GroupedBarChart';
import DonutChart from './DonutChart';
import TrendAreaChart from './TrendAreaChart';

// Same four tiles (and the same illustrative "vs last month" deltas) as the
// mobile OHC DashboardScreen.
const STAT_DEFS = [
  { key: 'total_boxes', label: 'Boxes Under Monitoring', icon: IconFirstAid, variant: 'teal', deltaLabel: '4 vs last month', deltaUp: true },
  { key: 'pending_refill_requests', label: 'Pending Refill Requests', icon: IconClipboard, variant: 'amber', deltaLabel: '2 vs last month', deltaUp: false },
  { key: 'inspections_this_month', label: 'Inspections This Month', icon: IconCheckCircle, variant: 'green', deltaLabel: '12 vs last month', deltaUp: true },
  { key: 'overdue_boxes', label: 'Overdue Boxes', icon: IconAlertTriangle, variant: 'red', deltaLabel: '1 vs last month', deltaUp: false },
];

function DeltaStat({ def, value, delay }) {
  const variant = STAT_VARIANTS[def.variant];
  const Icon = def.icon;
  return (
    <div className="stat-card" style={{ '--accent-color': variant.color, '--accent-bg': variant.bg, animationDelay: `${delay}ms` }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{def.label}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
          fontSize: 11,
          fontWeight: 700,
          color: def.deltaUp ? 'var(--green-600)' : 'var(--red-600)',
        }}
      >
        <span style={{ display: 'flex', transform: def.deltaUp ? 'none' : 'rotate(90deg)' }}><IconArrowUpRight size={12} /></span>
        {def.deltaLabel}
      </div>
      <span className="stat-icon"><Icon size={18} /></span>
    </div>
  );
}

export default function OhcDashboardPage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch('/dashboard/ohc-summary'), apiFetch('/refills')])
      .then(([s, all]) => {
        if (cancelled) return;
        setSummary(s);
        setActive(all.filter((r) => r.status !== 'closed' && r.status !== 'rejected').slice(0, 8));
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const openRefill = (id) => {
    setPendingTarget('fa-ohc-refills', { refillId: id });
    onNavigate('fa-ohc-refills');
  };

  return (
    <div className="page-enter">
      <PageHeader title="OHC Dashboard" subtitle="Plant-wide first aid box compliance" />

      {loading || !summary ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={116} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {STAT_DEFS.map((def, i) => <DeltaStat key={def.key} def={def} value={summary[def.key]} delay={i * 40} />)}
        </div>
      )}

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Refill Requests by Department</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>Last 6 months</p>
          {loading ? <Skeleton height={220} radius={12} /> : <GroupedBarChart months={REFILLS_BY_DEPARTMENT.months} series={REFILLS_BY_DEPARTMENT.series} />}
        </Panel>

        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Most Commonly Expired / Missing</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>All boxes</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><Skeleton width={176} height={176} radius={176} /></div>
          ) : (
            <DonutChart slices={EXPIRED_MISSING_BREAKDOWN} />
          )}
        </Panel>
      </div>

      <Panel noMargin style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Inspection Completion Rate</h3>
        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>% of scheduled inspections closed</p>
        {loading ? <Skeleton height={220} radius={12} /> : <TrendAreaChart months={COMPLETION_RATE_TREND.months} values={COMPLETION_RATE_TREND.values} />}
      </Panel>

      <div className="panel" style={{ margin: '18px 0 0' }}>
        <div className="panel-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Refill Requests</h3>
            <button type="button" className="btn btn-outline" style={{ padding: '4px 12px' }} onClick={() => onNavigate('fa-ohc-refills')}>View All</button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Request ID</th><th>Assigned</th><th>Box</th><th>Department</th><th>Flagged Items</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}><td colSpan={7}><Skeleton height={18} /></td></tr>
                  ))
                ) : (
                  <>
                    {active.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => openRefill(item.id)}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.request_code}</td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>{item.box.box_number}</td>
                        <td>{item.box.department}</td>
                        <td>{item.flagged_item_count} item{item.flagged_item_count === 1 ? '' : 's'}</td>
                        <td><StatusPill kind={item.status} /></td>
                        <td>
                          <button
                            type="button"
                            className={`btn ${item.status === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '5px 12px' }}
                            onClick={(e) => { e.stopPropagation(); openRefill(item.id); }}
                          >
                            <IconEye size={14} /> {item.status === 'pending' ? 'View & Submit' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!active.length && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>
                          No active refill requests — everything is up to date.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
