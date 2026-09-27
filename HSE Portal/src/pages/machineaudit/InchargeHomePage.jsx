import { useCallback, useEffect, useState } from 'react';
import { useFocusTarget, peekFocusTarget } from '../../utils/focusTarget';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListFilters from '../../components/ListFilters';
import PhotoPreview from '../../components/PhotoPreview';
import Skeleton from '../safetyviolation/Skeleton';
import SignaturePad from '../safetyviolation/SignaturePad';
import { readImageAsDataUrl } from '../fastaid/imageUtil';
import { IconClipboard, IconCheckCircle, IconClock, IconEye } from '../../components/icons';
import { inDateRange } from '../../utils/dateRange';
import { completeSignoff, getAudit, listAudits, useMachineAuditAuth } from './store';
import AuditDetail from './AuditDetail';
import { STATUS_META, formatDate } from './statusMeta';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending My Action' },
  { key: 'completed', label: 'Completed by Me' },
  { key: 'closed', label: 'Closed' },
];

export default function InchargeHomePage({ pushToast }) {
  const { user } = useMachineAuditAuth();
  const myKey = user?.incharge;
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  // Arriving from an alert / My Tasks: show every audit so the target row is visible.
  const [filter, setFilter] = useState(() => (peekFocusTarget('ma-incharge-home') != null ? 'all' : 'pending'));
  const focus = useFocusTarget('ma-incharge-home', audits.map((x) => x.id), (id) => openDetail(id));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ note: '', photo_url: null, signature_data: null });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => listAudits().then(setAudits), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err) => { if (!cancelled) pushToast(err.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load, pushToast, myKey]);

  if (!user) return null;

  const mine = (a) => a.signoffs[myKey];
  const isPending = (a) => a.status !== 'closed' && mine(a).status === 'pending';
  const matches = (a) => {
    if (filter === 'pending') return isPending(a);
    if (filter === 'completed') return mine(a).status === 'completed';
    if (filter === 'closed') return a.status === 'closed';
    return true;
  };
  const rows = audits.filter((a) => matches(a) && inDateRange(a.created_at, from, to));

  const openDetail = async (id) => {
    try {
      setSelected(await getAudit(id));
      setForm({ note: '', photo_url: null, signature_data: null });
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const setPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photo_url = await readImageAsDataUrl(file);
      setForm((f) => ({ ...f, photo_url }));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleComplete = async () => {
    if (!form.signature_data) {
      pushToast('Sign before completing.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await completeSignoff(selected.id, { ...form, note: form.note.trim() || null });
      pushToast(
        updated.status === 'ready_to_close'
          ? `${updated.audit_no} completed — all in-charges done, sent to Safety Officer to close.`
          : `${updated.audit_no} completed.`,
        'success',
      );
      setSelected(null);
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title="Assigned Machine Audits" subtitle={`${user.name} · ${user.title}`} />

      {loading ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={audits.length} label="Assigned" variant="slate" icon={<IconClipboard size={18} />} delay={0} />
          <StatCard value={audits.filter(isPending).length} label="Pending My Action" variant="amber" icon={<IconClock size={18} />} delay={40} />
          <StatCard value={audits.filter((a) => mine(a).status === 'completed').length} label="Completed by Me" variant="blue" icon={<IconCheckCircle size={18} />} delay={80} />
          <StatCard value={audits.filter((a) => a.status === 'closed').length} label="Closed" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
        </div>
      )}

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading} />

          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr><th>Audit No</th><th>Submitted</th><th>Machine</th><th>Department</th><th>Safety Officer</th><th>My Part</th><th>Audit Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2, 3].map((i) => <tr key={i}><td colSpan={8}><Skeleton height={18} /></td></tr>)
                ) : (
                  <>
                    {rows.map((a) => {
                      const meta = STATUS_META[a.status];
                      const pending = isPending(a);
                      return (
                        <tr key={a.id} {...focus.rowProps(a.id)} style={{ cursor: 'pointer' }} onClick={() => openDetail(a.id)}>
                          <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{a.audit_no}</td>
                          <td>{formatDate(a.created_at)}</td>
                          <td>{a.machine_name}{a.machine_id ? ` · ${a.machine_id}` : ''}</td>
                          <td>{a.department}</td>
                          <td>{a.officer.name}</td>
                          <td>
                            {mine(a).status === 'completed'
                              ? <span className="pill pill-green">Completed</span>
                              : <span className={`pill ${pending ? 'pill-amber' : 'pill-slate'}`}>Pending</span>}
                          </td>
                          <td><span className={`pill ${meta.pill}`}>{meta.label}</span></td>
                          <td>
                            <button
                              type="button"
                              className={`btn ${pending ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '5px 12px' }}
                              onClick={(e) => { e.stopPropagation(); openDetail(a.id); }}
                            >
                              <IconEye size={14} /> {pending ? 'View & Complete' : 'View'}
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

      <Modal open={!!selected} title={selected ? `${selected.audit_no} · ${selected.machine_name}` : ''} onClose={() => setSelected(null)} width={720}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <AuditDetail audit={selected} />
            {isPending(selected) ? (
              <>
                <h4 style={{ margin: 0, fontSize: 14 }}>Complete as {user.title}</h4>
                <div className="field">
                  <label>Note (optional)</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="Action taken on the observation points…"
                  />
                </div>
                <div className="field">
                  <label>Attach Photo (optional)</label>
                  <input type="file" accept="image/*" onChange={setPhoto} />
                  {form.photo_url ? (
                    <div style={{ marginTop: 10 }}>
                      <PhotoPreview src={form.photo_url} alt="Action photo" style={{ maxWidth: 240, maxHeight: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--slate-200)' }} />
                    </div>
                  ) : null}
                </div>
                <div className="field">
                  <label>Name &amp; Sign of {user.title} — {user.name} *</label>
                  <SignaturePad onChange={(signature_data) => setForm((f) => ({ ...f, signature_data }))} />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-success" disabled={saving} onClick={handleComplete}>
                    <IconCheckCircle size={14} /> {saving ? 'Submitting…' : 'Complete & Submit'}
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
