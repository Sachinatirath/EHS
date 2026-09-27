import { useCallback, useEffect, useState } from 'react';
import { useFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListFilters from '../../components/ListFilters';
import Skeleton from '../safetyviolation/Skeleton';
import { IconClipboard, IconCheckCircle, IconClock, IconPlus, IconEye, IconUsers } from '../../components/icons';
import { inDateRange } from '../../utils/dateRange';
import { INCHARGE_ROLES, closeAudit, getAudit, listAudits, signoffCount } from './store';
import AuditDetail from './AuditDetail';
import { STATUS_META, STATUS_FILTERS, formatDate } from './statusMeta';


export default function OfficerHomePage({ onNavigate, pushToast }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const focus = useFocusTarget('ma-officer-home', audits.map((x) => x.id), (id) => openDetail(id));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [closureNote, setClosureNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => listAudits().then(setAudits), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err) => { if (!cancelled) pushToast(err.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load, pushToast]);

  const openDetail = async (id) => {
    try {
      setSelected(await getAudit(id));
      setClosureNote('');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleClose = async () => {
    setSaving(true);
    try {
      const updated = await closeAudit(selected.id, { closure_note: closureNote.trim() });
      pushToast(`${updated.audit_no} closed.`, 'success');
      setSelected(null);
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const count = (status) => audits.filter((a) => a.status === status).length;
  const q = query.trim().toLowerCase();
  const rows = audits.filter((a) => (
    (filter === 'all' || a.status === filter)
    && inDateRange(a.created_at, from, to)
    && (!q || a.machine_name.toLowerCase().includes(q) || (a.machine_id || '').toLowerCase().includes(q))
  ));

  return (
    <div className="page-enter">
      <PageHeader
        title="My Machine Audits"
        subtitle={loading ? ' ' : `${audits.length} audits submitted`}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('ma-officer-create')}>
            <IconPlus /> New Machine Audit
          </button>
        )}
      />

      {loading ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={audits.length} label="Total Audits" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={count('pending_incharge')} label="With In-charges" variant="amber" icon={<IconUsers size={18} />} delay={40} />
          <StatCard value={count('ready_to_close')} label="Ready to Close" variant="blue" icon={<IconClock size={18} />} delay={80} />
          <StatCard value={count('closed')} label="Closed" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={STATUS_FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading}>
            <div className="field" style={{ width: 210 }}>
              <label>Search machine</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Machine name or ID" />
            </div>
          </ListFilters>

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Audit No</th><th>Submitted</th><th>Machine</th><th>Department</th><th>Non-compliance</th><th>In-charges Done</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => <tr key={i}><td colSpan={8}><Skeleton height={18} /></td></tr>)
                ) : (
                  <>
                    {rows.map((a) => {
                      const meta = STATUS_META[a.status];
                      const noCount = a.checklist.filter((r) => r.status === 'No').length;
                      return (
                        <tr key={a.id} {...focus.rowProps(a.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(a.id)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{a.audit_no}</td>
                          <td>{formatDate(a.created_at)}</td>
                          <td>{a.machine_name}{a.machine_id ? ` · ${a.machine_id}` : ''}</td>
                          <td>{a.department}</td>
                          <td>{noCount ? <span className="pill pill-red">{noCount} No</span> : '—'}</td>
                          <td>{signoffCount(a)} / {INCHARGE_ROLES.length}</td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${a.status === 'ready_to_close' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); openDetail(a.id); }}
                            >
                              <IconEye size={14} /> {a.status === 'ready_to_close' ? 'View & Close' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!rows.length && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No audits here.</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!selected} title={selected ? `${selected.audit_no} · ${selected.machine_name}` : ''} onClose={() => setSelected(null)} width={720}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <AuditDetail audit={selected} />
            {selected.status === 'ready_to_close' ? (
              <>
                <div className="field">
                  <label>Closure Note</label>
                  <textarea value={closureNote} onChange={(e) => setClosureNote(e.target.value)} placeholder="Verification done before closing this audit…" />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving} onClick={handleClose}>
                    <IconCheckCircle size={14} /> {saving ? 'Closing…' : 'Close Audit'}
                  </button>
                </div>
              </>
            ) : null}
            {selected.status === 'pending_incharge' ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--amber-600)', fontWeight: 600 }}>
                You can close this audit once all in-charges complete it. Waiting on: {INCHARGE_ROLES.filter(({ key }) => selected.signoffs[key].status !== 'completed').map((r) => r.label).join(', ')}.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
