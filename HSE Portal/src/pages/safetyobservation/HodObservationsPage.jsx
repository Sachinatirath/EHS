import { useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import PhotoPreview from '../../components/PhotoPreview';
import { IconCheckCircle, IconClose, IconEye, IconDownload } from '../../components/icons';
import { apiFetch, useSafetyObservationAuth, MANAGER } from './store';
import ObservationDetail from './ObservationDetail';
import useSlaWatcher from './useSlaWatcher';
import { STATUS_META, SLA_COLORS, SLA_OPTIONS, formatDateTime, slaInfo } from './statusMeta';
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

const closingInFuture = (o) => !!o?.closing_at && Date.parse(o.closing_at) > Date.now();

export default function HodObservationsPage({ pushToast }) {
  const isManager = useSafetyObservationAuth().user?.department === MANAGER;
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('so-hod-observations', observations.map((x) => x.id), (id) => openDetail({ id }));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [slaKey, setSlaKey] = useState('24');
  const [customDue, setCustomDue] = useState('');
  const [actionPhoto, setActionPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch('/observations')
      .then(setObservations)
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [pushToast]);

  const now = useSlaWatcher(() => {
    apiFetch('/observations').then(setObservations).catch(() => {});
    setSelected((cur) => {
      if (cur) apiFetch(`/observations/${cur.id}`).then(setSelected).catch(() => {});
      return cur;
    });
  });

  const q = query.trim().toLowerCase();
  const rows = observations.filter((o) => (
    (filter === 'all' || o.status === filter)
    && inDateRange(o.created_at, from, to)
    && (!q || [o.observation_no, o.category, o.department, o.description, o.location]
      .some((f) => (f || '').toLowerCase().includes(q)))
  ));

  const handleActionPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setActionPhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setActionPhoto(reader.result);
    reader.readAsDataURL(file);
  };

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

  const openDetail = async (observation) => {
    try {
      const detail = await apiFetch(`/observations/${observation.id}`);
      setSelected(detail);
      setNote('');
      setSlaKey(closingInFuture(detail) ? 'closing' : '24');
      setCustomDue('');
      setActionPhoto(null);
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const decide = async (status) => {
    let dueAt;
    if (status === 'under_review') {
      const hours = SLA_OPTIONS.find((o) => o.key === slaKey)?.hours;
      if (slaKey === 'closing' && closingInFuture(selected)) dueAt = selected.closing_at;
      else if (hours) dueAt = new Date(Date.now() + hours * 3600000).toISOString();
      else dueAt = customDue ? new Date(customDue).toISOString() : null;
      if (!dueAt) {
        pushToast('Pick the date and time by which the agent must close this.', 'error');
        return;
      }
      if (!actionPhoto) {
        pushToast('Attach a photo before reassigning this observation.', 'error');
        return;
      }
    }
    if (status === 'closed' && !actionPhoto) {
      pushToast('Attach a rectification image before closing this observation.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch(`/observations/${selected.id}/status`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          resolution_note: note || undefined,
          due_at: dueAt,
          review_photo_url: status === 'under_review' ? actionPhoto : undefined,
          closure_photo_url: status === 'closed' ? actionPhoto : undefined,
        }),
      });
      setObservations((list) => list.map((o) => (o.id === updated.id ? { ...o, status: updated.status, due_at: updated.due_at } : o)));
      pushToast(
        status === 'under_review'
          ? `${updated.observation_no} reassigned to ${updated.agent.name} — due ${new Date(updated.due_at).toLocaleString()}.`
          : (status === 'closed' ? `${updated.observation_no} closed.` : `${updated.observation_no} rejected.`),
        'success',
      );
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
        title="All Observations"
        subtitle={`${rows.length} observation${rows.length === 1 ? '' : 's'} across all agents`}
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
                        <tr key={o.id} {...focus.rowProps(o.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(o)}>
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
                              className={`btn ${o.status === 'open' || o.status === 'escalated_manager' || o.status === 'escalated' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); openDetail(o); }}
                            >
                              <IconEye size={14} /> {o.status === 'open' || o.status === 'escalated_manager' ? 'View & Review' : (o.status === 'escalated' ? 'View & Close' : 'View')}
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
            {selected.status === 'open' || selected.status === 'escalated_manager' ? (
              <>
                {selected.status === 'escalated_manager' ? (
                  <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--red-50)', color: 'var(--red-600)', fontSize: 13, fontWeight: 600 }}>
                    The {selected.department} HOD did not act by the closing time, so this observation has moved to the Manager.
                  </div>
                ) : null}
                <div className="field">
                  <label>{isManager ? 'Manager' : 'HOD'} Review Remarks</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instructions for the agent to act on before closing…" />
                </div>
                <div className="field">
                  <label>Assign with SLA — agent must close within</label>
                  <select value={slaKey} onChange={(e) => setSlaKey(e.target.value)}>
                    {closingInFuture(selected) ? (
                      <option value="closing">Observation closing time ({formatDateTime(selected.closing_at)})</option>
                    ) : null}
                    {SLA_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                  {slaKey === 'custom' ? (
                    <input type="datetime-local" style={{ marginTop: 8 }} value={customDue} onChange={(e) => setCustomDue(e.target.value)} />
                  ) : null}
                  <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 6 }}>
                    If the agent doesn&apos;t close it in time, it is escalated back to you to close.
                  </div>
                </div>
                <div className="field">
                  <label>Photo (required)</label>
                  <input type="file" accept="image/*" onChange={handleActionPhoto} />
                  {actionPhoto ? (
                    <div style={{ marginTop: 10 }}>
                      <PhotoPreview src={actionPhoto} alt="Attached photo preview" style={{ maxWidth: 260, maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--slate-200)' }} />
                    </div>
                  ) : null}
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving || !actionPhoto} onClick={() => decide('under_review')}>
                    <IconCheckCircle size={14} /> Submit & Reassign to Agent
                  </button>
                  <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => decide('rejected')}>
                    <IconClose size={12} /> Reject
                  </button>
                </div>
              </>
            ) : null}
            {selected.status === 'escalated' ? (
              <>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--orange-100)', color: 'var(--orange-600)', fontSize: 13, fontWeight: 600 }}>
                  The agent missed the SLA, so this observation is now assigned to you to close.
                </div>
                <div className="field">
                  <label>Rectification Note</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Action taken and reason for closing…" />
                </div>
                <div className="field">
                  <label>Rectification Image (required)</label>
                  <input type="file" accept="image/*" onChange={handleActionPhoto} />
                  {actionPhoto ? (
                    <div style={{ marginTop: 10 }}>
                      <PhotoPreview src={actionPhoto} alt="Rectification evidence preview" style={{ maxWidth: 260, maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--slate-200)' }} />
                    </div>
                  ) : null}
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving || !actionPhoto} onClick={() => decide('closed')}>
                    <IconCheckCircle size={14} /> Close Observation
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
