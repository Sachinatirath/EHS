import { useCallback, useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Skeleton from './Skeleton';
import { IconClipboard, IconCheckCircle, IconClock, IconPlus, IconEye, IconDownload } from '../../components/icons';
import { apiFetch } from './store';
import ObservationDetail from './ObservationDetail';
import useSlaWatcher from './useSlaWatcher';
import { STATUS_META, SLA_COLORS, formatDateTime, slaInfo } from './statusMeta';
import { exportObservationsExcel } from '../../utils/observationExcel';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_review', label: 'Reassigned' },
  { key: 'escalated_manager', label: 'Escalated to Manager' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'closed', label: 'Closed' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AgentHomePage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('so-agent-home', observations.map((x) => x.id), (id) => openDetail(id));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const [selected, setSelected] = useState(null);
  const [opening, setOpening] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return Promise.all([apiFetch('/dashboard/my-summary'), apiFetch('/observations/mine')])
      .then(([s, list]) => {
        setSummary(s);
        setObservations(list);
      });
  }, []);

  const now = useSlaWatcher(() => {
    load();
    setSelected((cur) => {
      if (cur) apiFetch(`/observations/${cur.id}`).then(setSelected).catch(() => {});
      return cur;
    });
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err) => { if (!cancelled) pushToast(err.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load, pushToast]);

  const openDetail = async (id) => {
    setOpening(true);
    try {
      setSelected(await apiFetch(`/observations/${id}`));
      setClosureNote('');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setOpening(false);
    }
  };

  const closeObservation = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/observations/${selected.id}/close`, {
        method: 'POST',
        body: JSON.stringify({ closure_note: closureNote || undefined }),
      });
      pushToast(`${updated.observation_no} closed.`, 'success');
      setSelected(null);
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const q = query.trim().toLowerCase();
  const rows = observations.filter((o) => (
    (filter === 'all' || o.status === filter)
    && inDateRange(o.created_at, from, to)
    && (!q || [o.observation_no, o.category, o.department, o.description, o.location]
      .some((f) => (f || '').toLowerCase().includes(q)))
  ));

  const exportExcel = async () => {
    setExporting(true);
    try {
      await exportObservationsExcel(rows);
      pushToast(`Exported ${rows.length} observation${rows.length === 1 ? '' : 's'} to Excel.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="My Safety Observations"
        subtitle={summary ? `${summary.total_created} observation${summary.total_created === 1 ? '' : 's'} filed` : ' '}
        actions={(
          <>
            <button type="button" className="btn btn-outline" disabled={exporting || loading || !rows.length} onClick={exportExcel}>
      <IconDownload size={15} /> {exporting ? 'Exporting…' : 'Export Excel'}
    </button>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('so-agent-create')}>
              <IconPlus /> New
            </button>
          </>
        )}
      />

      {loading || !summary ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={summary.total_created} label="Total Filed" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={summary.open_count} label="Open" variant="amber" icon={<IconClock size={18} />} delay={40} />
          <StatCard value={summary.under_review_count} label="Reassigned to Me" variant="blue" icon={<IconClipboard size={18} />} delay={80} />
          <StatCard value={summary.closed_this_month} label="Closed This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading}>
            <div className="field" style={{ width: 210 }}>
              <label>Search observation</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Observation no, category…" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Observation No</th><th>Date &amp; Time</th><th>Category</th><th>Department</th><th>Observation</th><th>Severity</th><th>Status</th><th>Live Time</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={9}><Skeleton height={18} /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {rows.map((o) => {
                      const meta = STATUS_META[o.status];
                      const sla = slaInfo(o, now);
                      return (
                        <tr key={o.id} {...focus.rowProps(o.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(o.id)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{o.observation_no}</td>
                          <td style={{ minWidth: 92 }}>{formatDateTime(o.created_at)}</td>
                          <td>{o.category}</td>
                          <td>{o.department || '—'}</td>
                          <td style={{ maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.description || ''}>{o.description || '—'}</td>
                          <td>{o.severity}</td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td style={{ fontSize: 12.5, fontWeight: 700, color: sla ? SLA_COLORS[sla.tone] : 'var(--slate-400)', whiteSpace: 'nowrap' }}>{sla ? sla.text : '—'}</td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${o.status === 'under_review' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              disabled={opening}
                              onClick={(e) => { e.stopPropagation(); openDetail(o.id); }}
                            >
                              <IconEye size={14} /> {o.status === 'under_review' ? 'Close' : 'View'}
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
        </div>
      </div>

      <Modal open={!!selected} title={selected?.observation_no} onClose={() => setSelected(null)} width={600}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ObservationDetail observation={selected} now={now} />
            {selected.status === 'escalated' ? (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--orange-100)', color: 'var(--orange-600)', fontSize: 13, fontWeight: 600 }}>
                The SLA expired, so this observation was escalated to the HOD, who will close it.
              </div>
            ) : null}
            {selected.status === 'under_review' ? (
              <>
                <div className="field">
                  <label>Closure Note</label>
                  <textarea value={closureNote} onChange={(e) => setClosureNote(e.target.value)} placeholder="Describe the action you took to close this observation…" />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving} onClick={closeObservation}>
                    <IconCheckCircle size={14} /> {saving ? 'Closing…' : 'Close Observation'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
