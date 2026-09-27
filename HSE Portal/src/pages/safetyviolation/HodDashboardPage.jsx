                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Skeleton from './Skeleton';
import { IconClipboard, IconAlertTriangle, IconClock, IconCheckCircle, IconArrowUpRight } from '../../components/icons';
import { apiFetch } from './store';
import { buildDepartmentBreakdown, buildTypeBreakdown, buildMonthlyTrend } from './chartData';
import GroupedBarChart from './GroupedBarChart';
import DonutChart from './DonutChart';
import TrendAreaChart from './TrendAreaChart';

export default function HodDashboardPage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch('/dashboard/summary'), apiFetch('/violations')])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setViolations(list);
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const { departments, series } = useMemo(() => buildDepartmentBreakdown(violations), [violations]);
  const typeSlices = useMemo(() => buildTypeBreakdown(violations), [violations]);
  const monthlyTrend = useMemo(() => buildMonthlyTrend(violations), [violations]);

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Dashboard"
        subtitle="Plant-wide safety violation reporting"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('sv-hod-violations')}>
            <IconClipboard size={15} /> View All
          </button>
        )}
      />

      {loading || !summary ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={summary.total_violations} label="Total Violations" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={summary.open_count} label="Open" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
          <StatCard value={summary.under_review_count} label="Reassigned to Agent" variant="blue" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={summary.reported_this_month} label="Reported This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
          <StatCard value={summary.rejected_count} label="Rejected" variant="red" icon={<IconArrowUpRight size={18} />} delay={160} />
        </div>
      )}

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Violations by Department</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>By review status</p>
          {loading ? <Skeleton height={220} radius={12} /> : <GroupedBarChart departments={departments} series={series} />}
        </Panel>

        <Panel noMargin accent="red">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Violations by Type</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>All departments</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><Skeleton width={176} height={176} radius={176} /></div>
          ) : (
            <DonutChart slices={typeSlices} />
          )}
        </Panel>
      </div>

      <Panel noMargin style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Violations Reported</h3>
        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>Last 6 months</p>
        {loading ? <Skeleton height={220} radius={12} /> : <TrendAreaChart points={monthlyTrend} />}
      </Panel>
    </div>
  );
}
