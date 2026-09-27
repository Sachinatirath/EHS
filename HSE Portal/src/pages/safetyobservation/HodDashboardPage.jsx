import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Skeleton from './Skeleton';
import { IconClipboard, IconAlertTriangle, IconClock, IconCheckCircle, IconEye } from '../../components/icons';
import { apiFetch, useSafetyObservationAuth, MANAGER } from './store';
import { STATUS_META, SLA_COLORS, formatDateTime, slaInfo } from './statusMeta';
import useSlaWatcher from './useSlaWatcher';
import ObservationDetail from './ObservationDetail';

const DESC_CELL = { maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
import { buildDepartmentBreakdown, buildCategoryBreakdown, buildMonthlyTrend } from './chartData';
import GroupedBarChart from './GroupedBarChart';
import DonutChart from './DonutChart';
import TrendAreaChart from './TrendAreaChart';

export default function HodDashboardPage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSafetyObservationAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  // Reload when the HOD profile (department / shift) changes.
  const scope = `${user?.department}-${user?.shift || ''}`;

  const now = useSlaWatcher(() => {
    apiFetch('/observations').then(setObservations).catch(() => {});
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([apiFetch('/dashboard/summary'), apiFetch('/observations')])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setObservations(list);
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast, scope]);

  const q = query.trim().toLowerCase();
  const rows = observations.filter((o) => (
    (status === 'all' || o.status === status)
    && (!q || [o.observation_no, o.category, o.description, o.location, o.area]
      .some((f) => (f || '').toLowerCase().includes(q)))
  ));
  const who = user?.department === MANAGER
    ? `${user?.name} · Manager`
    : `${user?.name} · Shift ${user?.shift} HOD · ${user?.department}`;

  const openDetail = async (id) => {
    try {
      setSelected(await apiFetch(`/observations/${id}`));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const { departments, series } = useMemo(() => buildDepartmentBreakdown(observations), [observations]);
  const categorySlices = useMemo(() => buildCategoryBreakdown(observations), [observations]);
  const monthlyTrend = useMemo(() => buildMonthlyTrend(observations), [observations]);

  return (
    <div className="page-enter">
      <PageHeader
        title="HOD Dashboard"
        subtitle={user ? who : 'Safety observation reporting'}
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('so-hod-observations')}>
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
          <StatCard value={summary.total_observations} label="Total Observations" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={summary.open_count} label="Open" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
          <StatCard value={summary.under_review_count} label="Reassigned to Agent" variant="blue" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={summary.reported_this_month} label="Reported This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="two-col">
        <Panel noMargin>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Observations by Department</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>By review status</p>
          {loading ? <Skeleton height={220} radius={12} /> : <GroupedBarChart departments={departments} series={series} />}
        </Panel>

        <Panel noMargin accent="var(--so-primary)">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Observations by Category</h3>
          <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>All departments</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><Skeleton width={176} height={176} radius={176} /></div>
          ) : (
            <DonutChart slices={categorySlices} />
          )}
        </Panel>
      </div>

      <Panel noMargin style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Observations Reported</h3>
        <p style={{ fontSize: 12, color: 'var(--slate-500)', margin: '0 0 14px' }}>Last 6 months</p>
        {loading ? <Skeleton height={220} radius={12} /> : <TrendAreaChart points={monthlyTrend} />}
      </Panel>

      <Panel
        title={user?.department === MANAGER ? 'All Escalated Observations' : `All Observations — ${user?.department || ''}`}
        icon={<IconEye size={17} />}
        style={{ marginTop: 18 }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div className="field" style={{ width: 260 }}>
            <label>Search</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Number, category, description, location" />
          </div>
          <div className="field" style={{ width: 220 }}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(STATUS_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr><th>Observation No</th><th>Date &amp; Time</th><th>Category</th><th>Department</th><th>Observation</th><th>Severity</th><th>Status</th><th>Live Time</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                [0, 1, 2].map((i) => <tr key={i}><td colSpan={9}><Skeleton height={18} /></td></tr>)
              ) : (
                <>
                  {rows.map((o) => {
                    const meta = STATUS_META[o.status];
                    const sla = slaInfo(o, now);
                    return (
                      <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(o.id)}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{o.observation_no}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(o.created_at)}</td>
                        <td>{o.category}</td>
                        <td>{o.department || '—'}</td>
                        <td style={DESC_CELL} title={o.description || ''}>{o.description || '—'}</td>
                        <td>{o.severity}</td>
                        <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                        <td style={{ fontSize: 12.5, fontWeight: 700, color: sla ? SLA_COLORS[sla.tone] : 'var(--slate-400)', whiteSpace: 'nowrap' }}>{sla ? sla.text : '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '5px 12px' }}
                            onClick={(e) => { e.stopPropagation(); openDetail(o.id); }}
                          >
                            <IconEye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No observations found.</td></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!selected} title={selected ? selected.observation_no : ''} onClose={() => setSelected(null)} width={720}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ObservationDetail observation={selected} now={now} />
            <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={() => { setSelected(null); onNavigate('so-hod-observations'); }}>
                Take Action in Observations
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
