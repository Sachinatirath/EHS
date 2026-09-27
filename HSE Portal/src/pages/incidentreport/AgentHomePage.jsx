import { useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Skeleton from './Skeleton';
import { IconClipboard, IconCheckCircle, IconClock, IconAlertTriangle, IconPlus, IconEye, IconDownload } from '../../components/icons';
import { apiFetch } from './store';
import IncidentDetail from './IncidentDetail';
import { STATUS_META, SEVERITY_META, formatDate } from './statusMeta';
import { exportIncidentsExcel } from '../../utils/incidentExcel';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_investigation', label: 'Under Investigation' },
  { key: 'closed', label: 'Closed' },
];

export default function AgentHomePage({ onNavigate, pushToast }) {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('ir-agent-home', incidents.map((x) => x.id), (id) => openDetail(id));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [opening, setOpening] = useState(false);

  const openDetail = async (id) => {
    setOpening(true);
    try {
      setSelected(await apiFetch(`/incidents/${id}`));
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setOpening(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([apiFetch('/dashboard/my-summary'), apiFetch('/incidents/mine')])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setIncidents(list);
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const q = query.trim().toLowerCase();
  const rows = incidents.filter((i) => (
    (filter === 'all' || i.status === filter)
    && inDateRange(i.created_at, from, to)
    && (!q || [i.incident_no, i.incident_type, i.department, i.description, i.location, i.reported_by, i.agent?.name]
      .some((f) => (f || '').toLowerCase().includes(q)))
  ));

  const exportExcel = async () => {
    setExporting(true);
    try {
      await exportIncidentsExcel(rows);
      pushToast(`Exported ${rows.length} incident${rows.length === 1 ? '' : 's'} to Excel.`, 'success');
    } catch (err) {
      pushToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="My Incident Reports"
        subtitle={summary ? `${summary.total_created} incidents reported` : ' '}
        actions={(
          <>
            <button type="button" className="btn btn-outline" disabled={exporting || loading || !rows.length} onClick={exportExcel}>
      <IconDownload size={15} /> {exporting ? 'Exporting…' : 'Export Excel'}
    </button>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('ir-agent-create')}>
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
          <StatCard value={summary.total_created} label="Total Reported" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={summary.open_count} label="Open" variant="amber" icon={<IconAlertTriangle size={18} />} delay={40} />
          <StatCard value={summary.under_investigation_count} label="Under Investigation" variant="blue" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={summary.closed_this_month} label="Closed This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading}>
            <div className="field" style={{ width: 210 }}>
              <label>Search incident</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Incident no, type, location…" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Incident No</th><th>Filed</th><th>Type</th><th>Department</th><th>Severity</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={7}><Skeleton height={18} /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {rows.map((i) => {
                      const meta = STATUS_META[i.status];
                      const sev = SEVERITY_META[i.severity];
                      return (
                        <tr key={i.id} {...focus.rowProps(i.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(i.id)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{i.incident_no}</td>
                          <td>{formatDate(i.created_at)}</td>
                          <td>{i.incident_type}</td>
                          <td>{i.department || '—'}</td>
                          <td><span className={`pill ${sev ? sev.pill : 'pill-slate'}`}>{i.severity}</span></td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '5px 12px' }}
                              disabled={opening}
                              onClick={(e) => { e.stopPropagation(); openDetail(i.id); }}
                            >
                              <IconEye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No incidents here.</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      <Modal open={!!selected} title={selected?.incident_no} onClose={() => setSelected(null)} width={600}>
        {selected ? <IncidentDetail incident={selected} /> : null}
      </Modal>
    </div>
  );
}
