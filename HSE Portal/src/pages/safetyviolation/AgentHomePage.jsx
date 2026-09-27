import { useCallback, useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Skeleton from './Skeleton';
import { PhotoButton } from '../../components/PhotoPreview';
import { IconClipboard, IconCheckCircle, IconClock, IconPlus, IconEye } from '../../components/icons';
import { apiFetch } from './store';
import ViolationDetail from './ViolationDetail';
import { STATUS_META, formatDate } from './statusMeta';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_review', label: 'Reassigned' },
  { key: 'closed', label: 'Closed' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AgentHomePage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('sv-agent-home', violations.map((x) => x.id), (id) => openDetail(id));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [opening, setOpening] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return Promise.all([apiFetch('/dashboard/my-summary'), apiFetch('/violations/mine')])
      .then(([s, list]) => {
        setSummary(s);
        setViolations(list);
      });
  }, []);

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
      setSelected(await apiFetch(`/violations/${id}`));
      setClosureNote('');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setOpening(false);
    }
  };

  const closeViolation = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/violations/${selected.id}/close`, {
        method: 'POST',
        body: JSON.stringify({ closure_note: closureNote || undefined }),
      });
      pushToast(`${updated.violation_no} closed.`, 'success');
      setSelected(null);
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const q = query.trim().toLowerCase();
  const rows = violations.filter((v) => (
    (filter === 'all' || v.status === filter)
    && inDateRange(v.created_at, from, to)
    && (!q || (v.employee_code || '').toLowerCase().includes(q) || (v.employee_name || '').toLowerCase().includes(q))
  ));

  return (
    <div className="page-enter">
      <PageHeader
        title="My Safety Violations"
        subtitle={summary ? `${summary.total_created} notices filed` : ' '}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('sv-agent-create')}>
            <IconPlus /> New
          </button>
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
              <label>Search employee</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Employee ID or name" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Violation No</th><th>Emp ID</th><th>Date</th><th>Type</th><th>Observation</th><th>Department</th><th>Status</th><th>Evidence Image</th><th>Action</th></tr>
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
                    {rows.map((v) => {
                      const meta = STATUS_META[v.status];
                      return (
                        <tr key={v.id} {...focus.rowProps(v.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(v.id)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{v.violation_no}</td>
                          <td>{v.employee_code || '—'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(v.created_at)}</td>
                          <td>{v.violation_type} · {v.offence}</td>
                          <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.description || ''}>{v.description || '—'}</td>
                          <td>{v.department}</td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td><PhotoButton src={v.photo_url} alt={`${v.violation_no} evidence`} /></td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${v.status === 'under_review' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              disabled={opening}
                              onClick={(e) => { e.stopPropagation(); openDetail(v.id); }}
                            >
                              <IconEye size={14} /> {v.status === 'under_review' ? 'View & Close' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No violations here.</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      <Modal open={!!selected} title={selected?.violation_no} onClose={() => setSelected(null)} width={600}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ViolationDetail violation={selected} />
            {selected.status === 'under_review' ? (
              <>
                <div className="field">
                  <label>Closure Note</label>
                  <textarea value={closureNote} onChange={(e) => setClosureNote(e.target.value)} placeholder="Describe the action you took to close this violation…" />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving} onClick={closeViolation}>
                    <IconCheckCircle size={14} /> {saving ? 'Closing…' : 'Close Violation'}
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
