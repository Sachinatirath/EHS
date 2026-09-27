import { useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import { IconCheckCircle, IconClock, IconEye, IconDownload } from '../../components/icons';
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

export default function HodIncidentsPage({ pushToast }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('ir-hod-incidents', incidents.map((x) => x.id), (id) => { const row = incidents.find((x) => x.id === id); if (row) openDetail(row); });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch('/incidents')
      .then((list) => { if (!cancelled) setIncidents(list); })
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

  const openDetail = (row) => {
    setSelected({ ...row });
    setNote('');
    setDetailLoading(true);
    apiFetch(`/incidents/${row.id}`)
      .then((full) => setSelected(full))
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => setDetailLoading(false));
  };

  const decide = async (status) => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/incidents/${selected.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, resolution_note: note || undefined }),
      });
      setIncidents((list) => list.map((i) => (i.id === updated.id ? { ...i, status: updated.status } : i)));
      pushToast(`${updated.incident_no} marked ${STATUS_META[status].label.toLowerCase()}.`, 'success');
      setSelected(null);
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="All Incidents"
        subtitle={`${rows.length} incident${rows.length === 1 ? '' : 's'} across all agents`}
        actions={(
          <button type="button" className="btn btn-outline" disabled={exporting || loading || !rows.length} onClick={exportExcel}>
      <IconDownload size={15} /> {exporting ? 'Exporting…' : 'Export Excel'}
    </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo}>
            <div className="field" style={{ width: 210 }}>
              <label>Search incident</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Incident no, type, location…" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Incident No</th><th>Filed</th><th>Agent</th><th>Type</th><th>Department</th><th>Severity</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={8}><Skeleton height={18} /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {rows.map((i) => {
                      const meta = STATUS_META[i.status];
                      const sev = SEVERITY_META[i.severity];
                      return (
                        <tr key={i.id} {...focus.rowProps(i.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(i)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{i.incident_no}</td>
                          <td>{formatDate(i.created_at)}</td>
                          <td>{i.agent.name}</td>
                          <td>{i.incident_type}</td>
                          <td>{i.department || '—'}</td>
                          <td><span className={`pill ${sev ? sev.pill : 'pill-slate'}`}>{i.severity}</span></td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${i.status === 'closed' ? 'btn-outline' : 'btn-primary'}`}
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); openDetail(i); }}
                            >
                              <IconEye size={14} /> {i.status === 'closed' ? 'View' : 'View & Close'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>Nothing here.</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!selected} title={selected?.incident_no} onClose={() => setSelected(null)} width={600}>
        {selected && detailLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={18} />)}
          </div>
        ) : null}
        {selected && !detailLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <IncidentDetail incident={selected} />
            {selected.status !== 'closed' ? (
              <>
                <div className="field">
                  <label>{selected.status === 'open' ? 'Investigation / Closure Note' : 'Closure Note'}</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Findings, action taken and reason for closing…" />
                </div>
                <div className="btn-row">
                  {selected.status === 'open' ? (
                    <button type="button" className="btn btn-outline" disabled={saving} onClick={() => decide('under_investigation')}>
                      <IconClock size={14} /> Mark Under Investigation
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-success" disabled={saving} onClick={() => decide('closed')}>
                    <IconCheckCircle size={14} /> Close Incident
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
