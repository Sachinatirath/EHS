import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Skeleton from './Skeleton';
import { IconClipboard, IconAlertTriangle, IconClock, IconCheckCircle } from '../../components/icons';
import { apiFetch } from './store';
import { STATUS_META, formatDate } from './statusMeta';
import { buildDepartmentBreakdown, buildTypeBreakdown, buildMonthlyTrend } from './chartData';
import GroupedBarChart from './GroupedBarChart';
import DonutChart from './DonutChart';
import TrendAreaChart from './TrendAreaChart';

export default function HodDashboardPage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch('/dashboard/summary'), apiFetch('/incidents')])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setIncidents(list);
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const { departments, series } = useMemo(() => buildDepartmentBreakdown(incidents), [incidents]);
  const typeSlices = useMemo(() => buildTypeBreakdown(incidents), [incidents]);
  const monthlyTrend = useMemo(() => buildMonthlyTrend(incidents), [incidents]);
  const active = useMemo(
    () => incidents.filter((i) => i.status === 'open' || i.status === 'under_investigation').slice(0, 8),
    [incidents],
  );

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Dashboard"
        subtitle="Plant-wide safety incident reporting"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('ir-hod-incidents')}>
            <IconClipboard size={15} /> View All
          </button>
        )}
      />

      {loading || !summary ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={summary.total_incidents} label="Total Incidents" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={summary.open_count} label="Open" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
          <StatCard value={summary.under_investigation_count} label="Under Investigation" variant="blue" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={summary.reported_this_month} label="Reported This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Incidents by Department</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>By investigation status</p>
          {loading ? <Skeleton height={220} radius={12} /> : <GroupedBarChart departments={departments} series={series} />}
        </Panel>

        <Panel noMargin accent="var(--ir-primary)">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Incidents by Type</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>All departments</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><Skeleton width={176} height={176} radius={176} /></div>
          ) : (
            <DonutChart slices={typeSlices} />
          )}
        </Panel>
      </div>

      <Panel noMargin style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Incidents Reported</h3>
        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>Last 6 months</p>
        {loading ? <Skeleton height={220} radius={12} /> : <TrendAreaChart points={monthlyTrend} />}
      </Panel>

      <Panel
        noMargin
        style={{ marginTop: 18 }}
        title="Active Incidents"
        plain
        actions={<button type="button" className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => onNavigate('ir-hod-incidents')}>View All</button>}
      >
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Incident No</th><th>Filed</th><th>Agent</th><th>Department</th><th>Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i}><td colSpan={6}><Skeleton height={18} /></td></tr>
                ))
              ) : (
                <>
                  {active.map((i) => {
                    const meta = STATUS_META[i.status];
                    return (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{i.incident_no}</td>
                        <td>{formatDate(i.created_at)}</td>
                        <td>{i.agent.name}</td>
                        <td>{i.department || '—'}</td>
                        <td>{i.incident_type}</td>
                        <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                      </tr>
                    );
                  })}
                  {!active.length && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No active incidents. Everything is up to date.</td></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
